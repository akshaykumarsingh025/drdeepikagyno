import './style.css'
import Alpine from 'alpinejs'

window.Alpine = Alpine

document.addEventListener('alpine:init', () => {
    Alpine.data('toolsData', () => ({
        activeTool: null,
        mobileMenuOpen: false,

        // ======================================================================
        // SHARED VALIDATION & UTILITY
        // ======================================================================
        validateName(name) {
            if (!name || !name.trim()) return 'Full name is required.'
            if (name.trim().length < 2) return 'Name must be at least 2 characters.'
            return ''
        },
        validatePhone(phone) {
            if (!phone || !phone.trim()) return 'Phone number is required.'
            const digits = phone.replace(/[\s\-\(\)\+]/g, '')
            if (!/^\d{10,12}$/.test(digits)) return 'Enter a valid 10-digit phone number.'
            if (digits.length === 10 && !/^[6-9]/.test(digits)) return 'Indian phone numbers must start with 6-9.'
            return ''
        },

        selectTool(toolId) { this.activeTool = toolId; window.scrollTo({ top: 0, behavior: 'smooth' }) },
        backToTools() { this.activeTool = null; window.scrollTo({ top: 0, behavior: 'smooth' }) },

        async submitLead(type, data) {
            try {
                await fetch('/api/submit-form', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type, data })
                })
            } catch (e) {}
        },

        // ======================================================================
        // SHARED PDF HELPERS (same pattern as fertility-score.js)
        // ======================================================================
        pdfColors: { teal: '#0d9488', dark: '#0f172a', slate: '#475569', muted: '#64748b', light: '#f8fafc', paleTeal: '#f0fdfa', amberBg: '#fef3c7', amberText: '#92400e', green: '#059669', amber: '#d97706', red: '#dc2626' },

        hexToRgb(hex) {
            const n = hex.replace('#', '')
            return [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)]
        },
        textColor(doc, hex) { doc.setTextColor(...this.hexToRgb(hex)) },
        fillColor(doc, hex) { doc.setFillColor(...this.hexToRgb(hex)) },
        drawColor(doc, hex) { doc.setDrawColor(...this.hexToRgb(hex)) },
        cleanText(val) { return String(val ?? '').replace(/\s+/g, ' ').trim() },

        addPdfPageFooter(doc, colors) {
            const pw = doc.internal.pageSize.getWidth(), ph = doc.internal.pageSize.getHeight(), m = 16, cnt = doc.internal.getNumberOfPages()
            for (let i = 1; i <= cnt; i++) {
                doc.setPage(i)
                doc.setFont('helvetica', 'normal'); doc.setFontSize(8)
                this.textColor(doc, '#94a3b8')
                doc.text('© 2026 Dr. Deepika Singh. All rights reserved. | drdeepikagyno.com', pw / 2, ph - 9, { align: 'center' })
                doc.text('Page ' + i + '/' + cnt, pw - m, ph - 9, { align: 'right' })
            }
        },

        async loadJsPDF() {
            if (!window.jspdf?.jsPDF) {
                await new Promise((resolve, reject) => {
                    const s = document.createElement('script')
                    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
                    s.crossOrigin = 'anonymous'; s.referrerPolicy = 'no-referrer'
                    s.onload = resolve; s.onerror = reject; document.body.appendChild(s)
                })
            }
        },

        writePdfHeader(doc, title, y) {
            const pw = doc.internal.pageSize.getWidth(), m = 16
            doc.setFont('helvetica', 'bold'); doc.setFontSize(22)
            this.textColor(doc, this.pdfColors.dark)
            doc.text('Dr. Deepika Singh', pw / 2, y, { align: 'center' }); y += 6
            doc.setFont('helvetica', 'normal'); doc.setFontSize(11)
            this.textColor(doc, this.pdfColors.teal)
            doc.text('Senior Consultant Gynecologist & Obstetrician', pw / 2, y, { align: 'center' }); y += 5
            doc.setFontSize(9)
            this.textColor(doc, this.pdfColors.muted)
            doc.text('MD (AIIMS) | FCLS | MCCOG | FOGSI | IFS | RCOG', pw / 2, y, { align: 'center' }); y += 6
            this.drawColor(doc, this.pdfColors.teal); doc.setLineWidth(0.7)
            doc.line(m, y, pw - m, y); y += 10
            doc.setFont('helvetica', 'bold'); doc.setFontSize(16)
            this.textColor(doc, this.pdfColors.teal)
            doc.text(title, pw / 2, y, { align: 'center' }); y += 9
            return y
        },

        writePdfPatient(doc, y, name, phone, mode) {
            const pw = doc.internal.pageSize.getWidth(), m = 16, cw = pw - 2 * m
            this.fillColor(doc, this.pdfColors.light)
            doc.rect(m, y, cw, 18, 'F')
            doc.setFontSize(10); doc.setFont('helvetica', 'normal')
            this.textColor(doc, this.pdfColors.muted)
            doc.text('Patient:', m + 4, y + 7); doc.text('Date:', m + 96, y + 7)
            doc.text('Mode:', m + 4, y + 14); doc.text('Phone:', m + 96, y + 14)
            doc.setFont('helvetica', 'bold')
            this.textColor(doc, this.pdfColors.dark)
            doc.text(this.cleanText(name) || 'Patient', m + 24, y + 7)
            doc.setFont('helvetica', 'normal')
            this.textColor(doc, this.pdfColors.slate)
            doc.text(new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }), m + 112, y + 7)
            doc.text((mode || 'Basic').replace(/^\w/, c => c.toUpperCase()), m + 24, y + 14)
            doc.text(this.cleanText(phone) || '-', m + 112, y + 14)
            return y + 26
        },

        writePdfConsultBox(doc, y) {
            const pw = doc.internal.pageSize.getWidth(), ph = doc.internal.pageSize.getHeight(), m = 16, cw = pw - 2 * m
            if (y + 45 > ph - 18) { this.addPdfPageFooter(doc, this.pdfColors); doc.addPage(); y = 16 }
            this.drawColor(doc, this.pdfColors.teal); doc.setLineWidth(0.7)
            doc.line(m, y, pw - m, y); y += 7
            doc.setFont('helvetica', 'bold'); doc.setFontSize(12)
            this.textColor(doc, this.pdfColors.dark)
            doc.text('Book a Consultation', pw / 2, y, { align: 'center' }); y += 7
            this.fillColor(doc, this.pdfColors.light)
            doc.rect(m, y, cw, 31, 'F')
            const lx = m + 4, rx = m + cw / 2 + 4
            doc.setFontSize(9); doc.setFont('helvetica', 'bold')
            this.textColor(doc, this.pdfColors.dark)
            doc.text('Dr. Deepika Singh', lx, y + 6)
            doc.text('Clinic Address', rx, y + 6)
            doc.text('Phone', lx, y + 18)
            doc.text('Email', rx, y + 18)
            doc.setFont('helvetica', 'normal')
            this.textColor(doc, this.pdfColors.muted)
            doc.text(['Senior Consultant Gynecologist', 'MD (AIIMS) | FCLS | MCCOG'], lx, y + 11)
            doc.text(['F-11, South Extension Part 1', 'New Delhi - 110049'], rx, y + 11)
            doc.text('+91 85959 54095 | WhatsApp: wa.me/918595954095', lx, y + 23)
            doc.text('drdipikasingh2026@gmail.com', rx, y + 23)
            doc.text('Mon-Sat: 10 AM - 8 PM | Sunday: 10 AM - 6 PM', lx, y + 29)
            return y + 39
        },

        writePdfDisclaimer(doc, y, text) {
            const pw = doc.internal.pageSize.getWidth(), ph = doc.internal.pageSize.getHeight(), m = 16, cw = pw - 2 * m
            if (y + 18 > ph - 18) { this.addPdfPageFooter(doc, this.pdfColors); doc.addPage(); y = 16 }
            this.fillColor(doc, this.pdfColors.amberBg)
            this.drawColor(doc, '#fcd34d')
            doc.roundedRect(m, y, cw, 16, 2, 2, 'FD')
            doc.setFont('helvetica', 'normal'); doc.setFontSize(8)
            this.textColor(doc, this.pdfColors.amberText)
            const disclaimer = text || 'DISCLAIMER: This tool provides an indicative assessment for educational purposes only. It is NOT a medical diagnosis. Please consult Dr. Deepika Singh for a comprehensive evaluation.'
            doc.text(doc.splitTextToSize(disclaimer, cw - 8), m + 4, y + 6)
            return y + 20
        },

        pdfSafeName(name) {
            return (name || 'Patient').replace(/[^a-z0-9_-]+/gi, '_').replace(/^_+|_+$/g, '')
        },

        // ======================================================================
        // TOOL 1: PCOS RISK SCREENER
        // ======================================================================
        pcos: {
            mode: 'basic', step: 0,
            patient: { name: '', phone: '', _honey: '' },
            patientError: { name: '', phone: '' },
            patientTouched: { name: false, phone: false },
            q1: '', q2: '', q3: '', q4: '', q5: '', q6: '', q7: '', q8: '', q9: '', q10: '',
            lab: { lhfsRatio: '', testosterone: '', fastingGlucose: '', fastingInsulin: '', ultrasound: '' },
            percentage: 0, riskLevel: '', riskData: null, recommendations: [],
            submitting: false, pdfGenerating: false, scoreAnimation: false,
            riskTiers: [
                { min: 0, max: 20, label: 'Low Risk', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', ring: '#10b981', message: 'Your PCOS risk indicators appear low. Maintain a healthy lifestyle with regular exercise and balanced nutrition. Continue routine gynecological check-ups.' },
                { min: 21, max: 40, label: 'Moderate Risk', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', ring: '#d97706', message: 'Some indicators suggest moderate PCOS risk. Consider tracking your symptoms and scheduling a consultation for hormonal evaluation.' },
                { min: 41, max: 60, label: 'High Risk', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', ring: '#ea580c', message: 'Multiple PCOS risk factors detected. A comprehensive evaluation including hormone testing and pelvic ultrasound is recommended.' },
                { min: 61, max: 100, label: 'Very High Risk', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', ring: '#dc2626', message: 'Significant PCOS indicators present. Please schedule an urgent consultation with Dr. Deepika Singh for diagnosis and treatment planning.' }
            ]
        },

        get pcosAnsweredCount() {
            const p = this.pcos; let c = 0
            if (p.q1) c++; if (p.q2) c++; if (p.q3) c++; if (p.q4) c++; if (p.q5) c++
            if (p.q6) c++; if (p.q7) c++; if (p.q8) c++; if (p.q9) c++; if (p.q10) c++
            return c
        },

        pcosGoNext() {
            const p = this.pcos
            p.patientTouched.name = true; p.patientTouched.phone = true
            p.patientError.name = this.validateName(p.patient.name)
            p.patientError.phone = this.validatePhone(p.patient.phone)
            if (p.patientError.name || p.patientError.phone) return
            p.step = 1; window.scrollTo({ top: 0, behavior: 'smooth' })
        },

        pcosStep2() {
            const p = this.pcos
            const required = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10']
            const allAnswered = required.every(q => p[q])
            if (!allAnswered) { alert('Please answer all 10 questions before proceeding.'); return }
            if (p.mode === 'advanced') { p.step = 2 } else { this.pcosCalculate() }
            window.scrollTo({ top: 0, behavior: 'smooth' })
        },

        async pcosCalculate() {
            const p = this.pcos
            p.submitting = true

            // Calculate score
            const scores = { q1: { regular: 0, slightly_irregular: 5, very_irregular: 10, absent: 12 }, q2: { none: 0, mild: 5, moderate: 10, severe: 15 }, q3: { none: 0, mild: 2, moderate: 6, severe_cystic: 10 }, q4: { none: 0, mild: 4, noticeable: 8, significant: 12 }, q5: { stable: 0, gradual: 4, rapid: 8, very_rapid: 10 }, q6: { no: 0, mild: 5, yes: 10 }, q7: { not_trying: 0, trying_under_1yr: 3, trying_1_2yr: 8, trying_over_2yr: 12 }, q8: { no: 0, pcos: 5, diabetes: 3, both: 8 }, q9: { none: 0, mild: 3, moderate: 5, severe: 8 }, q10: { no: 0, few: 3, many: 6 } }
            let total = 0
            for (const q of ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10']) total += (scores[q][p[q]] || 0)

            const lhfs = parseFloat(p.lab.lhfsRatio)
            if (!isNaN(lhfs) && lhfs > 0) { if (lhfs > 3) total += 15; else if (lhfs > 2) total += 8 }
            const testo = parseFloat(p.lab.testosterone)
            if (!isNaN(testo) && testo > 0) { if (testo > 80) total += 15; else if (testo >= 50) total += 8 }
            const gluc = parseFloat(p.lab.fastingGlucose)
            if (!isNaN(gluc) && gluc > 0) { if (gluc >= 126) total += 15; else if (gluc >= 100) total += 10 }
            const insulin = parseFloat(p.lab.fastingInsulin)
            if (!isNaN(insulin) && insulin > 0) { if (insulin > 15) total += 15; else if (insulin >= 10) total += 8 }
            if (p.lab.ultrasound === 'pcos') total += 15

            const hasLabs = p.mode === 'advanced' && (p.lab.lhfsRatio || p.lab.testosterone || p.lab.fastingGlucose || p.lab.fastingInsulin || p.lab.ultrasound)
            const maxTotal = hasLabs ? 178 : 103
            const pct = Math.min(100, Math.round((total / maxTotal) * 100))

            p.percentage = pct
            p.riskData = p.riskTiers.find(t => pct >= t.min && pct <= t.max) || p.riskTiers[p.riskTiers.length - 1]
            p.riskLevel = p.riskData.label

            // Recommendations
            const recs = []
            const highQ = (val, threshold) => { const v = { regular: 0, slightly_irregular: 1, very_irregular: 2, absent: 3, none: 0, mild: 1, moderate: 2, severe: 3, severe_cystic: 3, noticeable: 2, significant: 3, gradual: 1, rapid: 2, very_rapid: 3, no: 0, yes: 2, trying_under_1yr: 1, trying_1_2yr: 2, trying_over_2yr: 3, stable: 0, few: 1, many: 2 }; return (v[val] || 0) >= threshold }
            if (highQ(p.q1, 1)) recs.push('Irregular periods are a key PCOS indicator. Hormonal evaluation (LH, FSH, estradiol) is recommended.')
            if (highQ(p.q2, 1)) recs.push('Excess hair growth (hirsutism) suggests elevated androgens. Testosterone and DHEA-S testing may be needed.')
            if (highQ(p.q3, 1)) recs.push('Persistent acne can indicate hormonal imbalance. Anti-androgen therapy may help manage symptoms.')
            if (highQ(p.q4, 1)) recs.push('Hair thinning may be related to androgen excess or thyroid dysfunction. Thyroid panel and hormone testing recommended.')
            if (highQ(p.q5, 1)) recs.push('Weight gain is closely linked to insulin resistance in PCOS. Lifestyle modification and metabolic evaluation are important.')
            if (highQ(p.q6, 1)) recs.push('Dark skin patches (acanthosis nigricans) strongly suggest insulin resistance. Fasting glucose and HbA1c testing recommended.')
            if (highQ(p.q7, 2)) recs.push('Difficulty conceiving may indicate anovulation. Dr. Deepika Singh specializes in PCOS-related infertility treatment.')
            if (highQ(p.q9, 1)) recs.push('Mood changes are common with hormonal imbalances. Mental health support alongside medical treatment is beneficial.')
            if (p.mode === 'advanced' && parseFloat(p.lab.lhfsRatio) > 2) recs.push('Elevated LH:FSH ratio (>2:1) is a classic PCOS marker. Further endocrine evaluation recommended.')
            if (p.mode === 'advanced' && parseFloat(p.lab.fastingGlucose) >= 100) recs.push('Fasting glucose in prediabetic range. Metformin and lifestyle changes may be recommended by Dr. Deepika Singh.')
            if (recs.length === 0) recs.push('Your responses indicate low PCOS risk. Maintain a balanced diet, regular exercise, and annual gynecological check-ups.')
            p.recommendations = recs

            // Submit to Google Sheets
            await this.submitLead('pcos_screener', {
                name: p.patient.name, phone: p.patient.phone, mode: p.mode,
                q1: p.q1, q2: p.q2, q3: p.q3, q4: p.q4, q5: p.q5, q6: p.q6, q7: p.q7, q8: p.q8, q9: p.q9, q10: p.q10,
                lab_lhfs: p.lab.lhfsRatio, lab_testo: p.lab.testosterone, lab_glucose: p.lab.fastingGlucose,
                lab_insulin: p.lab.fastingInsulin, lab_us: p.lab.ultrasound,
                risk: p.percentage, riskLevel: p.riskLevel, _honey: p.patient._honey
            })

            p.step = 3; p.submitting = false
            setTimeout(() => { p.scoreAnimation = true }, 100)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        },

        pcosReset() {
            const p = this.pcos
            p.mode = 'basic'; p.step = 0
            p.q1 = ''; p.q2 = ''; p.q3 = ''; p.q4 = ''; p.q5 = ''; p.q6 = ''; p.q7 = ''; p.q8 = ''; p.q9 = ''; p.q10 = ''
            p.lab = { lhfsRatio: '', testosterone: '', fastingGlucose: '', fastingInsulin: '', ultrasound: '' }
            p.percentage = 0; p.riskLevel = ''; p.riskData = null; p.recommendations = []; p.scoreAnimation = false
            p.patient = { name: '', phone: '', _honey: '' }; p.patientError = { name: '', phone: '' }; p.patientTouched = { name: false, phone: false }
            window.scrollTo({ top: 0, behavior: 'smooth' })
        },

        async generatePcosPDF() {
            const p = this.pcos
            p.pdfGenerating = true
            try {
                await this.loadJsPDF()
                const { jsPDF } = window.jspdf
                const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
                const pw = doc.internal.pageSize.getWidth(), ph = doc.internal.pageSize.getHeight(), m = 16, cw = pw - 2 * m
                const C = this.pdfColors, clean = (v) => this.cleanText(v), titleCase = (v) => clean(v).replace(/^\w/, c => c.toUpperCase())
                let y = 16

                // Header
                y = this.writePdfHeader(doc, 'PCOS Risk Assessment Report', y)

                // Patient details
                this.fillColor(doc, C.light)
                doc.rect(m, y, cw, 18, 'F')
                doc.setFontSize(10); doc.setFont('helvetica', 'normal')
                this.textColor(doc, C.muted)
                doc.text('Patient:', m + 4, y + 7); doc.text('Date:', m + 96, y + 7)
                doc.text('Mode:', m + 4, y + 14); doc.text('Phone:', m + 96, y + 14)
                doc.setFont('helvetica', 'bold'); this.textColor(doc, C.dark)
                doc.text(clean(p.patient.name) || 'Patient', m + 24, y + 7)
                doc.setFont('helvetica', 'normal'); this.textColor(doc, C.slate)
                doc.text(new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }), m + 112, y + 7)
                doc.text(titleCase(p.mode), m + 24, y + 14)
                doc.text(clean(p.patient.phone) || '-', m + 112, y + 14)
                y += 26

                // Score card
                const scoreColor = p.riskData ? p.riskData.ring : C.red
                if (y + 42 > ph - 18) { this.addPdfPageFooter(doc, C); doc.addPage(); y = 16 }
                this.fillColor(doc, '#fef2f2'); this.drawColor(doc, scoreColor); doc.setLineWidth(0.5)
                doc.roundedRect(m, y, cw, 36, 3, 3, 'FD')
                doc.setFont('helvetica', 'normal'); doc.setFontSize(11)
                this.textColor(doc, C.muted)
                doc.text('Your PCOS Risk Score', pw / 2, y + 8, { align: 'center' })
                doc.setFont('helvetica', 'bold'); doc.setFontSize(30)
                this.textColor(doc, scoreColor)
                doc.text(p.percentage + '%', pw / 2, y + 21, { align: 'center' })
                this.fillColor(doc, scoreColor)
                doc.roundedRect(pw / 2 - 18, y + 24, 36, 7, 3, 3, 'F')
                doc.setFontSize(9); this.textColor(doc, '#ffffff')
                doc.text(clean(p.riskLevel), pw / 2, y + 29, { align: 'center' })
                y += 41

                if (p.riskData?.message) {
                    if (y + 14 > ph - 18) { this.addPdfPageFooter(doc, C); doc.addPage(); y = 16 }
                    doc.setFont('helvetica', 'normal'); doc.setFontSize(10)
                    this.textColor(doc, C.slate)
                    const lines = doc.splitTextToSize(clean(p.riskData.message), cw - 8)
                    doc.text(lines, m + 4, y); y += lines.length * 4.5 + 5
                }

                if (p.recommendations.length) {
                    if (y + 14 > ph - 18) { this.addPdfPageFooter(doc, C); doc.addPage(); y = 16 }
                    doc.setFont('helvetica', 'bold'); doc.setFontSize(12)
                    this.textColor(doc, C.dark)
                    doc.text('Personalized Recommendations', m, y); y += 6
                    doc.setFont('helvetica', 'normal'); doc.setFontSize(9)
                    this.textColor(doc, C.slate)
                    p.recommendations.forEach(rec => {
                        const lines = doc.splitTextToSize(clean(rec), cw - 7)
                        const bh = lines.length * 4.4 + 2
                        if (y + bh > ph - 18) { this.addPdfPageFooter(doc, C); doc.addPage(); y = 16 }
                        this.textColor(doc, C.teal); doc.text('•', m + 1, y)
                        this.textColor(doc, C.slate); doc.text(lines, m + 6, y)
                        y += bh
                    }); y += 5
                }

                y = this.writePdfConsultBox(doc, y)
                y = this.writePdfDisclaimer(doc, y)
                this.addPdfPageFooter(doc, C)
                doc.save('PCOS-Risk-Report-' + this.pdfSafeName(p.patient.name) + '.pdf')
            } catch (e) { console.error(e); alert('Could not generate PDF. Please try again.') }
            p.pdfGenerating = false
        },

        // ======================================================================
        // TOOL 2: DUE DATE & PREGNANCY CALCULATOR
        // ======================================================================
        duedate: {
            mode: 'basic', step: 0,
            patient: { name: '', phone: '', _honey: '' },
            patientError: { name: '', phone: '' },
            patientTouched: { name: false, phone: false },
            lmpDate: '', cycleLength: 28, conceptionDate: '',
            eddFormatted: '', gestWeeks: 0, gestDays: 0, trimester: '',
            weeksRemaining: 0, daysRemaining: 0, milestones: [], pdfGenerating: false
        },

        duedateGoNext() {
            const d = this.duedate
            d.patientTouched.name = true; d.patientTouched.phone = true
            d.patientError.name = this.validateName(d.patient.name)
            d.patientError.phone = this.validatePhone(d.patient.phone)
            if (d.patientError.name || d.patientError.phone) return
            d.step = 1; window.scrollTo({ top: 0, behavior: 'smooth' })
        },

        duedateCalculate() {
            const d = this.duedate
            if (!d.lmpDate) { alert('Please enter your last menstrual period date.'); return }
            const lmp = new Date(d.lmpDate + 'T00:00:00')
            const cl = parseInt(d.cycleLength) || 28
            const today = new Date(); today.setHours(0, 0, 0, 0)

            let edd
            if (d.mode === 'advanced' && d.conceptionDate) {
                const cd = new Date(d.conceptionDate + 'T00:00:00')
                edd = new Date(cd.getTime() + 266 * 86400000)
            } else {
                edd = new Date(lmp.getTime() + (280 - (28 - cl)) * 86400000)
            }
            const diffDays = Math.floor((today - lmp) / 86400000)
            const gw = Math.max(0, Math.floor(diffDays / 7)), gd = Math.max(0, diffDays % 7)
            const remainDays = Math.ceil((edd - today) / 86400000)
            const remainWeeks = Math.floor(remainDays / 7)
            let tr = '1st Trimester'
            if (gw >= 14 && gw < 28) tr = '2nd Trimester'
            else if (gw >= 28) tr = '3rd Trimester'

            const opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
            d.eddFormatted = edd.toLocaleDateString('en-IN', opts)
            d.gestWeeks = gw; d.gestDays = gd; d.trimester = tr
            d.weeksRemaining = remainWeeks; d.daysRemaining = remainDays
            d.milestones = [
                { week: 6, title: 'First Heartbeat', desc: "Baby's heart begins to beat on ultrasound. Schedule your first antenatal visit.", past: gw >= 6 },
                { week: 12, title: 'First Trimester Ends', desc: 'NT scan due. Risk of miscarriage drops significantly. Book your dating scan.', past: gw >= 12 },
                { week: 16, title: 'Quickening', desc: 'You may feel the first fetal movements. Start tracking kicks.', past: gw >= 16 },
                { week: 20, title: 'Anatomy Scan', desc: 'Detailed anomaly ultrasound. Know your baby\'s growth and development.', past: gw >= 20 },
                { week: 24, title: 'Viability Milestone', desc: 'Baby reaches potential for survival outside the womb.', past: gw >= 24 },
                { week: 28, title: 'Third Trimester', desc: 'Baby\'s lungs are maturing. Start antenatal visits every 2 weeks.', past: gw >= 28 },
                { week: 36, title: 'Early Term', desc: 'Baby is considered early term. Weekly check-ups recommended.', past: gw >= 36 },
                { week: 40, title: 'Due Date!', desc: 'Full term. Consult Dr. Deepika Singh for delivery planning.', past: gw >= 40 }
            ]

            this.submitLead('duedate_calculator', {
                name: d.patient.name, phone: d.patient.phone, mode: d.mode,
                lmp: d.lmpDate, cycleLength: cl, edd: d.eddFormatted, gestWeeks: gw, _honey: d.patient._honey
            })

            d.step = 2; window.scrollTo({ top: 0, behavior: 'smooth' })
        },

        duedateReset() {
            const d = this.duedate
            d.mode = 'basic'; d.step = 0; d.lmpDate = ''; d.cycleLength = 28; d.conceptionDate = ''
            d.eddFormatted = ''; d.gestWeeks = 0; d.gestDays = 0; d.trimester = ''
            d.weeksRemaining = 0; d.daysRemaining = 0; d.milestones = []
            d.patient = { name: '', phone: '', _honey: '' }; d.patientError = { name: '', phone: '' }; d.patientTouched = { name: false, phone: false }
            window.scrollTo({ top: 0, behavior: 'smooth' })
        },

        async generateDueDatePDF() {
            const d = this.duedate
            d.pdfGenerating = true
            try {
                await this.loadJsPDF()
                const { jsPDF } = window.jspdf
                const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
                const pw = doc.internal.pageSize.getWidth(), ph = doc.internal.pageSize.getHeight(), m = 16, cw = pw - 2 * m
                const C = this.pdfColors, clean = (v) => this.cleanText(v), titleCase = (v) => clean(v).replace(/^\w/, c => c.toUpperCase())
                let y = 16

                y = this.writePdfHeader(doc, 'Due Date & Pregnancy Report', y)

                // Patient details
                this.fillColor(doc, C.light)
                doc.rect(m, y, cw, 18, 'F')
                doc.setFontSize(10); doc.setFont('helvetica', 'normal')
                this.textColor(doc, C.muted)
                doc.text('Patient:', m + 4, y + 7); doc.text('Date:', m + 96, y + 7)
                doc.text('Mode:', m + 4, y + 14); doc.text('Phone:', m + 96, y + 14)
                doc.setFont('helvetica', 'bold'); this.textColor(doc, C.dark)
                doc.text(clean(d.patient.name) || 'Patient', m + 24, y + 7)
                doc.setFont('helvetica', 'normal'); this.textColor(doc, C.slate)
                doc.text(new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }), m + 112, y + 7)
                doc.text(titleCase(d.mode), m + 24, y + 14)
                doc.text(clean(d.patient.phone) || '-', m + 112, y + 14)
                y += 26

                // EDD card
                if (y + 42 > ph - 18) { this.addPdfPageFooter(doc, C); doc.addPage(); y = 16 }
                this.fillColor(doc, C.paleTeal); this.drawColor(doc, C.teal); doc.setLineWidth(0.5)
                doc.roundedRect(m, y, cw, 36, 3, 3, 'FD')
                doc.setFont('helvetica', 'normal'); doc.setFontSize(11)
                this.textColor(doc, C.muted)
                doc.text('Estimated Due Date', pw / 2, y + 8, { align: 'center' })
                doc.setFont('helvetica', 'bold'); doc.setFontSize(24)
                this.textColor(doc, C.teal)
                doc.text(clean(d.eddFormatted), pw / 2, y + 21, { align: 'center' })
                doc.setFontSize(9); doc.setFont('helvetica', 'normal'); this.textColor(doc, C.slate)
                doc.text('Based on ' + (d.mode === 'advanced' && d.conceptionDate ? 'conception date' : "Naegele's rule"), pw / 2, y + 29, { align: 'center' })
                y += 42

                // Stats grid
                const stats = [
                    ['Gestational Age', d.gestWeeks + 'w ' + d.gestDays + 'd'],
                    ['Trimester', d.trimester],
                    ['Weeks Remaining', d.weeksRemaining >= 0 ? d.weeksRemaining + ' weeks' : 'Past due'],
                    ['Days Remaining', d.daysRemaining >= 0 ? d.daysRemaining + ' days' : 'Past due date']
                ]
                if (y + 32 > ph - 18) { this.addPdfPageFooter(doc, C); doc.addPage(); y = 16 }
                stats.forEach((s, i) => {
                    const sx = m + (i % 2) * (cw / 2), sy = y + Math.floor(i / 2) * 16
                    this.fillColor(doc, C.light)
                    doc.rect(sx, sy, cw / 2 - 2, 14, 'F')
                    doc.setFont('helvetica', 'normal'); doc.setFontSize(8)
                    this.textColor(doc, C.muted); doc.text(s[0], sx + 4, sy + 5)
                    doc.setFont('helvetica', 'bold'); doc.setFontSize(11)
                    this.textColor(doc, C.dark); doc.text(s[1], sx + 4, sy + 12)
                })
                y += 36

                // Milestones
                if (d.milestones.length) {
                    if (y + 14 > ph - 18) { this.addPdfPageFooter(doc, C); doc.addPage(); y = 16 }
                    doc.setFont('helvetica', 'bold'); doc.setFontSize(12)
                    this.textColor(doc, C.dark)
                    doc.text('Key Milestones', m, y); y += 6
                    d.milestones.forEach(ms => {
                        if (y + 8 > ph - 18) { this.addPdfPageFooter(doc, C); doc.addPage(); y = 16 }
                        doc.setFont('helvetica', 'bold'); doc.setFontSize(9)
                        this.textColor(doc, ms.past ? C.muted : C.teal)
                        doc.text('Week ' + ms.week, m + 2, y)
                        this.textColor(doc, ms.past ? C.muted : C.dark)
                        doc.text(ms.title, m + 22, y)
                        doc.setFont('helvetica', 'normal'); doc.setFontSize(8)
                        this.textColor(doc, C.slate)
                        doc.text(ms.desc, m + 22, y + 4)
                        y += 9
                    }); y += 4
                }

                y = this.writePdfConsultBox(doc, y)
                this.addPdfPageFooter(doc, C)
                doc.save('DueDate-Report-' + this.pdfSafeName(d.patient.name) + '.pdf')
            } catch (e) { console.error(e); alert('Could not generate PDF. Please try again.') }
            d.pdfGenerating = false
        },

        // ======================================================================
        // TOOL 3: PERIOD & OVULATION TRACKER
        // ======================================================================
        period: {
            mode: 'basic', step: 0,
            patient: { name: '', phone: '', _honey: '' },
            patientError: { name: '', phone: '' },
            patientTouched: { name: false, phone: false },
            lastPeriodDate: '', cycleLength: 28, periodDuration: 5, lutealPhase: 14,
            nextPeriodFormatted: '', nextPeriodDays: 0,
            ovulationFormatted: '', ovulationDays: 0,
            fertileStartFormatted: '', fertileEndFormatted: '',
            phases: [], predictions: [], pdfGenerating: false
        },

        periodGoNext() {
            const p = this.period
            p.patientTouched.name = true; p.patientTouched.phone = true
            p.patientError.name = this.validateName(p.patient.name)
            p.patientError.phone = this.validatePhone(p.patient.phone)
            if (p.patientError.name || p.patientError.phone) return
            p.step = 1; window.scrollTo({ top: 0, behavior: 'smooth' })
        },

        periodCalculate() {
            const p = this.period
            if (!p.lastPeriodDate) { alert('Please enter your last period start date.'); return }
            const lmp = new Date(p.lastPeriodDate + 'T00:00:00')
            const cl = parseInt(p.cycleLength) || 28
            const pd = parseInt(p.periodDuration) || 5
            const lp = parseInt(p.lutealPhase) || 14
            const today = new Date(); today.setHours(0, 0, 0, 0)
            const opts = { weekday: 'short', month: 'short', day: 'numeric' }

            const nextPeriod = new Date(lmp.getTime() + cl * 86400000)
            const ovDay = new Date(nextPeriod.getTime() - lp * 86400000)
            const fertileStart = new Date(ovDay.getTime() - 5 * 86400000)
            const fertileEnd = new Date(ovDay.getTime() + 1 * 86400000)
            const periodEnd = new Date(lmp.getTime() + pd * 86400000)

            p.nextPeriodFormatted = nextPeriod.toLocaleDateString('en-IN', opts)
            p.nextPeriodDays = Math.max(0, Math.ceil((nextPeriod - today) / 86400000))
            p.ovulationFormatted = ovDay.toLocaleDateString('en-IN', opts)
            p.ovulationDays = Math.max(0, Math.ceil((ovDay - today) / 86400000))
            p.fertileStartFormatted = fertileStart.toLocaleDateString('en-IN', opts)
            p.fertileEndFormatted = fertileEnd.toLocaleDateString('en-IN', opts)
            p.phases = [
                { name: 'Menstrual Phase', dates: lmp.toLocaleDateString('en-IN', opts) + ' - ' + periodEnd.toLocaleDateString('en-IN', opts), icon: '🩸', colorClass: 'bg-rose-100 text-rose-600', current: today >= lmp && today <= periodEnd },
                { name: 'Follicular Phase', dates: new Date(periodEnd.getTime() + 86400000).toLocaleDateString('en-IN', opts) + ' - ' + new Date(ovDay.getTime() - 86400000).toLocaleDateString('en-IN', opts), icon: '🌱', colorClass: 'bg-purple-100 text-purple-600', current: today > periodEnd && today < ovDay },
                { name: 'Ovulation Day', dates: ovDay.toLocaleDateString('en-IN', opts), icon: '⭐', colorClass: 'bg-amber-100 text-amber-600', current: today.toDateString() === ovDay.toDateString() },
                { name: 'Luteal Phase', dates: new Date(ovDay.getTime() + 86400000).toLocaleDateString('en-IN', opts) + ' - ' + new Date(nextPeriod.getTime() - 86400000).toLocaleDateString('en-IN', opts), icon: '🌙', colorClass: 'bg-teal-100 text-teal-600', current: today > ovDay && today < nextPeriod }
            ]
            if (p.mode === 'advanced') {
                p.predictions = [
                    { period: nextPeriod.toLocaleDateString('en-IN', opts), ovulation: ovDay.toLocaleDateString('en-IN', opts), fertile: fertileStart.toLocaleDateString('en-IN', opts) + ' - ' + fertileEnd.toLocaleDateString('en-IN', opts) },
                    { period: new Date(lmp.getTime() + cl * 2 * 86400000).toLocaleDateString('en-IN', opts), ovulation: new Date(lmp.getTime() + cl * 2 * 86400000 - lp * 86400000).toLocaleDateString('en-IN', opts), fertile: new Date(lmp.getTime() + cl * 2 * 86400000 - (lp + 5) * 86400000).toLocaleDateString('en-IN', opts) + ' - ' + new Date(lmp.getTime() + cl * 2 * 86400000 - (lp - 1) * 86400000).toLocaleDateString('en-IN', opts) },
                    { period: new Date(lmp.getTime() + cl * 3 * 86400000).toLocaleDateString('en-IN', opts), ovulation: new Date(lmp.getTime() + cl * 3 * 86400000 - lp * 86400000).toLocaleDateString('en-IN', opts), fertile: new Date(lmp.getTime() + cl * 3 * 86400000 - (lp + 5) * 86400000).toLocaleDateString('en-IN', opts) + ' - ' + new Date(lmp.getTime() + cl * 3 * 86400000 - (lp - 1) * 86400000).toLocaleDateString('en-IN', opts) }
                ]
            }

            this.submitLead('period_tracker', { name: p.patient.name, phone: p.patient.phone, mode: p.mode, lastPeriod: p.lastPeriodDate, cycleLength: cl, nextPeriod: p.nextPeriodFormatted, ovulation: p.ovulationFormatted, _honey: p.patient._honey })
            p.step = 2; window.scrollTo({ top: 0, behavior: 'smooth' })
        },

        periodReset() {
            const p = this.period
            p.mode = 'basic'; p.step = 0; p.lastPeriodDate = ''; p.cycleLength = 28; p.periodDuration = 5; p.lutealPhase = 14
            p.nextPeriodFormatted = ''; p.nextPeriodDays = 0; p.ovulationFormatted = ''; p.ovulationDays = 0
            p.fertileStartFormatted = ''; p.fertileEndFormatted = ''; p.phases = []; p.predictions = []
            p.patient = { name: '', phone: '', _honey: '' }; p.patientError = { name: '', phone: '' }; p.patientTouched = { name: false, phone: false }
            window.scrollTo({ top: 0, behavior: 'smooth' })
        },

        async generatePeriodPDF() {
            const p = this.period
            p.pdfGenerating = true
            try {
                await this.loadJsPDF()
                const { jsPDF } = window.jspdf
                const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
                const pw = doc.internal.pageSize.getWidth(), ph = doc.internal.pageSize.getHeight(), m = 16, cw = pw - 2 * m
                const C = this.pdfColors, clean = (v) => this.cleanText(v), titleCase = (v) => clean(v).replace(/^\w/, c => c.toUpperCase())
                let y = 16

                y = this.writePdfHeader(doc, 'Period & Ovulation Report', y)

                // Patient details
                this.fillColor(doc, C.light)
                doc.rect(m, y, cw, 18, 'F')
                doc.setFontSize(10); doc.setFont('helvetica', 'normal')
                this.textColor(doc, C.muted)
                doc.text('Patient:', m + 4, y + 7); doc.text('Date:', m + 96, y + 7)
                doc.text('Mode:', m + 4, y + 14); doc.text('Phone:', m + 96, y + 14)
                doc.setFont('helvetica', 'bold'); this.textColor(doc, C.dark)
                doc.text(clean(p.patient.name) || 'Patient', m + 24, y + 7)
                doc.setFont('helvetica', 'normal'); this.textColor(doc, C.slate)
                doc.text(new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }), m + 112, y + 7)
                doc.text(titleCase(p.mode), m + 24, y + 14)
                doc.text(clean(p.patient.phone) || '-', m + 112, y + 14)
                y += 26

                // Key dates
                if (y + 30 > ph - 18) { this.addPdfPageFooter(doc, C); doc.addPage(); y = 16 }
                const dates = [['Next Period', p.nextPeriodFormatted, 'in ' + p.nextPeriodDays + ' days'], ['Ovulation Day', p.ovulationFormatted, 'in ' + p.ovulationDays + ' days'], ['Fertile Window', p.fertileStartFormatted + ' - ' + p.fertileEndFormatted, '']]
                dates.forEach((d, i) => {
                    const sx = m + i * (cw / 3), sw = cw / 3 - 2
                    this.fillColor(doc, i === 1 ? '#fff1f2' : i === 2 ? '#fef3c7' : '#f5f3ff')
                    doc.roundedRect(sx, y, sw, 22, 2, 2, 'F')
                    doc.setFont('helvetica', 'normal'); doc.setFontSize(7)
                    this.textColor(doc, C.muted); doc.text(d[0], sx + sw / 2, y + 5, { align: 'center' })
                    doc.setFont('helvetica', 'bold'); doc.setFontSize(8)
                    this.textColor(doc, i === 1 ? '#e11d48' : i === 2 ? '#d97706' : '#7c3aed')
                    doc.text(d[1], sx + sw / 2, y + 12, { align: 'center' })
                    doc.setFontSize(7); this.textColor(doc, C.slate)
                    doc.text(d[2], sx + sw / 2, y + 17, { align: 'center' })
                })
                y += 28

                // Phases
                if (y + 14 > ph - 18) { this.addPdfPageFooter(doc, C); doc.addPage(); y = 16 }
                doc.setFont('helvetica', 'bold'); doc.setFontSize(12)
                this.textColor(doc, C.dark)
                doc.text('Cycle Phases', m, y); y += 6
                p.phases.forEach(ph => {
                    if (y + 8 > ph - 18) { this.addPdfPageFooter(doc, C); doc.addPage(); y = 16 }
                    doc.setFont('helvetica', 'bold'); doc.setFontSize(9)
                    this.textColor(doc, C.dark)
                    doc.text(ph.name + (ph.current ? ' (Current)' : ''), m + 4, y)
                    doc.setFont('helvetica', 'normal'); doc.setFontSize(8)
                    this.textColor(doc, C.slate)
                    doc.text(ph.dates, m + 4, y + 4)
                    y += 8
                })
                y += 4

                if (p.predictions.length) {
                    if (y + 14 > ph - 18) { this.addPdfPageFooter(doc, C); doc.addPage(); y = 16 }
                    doc.setFont('helvetica', 'bold'); doc.setFontSize(12)
                    this.textColor(doc, C.dark)
                    doc.text('Next 3 Cycle Predictions', m, y); y += 6
                    p.predictions.forEach((pr, i) => {
                        doc.setFont('helvetica', 'normal'); doc.setFontSize(8)
                        this.textColor(doc, C.slate)
                        doc.text('Cycle ' + (i + 2) + ': Period ' + pr.period + ' | Ovulation ' + pr.ovulation, m + 4, y); y += 5
                    }); y += 4
                }

                y = this.writePdfConsultBox(doc, y)
                this.addPdfPageFooter(doc, C)
                doc.save('Period-Report-' + this.pdfSafeName(p.patient.name) + '.pdf')
            } catch (e) { console.error(e); alert('Could not generate PDF. Please try again.') }
            p.pdfGenerating = false
        },

        // ======================================================================
        // TOOL 4: BMI & PCOS WEIGHT RISK
        // ======================================================================
        bmiData: {
            mode: 'basic', step: 0,
            patient: { name: '', phone: '', _honey: '' },
            patientError: { name: '', phone: '' },
            patientTouched: { name: false, phone: false },
            height: '', weight: '', waistCircumference: '',
            symptomCheck: { irregularPeriods: false, excessHair: false, acne: false, weightGain: false, darkPatches: false },
            resultBmi: 0, resultBmiCategory: '',
            pcosRiskScore: null, pcosRiskLevel: '',
            bmiScore: 0, waistScore: 0, symptomScore: 0,
            recommendations: [], pdfGenerating: false
        },

        get bmiDataLive() {
            const h = parseFloat(this.bmiData.height), w = parseFloat(this.bmiData.weight)
            if (h > 0 && w > 0) return Math.round((w / ((h / 100) * (h / 100))) * 10) / 10
            return null
        },
        get bmiDataLiveCategory() {
            const b = this.bmiDataLive; if (b === null) return ''
            if (b < 18.5) return 'Underweight'; if (b < 23) return 'Normal Weight'
            if (b < 27.5) return 'Overweight'; if (b < 32.5) return 'Obese Class I'
            return 'Obese Class II+'
        },

        bmiGoNext() {
            const b = this.bmiData
            b.patientTouched.name = true; b.patientTouched.phone = true
            b.patientError.name = this.validateName(b.patient.name)
            b.patientError.phone = this.validatePhone(b.patient.phone)
            if (b.patientError.name || b.patientError.phone) return
            b.step = 1; window.scrollTo({ top: 0, behavior: 'smooth' })
        },

        bmiCalculate() {
            const b = this.bmiData
            const h = parseFloat(b.height), w = parseFloat(b.weight)
            if (!h || !w || h < 100 || w < 20) { alert('Please enter valid height and weight.'); return }
            const bmi = Math.round((w / ((h / 100) * (h / 100))) * 10) / 10
            let cat = 'Underweight'
            if (bmi >= 18.5 && bmi < 23) cat = 'Normal Weight'
            else if (bmi >= 23 && bmi < 27.5) cat = 'Overweight'
            else if (bmi >= 27.5 && bmi < 32.5) cat = 'Obese Class I'
            else if (bmi >= 32.5) cat = 'Obese Class II+'
            b.resultBmi = bmi; b.resultBmiCategory = cat

            // Advanced PCOS risk
            if (b.mode === 'advanced') {
                let bs = 0, ws = 0, ss = 0
                if (bmi >= 27.5) bs = 40; else if (bmi >= 23) bs = 15; else if (bmi < 18.5) bs = 10; else bs = 0
                const wc = parseFloat(b.waistCircumference)
                if (!isNaN(wc) && wc > 0) { if (wc > 88) ws = 30; else if (wc >= 80) ws = 15; else ws = 0 }
                const sc = b.symptomCheck
                let symptomCount = 0
                if (sc.irregularPeriods) symptomCount++; if (sc.excessHair) symptomCount++
                if (sc.acne) symptomCount++; if (sc.weightGain) symptomCount++; if (sc.darkPatches) symptomCount++
                if (symptomCount >= 3) ss = 30; else if (symptomCount >= 2) ss = 15; else if (symptomCount >= 1) ss = 8
                const total = bs + ws + ss
                b.bmiScore = bs; b.waistScore = ws; b.symptomScore = ss; b.pcosRiskScore = total
                b.pcosRiskLevel = total <= 25 ? 'Low' : total <= 50 ? 'Moderate' : total <= 75 ? 'High' : 'Very High'
            }

            const recs = []
            if (bmi < 18.5) recs.push('Your BMI indicates underweight (<18.5). Adequate nutrition is important for hormonal balance and fertility. Consider a consultation for dietary guidance.')
            else if (bmi >= 23 && bmi < 27.5) recs.push('Your BMI indicates overweight (Asia-Pacific: 23-27.4). Even 5-10% weight loss can significantly improve PCOS symptoms and fertility outcomes.')
            else if (bmi >= 27.5) recs.push('Your BMI indicates obesity (≥27.5). Weight management through diet and exercise is strongly recommended. Dr. Deepika Singh can provide a personalized plan.')
            else recs.push('Your BMI is in the healthy range. Maintain regular exercise (150 min/week) and a balanced diet to support hormonal health.')

            if (b.mode === 'advanced') {
                const wc = parseFloat(b.waistCircumference)
                if (!isNaN(wc) && wc > 88) recs.push('Waist circumference above 88cm indicates substantially increased metabolic risk. Cardiovascular screening and lifestyle modification recommended.')
                else if (!isNaN(wc) && wc >= 80) recs.push('Waist circumference is borderline (80-88cm). Regular physical activity can help reduce central obesity.')
                if (b.symptomCheck.irregularPeriods) recs.push('Irregular periods combined with weight issues suggest possible PCOS. Hormonal evaluation (LH, FSH, AMH, testosterone) recommended.')
                if (b.symptomCheck.darkPatches) recs.push('Dark skin patches (acanthosis nigricans) strongly indicate insulin resistance. Fasting glucose, HbA1c, and fasting insulin testing recommended.')
                if (b.symptomCheck.excessHair || b.symptomCheck.acne) recs.push('Androgen-related symptoms with weight issues strongly suggest PCOS. Consult Dr. Deepika Singh for comprehensive evaluation.')
            }
            b.recommendations = recs

            this.submitLead('bmi_pcos_risk', { name: b.patient.name, phone: b.patient.phone, mode: b.mode, height: h, weight: w, bmi: bmi, bmiCategory: cat, waist: b.waistCircumference, pcosRiskScore: b.pcosRiskScore, pcosRiskLevel: b.pcosRiskLevel, _honey: b.patient._honey })
            b.step = 2; window.scrollTo({ top: 0, behavior: 'smooth' })
        },

        bmiReset() {
            const b = this.bmiData
            b.mode = 'basic'; b.step = 0; b.height = ''; b.weight = ''; b.waistCircumference = ''
            b.symptomCheck = { irregularPeriods: false, excessHair: false, acne: false, weightGain: false, darkPatches: false }
            b.resultBmi = 0; b.resultBmiCategory = ''; b.pcosRiskScore = null; b.pcosRiskLevel = ''
            b.bmiScore = 0; b.waistScore = 0; b.symptomScore = 0; b.recommendations = []
            b.patient = { name: '', phone: '', _honey: '' }; b.patientError = { name: '', phone: '' }; b.patientTouched = { name: false, phone: false }
            window.scrollTo({ top: 0, behavior: 'smooth' })
        },

        async generateBmiPDF() {
            const b = this.bmiData
            b.pdfGenerating = true
            try {
                await this.loadJsPDF()
                const { jsPDF } = window.jspdf
                const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
                const pw = doc.internal.pageSize.getWidth(), ph = doc.internal.pageSize.getHeight(), m = 16, cw = pw - 2 * m
                const C = this.pdfColors, clean = (v) => this.cleanText(v), titleCase = (v) => clean(v).replace(/^\w/, c => c.toUpperCase())
                let y = 16

                y = this.writePdfHeader(doc, 'BMI & PCOS Weight Risk Report', y)

                // Patient details
                this.fillColor(doc, C.light)
                doc.rect(m, y, cw, 18, 'F')
                doc.setFontSize(10); doc.setFont('helvetica', 'normal')
                this.textColor(doc, C.muted)
                doc.text('Patient:', m + 4, y + 7); doc.text('Date:', m + 96, y + 7)
                doc.text('Mode:', m + 4, y + 14); doc.text('Phone:', m + 96, y + 14)
                doc.setFont('helvetica', 'bold'); this.textColor(doc, C.dark)
                doc.text(clean(b.patient.name) || 'Patient', m + 24, y + 7)
                doc.setFont('helvetica', 'normal'); this.textColor(doc, C.slate)
                doc.text(new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }), m + 112, y + 7)
                doc.text(titleCase(b.mode), m + 24, y + 14)
                doc.text(clean(b.patient.phone) || '-', m + 112, y + 14)
                y += 26

                // BMI card
                if (y + 40 > ph - 18) { this.addPdfPageFooter(doc, C); doc.addPage(); y = 16 }
                const bmiScoreColor = b.resultBmiCategory === 'Normal Weight' ? C.green : C.amber
                this.fillColor(doc, '#fef3c7'); this.drawColor(doc, bmiScoreColor); doc.setLineWidth(0.5)
                doc.roundedRect(m, y, cw, 34, 3, 3, 'FD')
                doc.setFont('helvetica', 'normal'); doc.setFontSize(11)
                this.textColor(doc, C.muted)
                doc.text('Body Mass Index (Asia-Pacific)', pw / 2, y + 7, { align: 'center' })
                doc.setFont('helvetica', 'bold'); doc.setFontSize(26)
                this.textColor(doc, bmiScoreColor)
                doc.text(String(b.resultBmi), pw / 2 - 20, y + 18, { align: 'right' })
                doc.setFontSize(14); this.textColor(doc, C.slate)
                doc.text(b.resultBmiCategory, pw / 2 - 14, y + 18)
                doc.setFontSize(8); this.textColor(doc, C.muted)
                doc.text('Asian BMI cutoffs applied (WHO Asia-Pacific)', pw / 2, y + 27, { align: 'center' })
                y += 40

                // PCOS risk score (advanced)
                if (b.mode === 'advanced' && b.pcosRiskScore !== null) {
                    if (y + 30 > ph - 18) { this.addPdfPageFooter(doc, C); doc.addPage(); y = 16 }
                    doc.setFont('helvetica', 'bold'); doc.setFontSize(12)
                    this.textColor(doc, C.dark)
                    doc.text('PCOS Weight Impact Score: ' + b.pcosRiskScore + '/100 - ' + b.pcosRiskLevel + ' Risk', m, y); y += 7
                    doc.setFont('helvetica', 'normal'); doc.setFontSize(9)
                    this.textColor(doc, C.slate)
                    doc.text('BMI Contribution: ' + b.bmiScore + '/40 | Waist Risk: ' + b.waistScore + '/30 | Symptom Score: ' + b.symptomScore + '/30', m, y); y += 8
                }

                // Recommendations
                if (b.recommendations.length) {
                    if (y + 14 > ph - 18) { this.addPdfPageFooter(doc, C); doc.addPage(); y = 16 }
                    doc.setFont('helvetica', 'bold'); doc.setFontSize(12)
                    this.textColor(doc, C.dark)
                    doc.text('Personalized Recommendations', m, y); y += 6
                    doc.setFont('helvetica', 'normal'); doc.setFontSize(9)
                    this.textColor(doc, C.slate)
                    b.recommendations.forEach(rec => {
                        const lines = doc.splitTextToSize(clean(rec), cw - 7)
                        const bh = lines.length * 4.4 + 2
                        if (y + bh > ph - 18) { this.addPdfPageFooter(doc, C); doc.addPage(); y = 16 }
                        this.textColor(doc, C.teal); doc.text('•', m + 1, y)
                        this.textColor(doc, C.slate); doc.text(lines, m + 6, y)
                        y += bh
                    }); y += 5
                }

                y = this.writePdfConsultBox(doc, y)
                y = this.writePdfDisclaimer(doc, y)
                this.addPdfPageFooter(doc, C)
                doc.save('BMI-PCOS-Risk-Report-' + this.pdfSafeName(b.patient.name) + '.pdf')
            } catch (e) { console.error(e); alert('Could not generate PDF. Please try again.') }
            b.pdfGenerating = false
        },

        // ======================================================================
        // TOOL 5: FERTILITY SCORE
        // ======================================================================
        fert: {
            currentStep: 1, totalSteps: 4, mode: 'basic',
            patient: { name: '', phone: '', _honey: '' },
            patientError: { name: '', phone: '' },
            patientTouched: { name: false, phone: false },
            basic: { age: '', menstrualRegularity: '', periodPain: '', height: '', weight: '', conditions: [], smoking: '', stress: '', pregnancyHistory: '', familyHistory: '' },
            basicError: { age: '', menstrualRegularity: '', periodPain: '', height: '', weight: '', smoking: '', stress: '', pregnancyHistory: '', familyHistory: '' },
            basicTouched: { age: false, menstrualRegularity: false, periodPain: false, height: false, weight: false, smoking: false, stress: false, pregnancyHistory: false, familyHistory: false },
            lab: { amh: '', fsh: '', lh: '', tsh: '', prolactin: '', afc: '', vitaminD: '', hemoglobin: '' },
            score: null, tier: null, tierData: null, parameterResults: [], recommendations: [],
            submitting: false, pdfGenerating: false, showResults: false, scoreAnimation: false,
            tiers: [
                { min: 85, max: 100, label: 'Excellent', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', ring: '#10b981', message: 'Your fertility indicators look strong. Maintain a healthy lifestyle and schedule regular check-ups.' },
                { min: 70, max: 84, label: 'Good', color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-200', ring: '#0d9488', message: 'Generally favorable profile with minor areas that can be optimized for better outcomes.' },
                { min: 50, max: 69, label: 'Moderate', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', ring: '#d97706', message: 'Some factors may need attention. A consultation with Dr. Deepika Singh is recommended.' },
                { min: 30, max: 49, label: 'Below Average', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', ring: '#ea580c', message: 'Multiple risk factors detected. A professional fertility evaluation is strongly recommended.' },
                { min: 0, max: 29, label: 'Needs Attention', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', ring: '#dc2626', message: 'Significant concerns identified. Please schedule a consultation with Dr. Deepika Singh soon.' }
            ],
            recommendationMap: {
                age: { low: 'Age is an important factor in fertility. Consider consulting Dr. Deepika Singh for age-appropriate fertility assessment and family planning guidance.', medium: 'Your age is favorable. Continue maintaining good reproductive health with regular gynecological check-ups.' },
                menstrualRegularity: { low: 'Irregular menstrual cycles may indicate hormonal imbalances. A thorough evaluation including hormone profiling is recommended.', medium: 'Your menstrual cycle is fairly regular. Track your cycles to identify any patterns of irregularity.' },
                periodPain: { low: 'Severe period pain may indicate underlying conditions like endometriosis or fibroids. Please consult Dr. Deepika Singh for evaluation.', medium: 'Moderate period pain is manageable. If it worsens, consult your gynecologist.' },
                bmi: { low: 'Your BMI is outside the optimal range. Maintaining a healthy weight can positively impact fertility. Consider a consultation for personalized guidance.', medium: 'Your BMI is in a healthy range. Keep up with regular exercise and balanced nutrition.' },
                conditions: { low: 'Your diagnosed condition(s) may affect fertility. Dr. Deepika Singh specializes in managing PCOS, thyroid disorders, endometriosis, and fibroids with personalized treatment plans.', medium: 'No diagnosed conditions. Continue preventive care with regular gynecological screenings.' },
                smoking: { low: 'Smoking can significantly impact fertility. Consider smoking cessation programs. Dr. Deepika Singh can provide guidance and support.', medium: 'Good that you don\'t smoke. Avoid exposure to second-hand smoke as well.' },
                stress: { low: 'High stress levels can affect hormonal balance and fertility. Consider stress management techniques like yoga, meditation, or counseling.', medium: 'Your stress levels are manageable. Continue with healthy coping mechanisms.' },
                pregnancyHistory: { low: 'Your pregnancy history suggests a need for thorough fertility evaluation. Dr. Deepika Singh can help assess and address any underlying factors.', medium: 'Your reproductive history is favorable. Continue with regular follow-ups.' },
                familyHistory: { low: 'Family history of fertility issues suggests genetic or hereditary factors may be relevant. A comprehensive evaluation is recommended.', medium: 'No family history of fertility issues. Continue with routine care.' },
                amh: { low: 'Low AMH may indicate reduced ovarian reserve. Please discuss fertility preservation and treatment options with Dr. Deepika Singh.', medium: 'Your AMH level is satisfactory. Regular monitoring is recommended.' },
                fsh: { low: 'Elevated FSH levels may suggest diminished ovarian reserve. A comprehensive fertility assessment is recommended.', medium: 'Your FSH level is within normal range. Continue regular monitoring.' },
                lh: { low: 'Elevated LH levels may indicate PCOS or ovulatory dysfunction. Further evaluation by Dr. Deepika Singh is recommended.', medium: 'Your LH level is within normal range.' },
                tsh: { low: 'Abnormal TSH levels may affect fertility. Thyroid management is important for reproductive health. Consult Dr. Deepika Singh.', medium: 'Your TSH is well-controlled in the optimal range.' },
                prolactin: { low: 'Elevated prolactin levels may affect ovulation. Please consult Dr. Deepika Singh for evaluation and management.', medium: 'Your prolactin level is within normal range.' },
                afc: { low: 'Low antral follicle count may indicate reduced ovarian reserve. Consider consulting Dr. Deepika Singh for fertility planning.', medium: 'Your AFC is favorable. Continue regular monitoring.' },
                vitaminD: { low: 'Vitamin D deficiency is common and may impact fertility. Consider supplementation after consulting Dr. Deepika Singh.', medium: 'Your Vitamin D level is adequate. Maintain sun exposure and dietary sources.' },
                hemoglobin: { low: 'Low hemoglobin (anemia) can affect overall health and fertility. Please consult Dr. Deepika Singh for management.', medium: 'Your hemoglobin is at a healthy level. Maintain a balanced diet rich in iron.' }
            }
        },

        get fertBmi() {
            const h = parseFloat(this.fert.basic.height), w = parseFloat(this.fert.basic.weight)
            if (h > 0 && w > 0) return Math.round((w / ((h / 100) * (h / 100))) * 10) / 10
            return null
        },
        get fertBmiCategory() {
            const b = this.fertBmi; if (b === null) return ''
            if (b < 18.5) return 'Underweight'; if (b < 25) return 'Normal'; if (b < 30) return 'Overweight'; return 'Obese'
        },

        fertValidateBasicField(field, value) {
            switch (field) {
                case 'age': { if (!value) return 'Age is required.'; const a = parseInt(value); return (isNaN(a) || a < 18 || a > 55) ? 'Enter valid age (18-55).' : '' }
                case 'menstrualRegularity': return value ? '' : 'Please select menstrual regularity.'
                case 'periodPain': return value ? '' : 'Please select period pain level.'
                case 'height': { if (!value) return ''; const h = parseFloat(value); return (isNaN(h) || h < 100 || h > 250) ? 'Enter valid height (100-250 cm).' : '' }
                case 'weight': { if (!value) return ''; const w = parseFloat(value); return (isNaN(w) || w < 30 || w > 200) ? 'Enter valid weight (30-200 kg).' : '' }
                case 'smoking': return value ? '' : 'Please select smoking status.'
                case 'stress': return value ? '' : 'Please select stress level.'
                case 'pregnancyHistory': return value ? '' : 'Please select pregnancy history.'
                case 'familyHistory': return value ? '' : 'Please select family history.'
                default: return ''
            }
        },

        fertValidateBasic() {
            const f = this.fert; const fields = ['age', 'menstrualRegularity', 'periodPain', 'height', 'weight', 'smoking', 'stress', 'pregnancyHistory', 'familyHistory']
            let ok = true
            fields.forEach(field => { f.basicTouched[field] = true; f.basicError[field] = this.fertValidateBasicField(field, f.basic[field]); if (f.basicError[field]) ok = false })
            return ok
        },

        fertCanProceed() { return !this.validateName(this.fert.patient.name) && !this.validatePhone(this.fert.patient.phone) },

        fertNextStep() {
            const f = this.fert
            if (f.currentStep === 1) {
                f.patientTouched.name = true; f.patientTouched.phone = true
                f.patientError.name = this.validateName(f.patient.name)
                f.patientError.phone = this.validatePhone(f.patient.phone)
                if (f.patientError.name || f.patientError.phone) return
            }
            if (f.currentStep === 2) {
                if (!this.fertValidateBasic()) return
                if (f.mode === 'basic') { this.fertCalculate(); return }
            }
            if (f.currentStep < f.totalSteps) { f.currentStep++; window.scrollTo({ top: 0, behavior: 'smooth' }) }
        },

        fertPrevStep() { if (this.fert.currentStep > 1) { this.fert.currentStep--; window.scrollTo({ top: 0, behavior: 'smooth' }) } },
        fertGoToStep(s) { if (s < this.fert.currentStep) { this.fert.currentStep = s; window.scrollTo({ top: 0, behavior: 'smooth' }) } },
        fertToggleCondition(c) { const i = this.fert.basic.conditions.indexOf(c); if (i > -1) this.fert.basic.conditions.splice(i, 1); else this.fert.basic.conditions.push(c) },

        fertCalculateBasicScore() {
            const f = this.fert.basic
            const age = parseInt(f.age)
            let ageScore = 100
            if (age > 25 && age <= 30) ageScore = 95; else if (age <= 34) ageScore = 85; else if (age <= 37) ageScore = 65; else if (age <= 40) ageScore = 45; else if (age <= 43) ageScore = 25; else if (age >= 44) ageScore = 10
            const menstrualScore = { regular: 100, slightly_irregular: 60, very_irregular: 20 }[f.menstrualRegularity] || 0
            const painScore = { none_mild: 100, moderate: 70, severe: 40 }[f.periodPain] || 0
            const bmi = this.fertBmi
            let bmiScore = 0
            if (bmi !== null) { if (bmi >= 18.5 && bmi <= 24.9) bmiScore = 100; else if (bmi <= 29.9) bmiScore = 70; else if (bmi >= 30) bmiScore = 40; else if (bmi < 18.5) bmiScore = 50 }
            let conditionsScore = 100
            const cond = f.conditions
            if (cond.length > 0) { let total = 0; if (cond.includes('pcos')) total += 50; if (cond.includes('thyroid')) total += 40; if (cond.includes('endometriosis')) total += 60; if (cond.includes('fibroids')) total += 45; const avg = total / cond.length; conditionsScore = Math.max(0, 100 - (100 - avg) * (1 + (cond.length - 1) * 0.3)) }
            const smokingScore = { never: 100, quit: 80, current: 30 }[f.smoking] || 0
            const stressScore = { low: 100, moderate: 70, high: 40 }[f.stress] || 0
            const pregScore = { successful: 100, complications: 70, trying: 30, never: 80 }[f.pregnancyHistory] || 0
            const familyScore = { no: 100, yes: 50 }[f.familyHistory] || 0
            const w = { age: 0.30, menstrualRegularity: 0.20, periodPain: 0.05, bmi: 0.10, conditions: 0.15, smoking: 0.05, stress: 0.05, pregnancyHistory: 0.05, familyHistory: 0.05 }
            const raw = (ageScore * w.age) + (menstrualScore * w.menstrualRegularity) + (painScore * w.periodPain) + (bmiScore * w.bmi) + (conditionsScore * w.conditions) + (smokingScore * w.smoking) + (stressScore * w.stress) + (pregScore * w.pregnancyHistory) + (familyScore * w.familyHistory)
            return { total: Math.round(raw), parameters: [{ name: 'Age', score: ageScore, weight: w.age, key: 'age' }, { name: 'Menstrual Regularity', score: menstrualScore, weight: w.menstrualRegularity, key: 'menstrualRegularity' }, { name: 'Period Pain', score: painScore, weight: w.periodPain, key: 'periodPain' }, { name: 'BMI', score: bmiScore, weight: w.bmi, key: 'bmi' }, { name: 'Diagnosed Conditions', score: conditionsScore, weight: w.conditions, key: 'conditions' }, { name: 'Smoking', score: smokingScore, weight: w.smoking, key: 'smoking' }, { name: 'Stress Level', score: stressScore, weight: w.stress, key: 'stress' }, { name: 'Pregnancy History', score: pregScore, weight: w.pregnancyHistory, key: 'pregnancyHistory' }, { name: 'Family History', score: familyScore, weight: w.familyHistory, key: 'familyHistory' }] }
        },

        fertCalcAdvanced(basicResult) {
            const params = [...basicResult.parameters], labScores = [], lab = this.fert.lab
            const pushLab = (name, score, weight, key) => { if (true) labScores.push({ name, score, weight, key }) }
            const amh = parseFloat(lab.amh); if (!isNaN(amh) && amh >= 0) { let s = 10; if (amh > 3) s = 100; else if (amh >= 1.5) s = 80; else if (amh >= 1) s = 55; else if (amh >= 0.5) s = 30; pushLab('AMH Level', s, 0.15, 'amh') }
            const fsh = parseFloat(lab.fsh); if (!isNaN(fsh) && fsh >= 0) { let s = 15; if (fsh < 8) s = 100; else if (fsh <= 10) s = 75; else if (fsh <= 15) s = 45; pushLab('FSH Level', s, 0.10, 'fsh') }
            const lh = parseFloat(lab.lh); if (!isNaN(lh) && lh >= 0) { let s = (lh >= 2 && lh <= 15) ? 100 : 50; pushLab('LH Level', s, 0.05, 'lh') }
            const tsh = parseFloat(lab.tsh); if (!isNaN(tsh) && tsh >= 0) { let s = 30; if (tsh >= 0.5 && tsh <= 2.5) s = 100; else if (tsh <= 4.5) s = 70; pushLab('TSH Level', s, 0.05, 'tsh') }
            const prolactin = parseFloat(lab.prolactin); if (!isNaN(prolactin) && prolactin >= 0) { let s = prolactin < 25 ? 100 : prolactin <= 50 ? 60 : 20; pushLab('Prolactin', s, 0.03, 'prolactin') }
            const afc = parseFloat(lab.afc); if (!isNaN(afc) && afc >= 0) { let s = 15; if (afc > 15) s = 100; else if (afc >= 10) s = 80; else if (afc >= 5) s = 50; pushLab('Antral Follicle Count', s, 0.07, 'afc') }
            const vd = parseFloat(lab.vitaminD); if (!isNaN(vd) && vd >= 0) { let s = vd > 30 ? 100 : vd >= 20 ? 70 : 40; pushLab('Vitamin D', s, 0.03, 'vitaminD') }
            const hb = parseFloat(lab.hemoglobin); if (!isNaN(hb) && hb >= 0) { let s = hb > 12 ? 100 : hb >= 10 ? 65 : 30; pushLab('Hemoglobin', s, 0.02, 'hemoglobin') }
            if (labScores.length === 0) return { total: basicResult.total, parameters: params }
            const totalLabWeight = labScores.reduce((s, p) => s + p.weight, 0)
            const basicWeightTotal = params.reduce((s, p) => s + p.weight, 0)
            const rf = 1 / (basicWeightTotal + totalLabWeight)
            let finalScore = 0; const allParams = [...params, ...labScores]
            allParams.forEach(p => { const aw = p.weight * rf; finalScore += p.score * aw; p.finalWeight = aw })
            return { total: Math.round(finalScore), parameters: allParams }
        },

        async fertCalculate() {
            const f = this.fert
            const basicResult = this.fertCalculateBasicScore()
            const finalResult = f.mode === 'advanced' ? this.fertCalcAdvanced(basicResult) : basicResult
            f.score = finalResult.total
            f.tierData = f.tiers.find(t => f.score >= t.min && f.score <= t.max) || f.tiers[f.tiers.length - 1]
            f.tier = f.tierData.label
            f.parameterResults = finalResult.parameters.filter(p => p.score > 0)
            f.recommendations = []
            finalResult.parameters.forEach(p => {
                const map = f.recommendationMap[p.key]
                if (!map) return
                if (p.score < 60) f.recommendations.push(map.low || '')
                else if (p.score < 85) f.recommendations.push(map.medium || '')
            })
            f.recommendations = f.recommendations.filter(r => r)
            f.showResults = true; f.currentStep = 4
            setTimeout(() => { f.scoreAnimation = true }, 100)

            await this.submitLead('fertility_score', {
                name: f.patient.name, phone: f.patient.phone, mode: f.mode, age: f.basic.age,
                bmi: this.fertBmi, menstrualRegularity: f.basic.menstrualRegularity, periodPain: f.basic.periodPain,
                conditions: f.basic.conditions.join(', '), smoking: f.basic.smoking, stress: f.basic.stress,
                pregnancyHistory: f.basic.pregnancyHistory, familyHistory: f.basic.familyHistory,
                amh: f.lab.amh, fsh: f.lab.fsh, lh: f.lab.lh, tsh: f.lab.tsh, prolactin: f.lab.prolactin,
                afc: f.lab.afc, vitaminD: f.lab.vitaminD, hemoglobin: f.lab.hemoglobin,
                score: f.score, tier: f.tier, _honey: f.patient._honey
            })
            window.scrollTo({ top: 0, behavior: 'smooth' })
        },

        fertReset() {
            const f = this.fert
            f.currentStep = 1; f.mode = 'basic'; f.score = null; f.tier = null; f.tierData = null; f.parameterResults = []; f.recommendations = []; f.showResults = false; f.scoreAnimation = false
            f.patient = { name: '', phone: '', _honey: '' }; f.patientError = { name: '', phone: '' }; f.patientTouched = { name: false, phone: false }
            f.basic = { age: '', menstrualRegularity: '', periodPain: '', height: '', weight: '', conditions: [], smoking: '', stress: '', pregnancyHistory: '', familyHistory: '' }
            f.basicError = { age: '', menstrualRegularity: '', periodPain: '', height: '', weight: '', smoking: '', stress: '', pregnancyHistory: '', familyHistory: '' }
            f.basicTouched = { age: false, menstrualRegularity: false, periodPain: false, height: false, weight: false, smoking: false, stress: false, pregnancyHistory: false, familyHistory: false }
            f.lab = { amh: '', fsh: '', lh: '', tsh: '', prolactin: '', afc: '', vitaminD: '', hemoglobin: '' }
            window.scrollTo({ top: 0, behavior: 'smooth' })
        },

        async fertGeneratePDF() {
            const f = this.fert
            f.pdfGenerating = true
            try {
                await this.loadJsPDF()
                const { jsPDF } = window.jspdf
                const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
                const pw = doc.internal.pageSize.getWidth(), ph = doc.internal.pageSize.getHeight(), m = 16, cw = pw - 2 * m
                const C = this.pdfColors, clean = (v) => this.cleanText(v), titleCase = (v) => clean(v).replace(/^\w/, c => c.toUpperCase())
                let y = 16

                y = this.writePdfHeader(doc, 'Fertility Wellness Report', y)

                // Patient details
                this.fillColor(doc, C.light)
                doc.rect(m, y, cw, 18, 'F')
                doc.setFontSize(10); doc.setFont('helvetica', 'normal')
                this.textColor(doc, C.muted)
                doc.text('Patient:', m + 4, y + 7); doc.text('Date:', m + 96, y + 7)
                doc.text('Mode:', m + 4, y + 14); doc.text('Phone:', m + 96, y + 14)
                doc.setFont('helvetica', 'bold'); this.textColor(doc, C.dark)
                doc.text(clean(f.patient.name) || 'Patient', m + 24, y + 7)
                doc.setFont('helvetica', 'normal'); this.textColor(doc, C.slate)
                doc.text(new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }), m + 112, y + 7)
                doc.text(titleCase(f.mode), m + 24, y + 14)
                doc.text(clean(f.patient.phone) || '-', m + 112, y + 14)
                y += 26

                // Score card
                const scoreColor = f.tierData ? f.tierData.ring : C.teal
                if (y + 42 > ph - 18) { this.addPdfPageFooter(doc, C); doc.addPage(); y = 16 }
                this.fillColor(doc, C.paleTeal); this.drawColor(doc, scoreColor); doc.setLineWidth(0.5)
                doc.roundedRect(m, y, cw, 36, 3, 3, 'FD')
                doc.setFont('helvetica', 'normal'); doc.setFontSize(11)
                this.textColor(doc, C.muted)
                doc.text('Your Fertility Score', pw / 2, y + 8, { align: 'center' })
                doc.setFont('helvetica', 'bold'); doc.setFontSize(30)
                this.textColor(doc, scoreColor)
                doc.text(String(f.score), pw / 2 - 4, y + 21, { align: 'right' })
                doc.setFontSize(11); this.textColor(doc, '#94a3b8')
                doc.text('/ 100', pw / 2 - 2, y + 21)
                this.fillColor(doc, scoreColor)
                doc.roundedRect(pw / 2 - 18, y + 24, 36, 7, 3, 3, 'F')
                doc.setFontSize(9); this.textColor(doc, '#ffffff')
                doc.text(clean(f.tier), pw / 2, y + 29, { align: 'center' })
                y += 41

                if (f.tierData?.message) {
                    if (y + 14 > ph - 18) { this.addPdfPageFooter(doc, C); doc.addPage(); y = 16 }
                    doc.setFont('helvetica', 'normal'); doc.setFontSize(10)
                    this.textColor(doc, C.slate)
                    const lines = doc.splitTextToSize(clean(f.tierData.message), cw - 8)
                    doc.text(lines, m + 4, y); y += lines.length * 4.5 + 5
                }

                // Parameter table
                if (f.parameterResults.length) {
                    if (y + 20 > ph - 18) { this.addPdfPageFooter(doc, C); doc.addPage(); y = 16 }
                    doc.setFont('helvetica', 'bold'); doc.setFontSize(12)
                    this.textColor(doc, C.dark)
                    doc.text('Parameter Breakdown', m, y); y += 5
                    this.fillColor(doc, C.teal)
                    doc.rect(m, y, cw, 8, 'F')
                    doc.setFontSize(9); this.textColor(doc, '#ffffff')
                    doc.text('Parameter', m + 3, y + 5.3)
                    doc.text('Score', m + 124, y + 5.3, { align: 'right' })
                    doc.text('Status', m + cw - 3, y + 5.3, { align: 'right' })
                    y += 8

                    f.parameterResults.forEach((param, index) => {
                        const sc = Math.round(Number(param.score) || 0)
                        if (y + 8 > ph - 18) { this.addPdfPageFooter(doc, C); doc.addPage(); y = 16 }
                        this.fillColor(doc, index % 2 === 0 ? C.light : '#ffffff')
                        doc.rect(m, y, cw, 8, 'F')
                        doc.setFont('helvetica', 'normal'); doc.setFontSize(9)
                        this.textColor(doc, C.dark)
                        doc.text(param.name, m + 3, y + 5.3)
                        doc.setFont('helvetica', 'bold')
                        doc.text(String(sc), m + 124, y + 5.3, { align: 'right' })
                        this.textColor(doc, sc >= 70 ? C.green : sc >= 50 ? C.amber : C.red)
                        doc.text(sc >= 70 ? 'Good' : sc >= 50 ? 'Fair' : 'Needs Attention', m + cw - 3, y + 5.3, { align: 'right' })
                        this.drawColor(doc, '#e2e8f0'); doc.setLineWidth(0.1)
                        doc.line(m, y + 8, pw - m, y + 8)
                        y += 8
                    }); y += 6
                }

                // Recommendations
                if (f.recommendations.length) {
                    if (y + 14 > ph - 18) { this.addPdfPageFooter(doc, C); doc.addPage(); y = 16 }
                    doc.setFont('helvetica', 'bold'); doc.setFontSize(12)
                    this.textColor(doc, C.dark)
                    doc.text('Personalized Recommendations', m, y); y += 6
                    doc.setFont('helvetica', 'normal'); doc.setFontSize(9)
                    this.textColor(doc, C.slate)
                    f.recommendations.forEach(rec => {
                        const lines = doc.splitTextToSize(clean(rec), cw - 7)
                        const bh = lines.length * 4.4 + 2
                        if (y + bh > ph - 18) { this.addPdfPageFooter(doc, C); doc.addPage(); y = 16 }
                        this.textColor(doc, C.teal); doc.text('•', m + 1, y)
                        this.textColor(doc, C.slate); doc.text(lines, m + 6, y)
                        y += bh
                    }); y += 5
                }

                y = this.writePdfConsultBox(doc, y)
                y = this.writePdfDisclaimer(doc, y, 'DISCLAIMER: This is an indicative wellness score for educational purposes only. It is NOT a medical diagnosis. Please consult Dr. Deepika Singh for a comprehensive fertility evaluation.')
                this.addPdfPageFooter(doc, C)
                doc.save('Fertility-Report-' + this.pdfSafeName(f.patient.name) + '.pdf')
            } catch (e) { console.error(e); alert('Could not generate PDF. Please try again.') }
            f.pdfGenerating = false
        },

        // ======================================================================
        // DIET PLAN REQUEST (shared across all tools)
        // ======================================================================

        async requestDietPlan(planName) {
            const currentTool = this.activeTool
            const toolPatientMap = {
                pcos: this.pcos, duedate: this.duedate,
                period: this.period, bmi: this.bmiData, fertility: this.fert
            }
            const patient = toolPatientMap[currentTool]
            if (!patient || !patient.patient || !patient.patient.name || !patient.patient.phone) {
                alert('Please complete the assessment first to get your diet plan.')
                return
            }
            const msg = encodeURIComponent('Hi Dr. Deepika, I would like to receive the ' + planName + '. My name is ' + patient.patient.name + '.')
            window.open('https://wa.me/918595954095?text=' + msg, '_blank')
            this.submitLead('diet_plan_request', {
                name: patient.patient.name, phone: patient.patient.phone,
                planName: planName, source: currentTool, _honey: patient.patient._honey || ''
            })
        },

        // ======================================================================
        // DIET PLAN TOOL (standalone card with WhatsApp redirect)
        // ======================================================================
        dietPlan: {
            step: 0,
            patient: { name: '', phone: '', _honey: '' },
            patientError: { name: '', phone: '' },
            patientTouched: { name: false, phone: false },
            planType: '',
            submitting: false
        },

        dietPlanGoNext() {
            const d = this.dietPlan
            d.patientTouched.name = true; d.patientTouched.phone = true
            d.patientError.name = this.validateName(d.patient.name)
            d.patientError.phone = this.validatePhone(d.patient.phone)
            if (d.patientError.name || d.patientError.phone) return
            d.step = 1; window.scrollTo({ top: 0, behavior: 'smooth' })
        },

        async dietPlanRequest() {
            const d = this.dietPlan
            if (!d.planType) { alert('Please select a diet plan.'); return }
            const msg = encodeURIComponent('Hi Dr. Deepika, I would like to receive the ' + d.planType + '. My name is ' + d.patient.name + '.')
            window.open('https://wa.me/918595954095?text=' + msg, '_blank')
            d.submitting = true
            await this.submitLead('diet_plan_request', {
                name: d.patient.name, phone: d.patient.phone,
                planName: d.planType, source: 'dietplan', _honey: d.patient._honey
            })
            d.submitting = false
            d.step = 2; window.scrollTo({ top: 0, behavior: 'smooth' })
        },

        dietPlanReset() {
            const d = this.dietPlan
            d.step = 0; d.planType = ''
            d.patient = { name: '', phone: '', _honey: '' }
            d.patientError = { name: '', phone: '' }
            d.patientTouched = { name: false, phone: false }
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }))
})

Alpine.start()
