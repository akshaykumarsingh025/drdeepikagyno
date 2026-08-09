// ============================================================================
// GENERIC HEALTH TOOL ENGINE
// ----------------------------------------------------------------------------
// Drives every tool defined in health-tool-defs.js: lead capture -> steps ->
// result -> PDF. One renderer, one PDF generator, one Sheets payload.
// Merged into the `toolsData` Alpine component in tools.js.
// ============================================================================

import { TOOL_DEFS, TOOL_MAP, TOOL_GROUPS, CATALOGUE, CATALOGUE_MAP } from './health-tool-defs.js'

export { TOOL_DEFS, TOOL_MAP, TOOL_GROUPS, CATALOGUE }

// Tailwind needs to see these class strings literally, so they are spelled out.
export const TONES = {
    rose: { text: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', hex: '#e11d48', iconBg: 'bg-rose-50', iconText: 'text-rose-500', hoverBorder: 'hover:border-rose-300', gHoverBg: 'group-hover:bg-rose-500', bar: 'from-rose-400 to-rose-500', accent: 'text-rose-700' , dot: 'bg-rose-500' },
    red: { text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', hex: '#dc2626', iconBg: 'bg-red-50', iconText: 'text-red-500', hoverBorder: 'hover:border-red-300', gHoverBg: 'group-hover:bg-red-500', bar: 'from-red-400 to-red-500', accent: 'text-red-700' , dot: 'bg-red-500' },
    orange: { text: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', hex: '#ea580c', iconBg: 'bg-orange-50', iconText: 'text-orange-500', hoverBorder: 'hover:border-orange-300', gHoverBg: 'group-hover:bg-orange-500', bar: 'from-orange-400 to-orange-500', accent: 'text-orange-700' , dot: 'bg-orange-500' },
    amber: { text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', hex: '#d97706', iconBg: 'bg-amber-50', iconText: 'text-amber-500', hoverBorder: 'hover:border-amber-300', gHoverBg: 'group-hover:bg-amber-500', bar: 'from-amber-400 to-amber-500', accent: 'text-amber-700' , dot: 'bg-amber-500' },
    emerald: { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', hex: '#059669', iconBg: 'bg-emerald-50', iconText: 'text-emerald-500', hoverBorder: 'hover:border-emerald-300', gHoverBg: 'group-hover:bg-emerald-500', bar: 'from-emerald-400 to-emerald-500', accent: 'text-emerald-700' , dot: 'bg-emerald-500' },
    teal: { text: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-200', hex: '#0d9488', iconBg: 'bg-teal-50', iconText: 'text-teal-500', hoverBorder: 'hover:border-teal-300', gHoverBg: 'group-hover:bg-teal-500', bar: 'from-teal-400 to-teal-500', accent: 'text-teal-700' , dot: 'bg-teal-500' },
    cyan: { text: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-200', hex: '#0891b2', iconBg: 'bg-cyan-50', iconText: 'text-cyan-500', hoverBorder: 'hover:border-cyan-300', gHoverBg: 'group-hover:bg-cyan-500', bar: 'from-cyan-400 to-cyan-500', accent: 'text-cyan-700' , dot: 'bg-cyan-500' },
    sky: { text: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-200', hex: '#0284c7', iconBg: 'bg-sky-50', iconText: 'text-sky-500', hoverBorder: 'hover:border-sky-300', gHoverBg: 'group-hover:bg-sky-500', bar: 'from-sky-400 to-sky-500', accent: 'text-sky-700' , dot: 'bg-sky-500' },
    indigo: { text: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200', hex: '#4f46e5', iconBg: 'bg-indigo-50', iconText: 'text-indigo-500', hoverBorder: 'hover:border-indigo-300', gHoverBg: 'group-hover:bg-indigo-500', bar: 'from-indigo-400 to-indigo-500', accent: 'text-indigo-700' , dot: 'bg-indigo-500' },
    violet: { text: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200', hex: '#7c3aed', iconBg: 'bg-violet-50', iconText: 'text-violet-500', hoverBorder: 'hover:border-violet-300', gHoverBg: 'group-hover:bg-violet-500', bar: 'from-violet-400 to-violet-500', accent: 'text-violet-700' , dot: 'bg-violet-500' },
    purple: { text: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', hex: '#9333ea', iconBg: 'bg-purple-50', iconText: 'text-purple-500', hoverBorder: 'hover:border-purple-300', gHoverBg: 'group-hover:bg-purple-500', bar: 'from-purple-400 to-purple-500', accent: 'text-purple-700' , dot: 'bg-purple-500' },
    pink: { text: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-200', hex: '#db2777', iconBg: 'bg-pink-50', iconText: 'text-pink-500', hoverBorder: 'hover:border-pink-300', gHoverBg: 'group-hover:bg-pink-500', bar: 'from-pink-400 to-pink-500', accent: 'text-pink-700' , dot: 'bg-pink-500' }
}

const blank = () => ({
    id: null,
    step: 0,              // 0 = lead capture, 1..n = question steps, 99 = result
    answers: {},
    errors: {},
    touched: {},
    patient: { name: '', phone: '', _honey: '' },
    patientError: { name: '', phone: '' },
    patientTouched: { name: false, phone: false },
    result: null,
    submitting: false,
    pdfGenerating: false,
    animate: false
})

export function healthToolEngine() {
    return {
        ht: blank(),

        // ------------------------------------------------------------------
        // Catalogue
        // ------------------------------------------------------------------
        htDefs: TOOL_DEFS,
        htGroups: TOOL_GROUPS,
        htSearch: '',
        htTone(tone) { return TONES[tone] || TONES.teal },
        htDefById(id) { return TOOL_MAP[id] || null },

        // All 19 tools — the six original hand-built ones plus the config-driven
        // ones — filtered by the search box.
        htGroupTools(group) {
            const q = this.htSearch.trim().toLowerCase()
            const tools = group.ids.map(id => CATALOGUE_MAP[id]).filter(Boolean)
            if (!q) return tools
            return tools.filter(t => (
                t.name.toLowerCase().includes(q) ||
                (t.tagline || '').toLowerCase().includes(q) ||
                (t.blurb || '').toLowerCase().includes(q) ||
                (t.keywords || '').toLowerCase().includes(q)
            ))
        },

        get htSearchHasResults() {
            return TOOL_GROUPS.some(g => this.htGroupTools(g).length > 0)
        },

        htLaunch(tool) {
            if (tool.legacy) this.selectTool(tool.id)
            else this.htOpen(tool.id)
        },

        get htDef() { return this.ht.id ? TOOL_MAP[this.ht.id] : null },
        get htToneSet() { return this.htDef ? this.htTone(this.htDef.tone) : TONES.teal },
        get htResultTone() { return this.ht.result ? this.htTone(this.ht.result.tone) : TONES.teal },

        // Steps whose `when` condition currently passes
        get htSteps() {
            const def = this.htDef
            if (!def) return []
            return def.steps.filter(s => !s.when || s.when(this.ht.answers))
        },
        get htTotalSteps() { return this.htSteps.length },
        get htCurrentStep() { return this.htSteps[this.ht.step - 1] || null },
        get htProgress() {
            const total = this.htTotalSteps + 1
            return Math.round((Math.min(this.ht.step, total) / total) * 100)
        },

        htVisibleFields(step) {
            if (!step) return []
            return step.fields.filter(f => !f.when || f.when(this.ht.answers))
        },

        // Short labels ("None / Mild / Severe") read best as a single compact
        // row; long sentence options need one or two wide columns instead.
        htScaleCompact(field) {
            return Math.max(...field.options.map(o => String(o[1]).length)) <= 16
        },
        htScaleGrid(field) {
            if (!this.htScaleCompact(field)) return 'grid-cols-1 sm:grid-cols-2'
            const n = field.options.length
            if (n === 2) return 'grid-cols-2'
            if (n === 3) return 'grid-cols-3'
            if (n === 4) return 'grid-cols-2 sm:grid-cols-4'
            if (n === 5) return 'grid-cols-2 sm:grid-cols-5'
            return 'grid-cols-2 sm:grid-cols-3'
        },

        // ------------------------------------------------------------------
        // Navigation
        // ------------------------------------------------------------------
        htOpen(id) {
            this.ht = blank()
            this.ht.id = id
            const def = TOOL_MAP[id]
            if (def) {
                // seed checkbox groups so x-model has an array to push into
                def.steps.forEach(s => s.fields.forEach(f => {
                    if (f.type === 'checkboxes') this.ht.answers[f.key] = []
                }))
            }
            this.activeTool = 'ht:' + id
            window.scrollTo({ top: 0, behavior: 'smooth' })
        },

        htStart() {
            const h = this.ht
            h.patientTouched.name = true
            h.patientTouched.phone = true
            h.patientError.name = this.validateName(h.patient.name)
            h.patientError.phone = this.validatePhone(h.patient.phone)
            if (h.patientError.name || h.patientError.phone) return
            h.step = 1
            window.scrollTo({ top: 0, behavior: 'smooth' })
        },

        htValidateStep() {
            const step = this.htCurrentStep
            if (!step) return true
            let ok = true
            this.htVisibleFields(step).forEach(f => {
                if (f.type === 'note') return
                const err = this.htFieldError(f)
                this.ht.errors[f.key] = err
                this.ht.touched[f.key] = true
                if (err) ok = false
            })
            return ok
        },

        htFieldError(f) {
            const v = this.ht.answers[f.key]
            if (f.type === 'checkboxes') return ''
            if (!f.required) {
                if (f.type === 'number' && v !== '' && v !== undefined && v !== null) {
                    const n = parseFloat(v)
                    if (isNaN(n)) return 'Enter a number.'
                    if (f.min !== undefined && n < f.min) return 'Must be ' + f.min + ' or more.'
                    if (f.max !== undefined && n > f.max) return 'Must be ' + f.max + ' or less.'
                }
                return ''
            }
            if (v === undefined || v === null || v === '') return 'This answer is required.'
            if (f.type === 'number') {
                const n = parseFloat(v)
                if (isNaN(n)) return 'Enter a number.'
                if (f.min !== undefined && n < f.min) return 'Must be ' + f.min + ' or more.'
                if (f.max !== undefined && n > f.max) return 'Must be ' + f.max + ' or less.'
            }
            return ''
        },

        htTouch(f) {
            this.ht.touched[f.key] = true
            this.ht.errors[f.key] = this.htFieldError(f)
        },

        htShowError(key) { return this.ht.touched[key] && this.ht.errors[key] },

        htNext() {
            if (!this.htValidateStep()) {
                const first = document.querySelector('#ht-form [data-field-error="true"]')
                if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' })
                return
            }
            if (this.ht.step < this.htTotalSteps) {
                this.ht.step++
                window.scrollTo({ top: 0, behavior: 'smooth' })
            } else {
                this.htFinish()
            }
        },

        htBack() {
            if (this.ht.step > 0) {
                this.ht.step--
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }
        },

        htSkipStep() {
            if (this.ht.step < this.htTotalSteps) {
                this.ht.step++
                window.scrollTo({ top: 0, behavior: 'smooth' })
            } else {
                this.htFinish()
            }
        },

        async htFinish() {
            const h = this.ht
            const def = this.htDef
            if (!def) return
            h.submitting = true
            try {
                h.result = def.compute(h.answers)
            } catch (e) {
                console.error('Tool computation failed', e)
                alert('Something went wrong calculating your result. Please check your answers and try again.')
                h.submitting = false
                return
            }

            await this.submitLead('health_tool', {
                name: h.patient.name,
                phone: h.patient.phone,
                toolId: def.id,
                toolName: def.name,
                summary: h.result.sheet || h.result.headline || '',
                _honey: h.patient._honey
            })

            h.submitting = false
            h.step = 99
            setTimeout(() => { h.animate = true }, 120)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        },

        htReset() {
            const id = this.ht.id
            this.ht = blank()
            this.htOpen(id)
        },

        htToggleCheck(key, value) {
            const arr = this.ht.answers[key] || []
            const i = arr.indexOf(value)
            if (i > -1) arr.splice(i, 1); else arr.push(value)
            this.ht.answers[key] = arr
        },

        htIsChecked(key, value) {
            const arr = this.ht.answers[key]
            return Array.isArray(arr) && arr.indexOf(value) > -1
        },

        htWhatsApp() {
            const def = this.htDef
            const h = this.ht
            if (!def || !h.result) return
            const msg = encodeURIComponent(
                'Hi Dr. Deepika, I just completed the ' + def.name + ' on your website.\n\n' +
                'Name: ' + h.patient.name + '\n' +
                'Phone: ' + h.patient.phone + '\n' +
                'Result: ' + (h.result.headline || '') + '\n\n' +
                'I would like to book a consultation.'
            )
            window.open('https://wa.me/918595954095?text=' + msg, '_blank')
        },

        // ------------------------------------------------------------------
        // PDF
        // ------------------------------------------------------------------
        async htGeneratePDF() {
            const h = this.ht
            const def = this.htDef
            const res = h.result
            if (!def || !res) return
            h.pdfGenerating = true
            try {
                await this.loadJsPDF()
                const { jsPDF } = window.jspdf
                const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
                const pw = doc.internal.pageSize.getWidth()
                const ph = doc.internal.pageSize.getHeight()
                const m = 16, cw = pw - 2 * m
                const C = this.pdfColors
                const clean = (v) => this.cleanText(v)
                const toneHex = (this.htTone(res.tone) || {}).hex || C.teal
                let y = 16

                const room = (need) => {
                    if (y + need > ph - 18) { this.addPdfPageFooter(doc, C); doc.addPage(); y = 16 }
                }
                const heading = (text) => {
                    room(14)
                    doc.setFont('helvetica', 'bold'); doc.setFontSize(12)
                    this.textColor(doc, C.dark)
                    doc.text(text, m, y); y += 6
                }

                y = this.writePdfHeader(doc, def.pdfTitle || def.name, y)

                // Patient strip
                this.fillColor(doc, C.light)
                doc.rect(m, y, cw, 18, 'F')
                doc.setFontSize(10); doc.setFont('helvetica', 'normal')
                this.textColor(doc, C.muted)
                doc.text('Patient:', m + 4, y + 7); doc.text('Date:', m + 96, y + 7)
                doc.text('Tool:', m + 4, y + 14); doc.text('Phone:', m + 96, y + 14)
                doc.setFont('helvetica', 'bold'); this.textColor(doc, C.dark)
                doc.text(clean(h.patient.name) || 'Patient', m + 24, y + 7)
                doc.setFont('helvetica', 'normal'); this.textColor(doc, C.slate)
                doc.text(new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }), m + 112, y + 7)
                doc.text(clean(def.short || def.name).slice(0, 34), m + 24, y + 14)
                doc.text(clean(h.patient.phone) || '-', m + 112, y + 14)
                y += 26

                // Headline card
                room(42)
                this.fillColor(doc, '#f8fafc'); this.drawColor(doc, toneHex); doc.setLineWidth(0.6)
                const cardH = res.scoreDisplay ? 36 : 26
                doc.roundedRect(m, y, cw, cardH, 3, 3, 'FD')
                if (res.scoreDisplay) {
                    doc.setFont('helvetica', 'normal'); doc.setFontSize(10)
                    this.textColor(doc, C.muted)
                    doc.text(clean(res.scoreCaption || 'Result'), pw / 2, y + 8, { align: 'center' })
                    doc.setFont('helvetica', 'bold'); doc.setFontSize(28)
                    this.textColor(doc, toneHex)
                    doc.text(clean(res.scoreDisplay), pw / 2, y + 21, { align: 'center' })
                    this.fillColor(doc, toneHex)
                    const label = clean(res.headline)
                    const lw = Math.max(40, doc.getStringUnitWidth(label) * 9 / doc.internal.scaleFactor + 10)
                    doc.roundedRect(pw / 2 - lw / 2, y + 24, lw, 7, 3, 3, 'F')
                    doc.setFontSize(9); this.textColor(doc, '#ffffff')
                    doc.text(label, pw / 2, y + 29, { align: 'center' })
                } else {
                    doc.setFont('helvetica', 'bold'); doc.setFontSize(15)
                    this.textColor(doc, toneHex)
                    doc.text(clean(res.headline), pw / 2, y + 16, { align: 'center' })
                }
                y += cardH + 6

                // Message
                if (res.message) {
                    room(16)
                    doc.setFont('helvetica', 'normal'); doc.setFontSize(10)
                    this.textColor(doc, C.slate)
                    const lines = doc.splitTextToSize(clean(res.message), cw - 4)
                    lines.forEach(ln => { room(6); doc.text(ln, m + 2, y); y += 4.6 })
                    y += 5
                }

                // Urgent banner
                if (res.urgent) {
                    doc.setFont('helvetica', 'bold'); doc.setFontSize(9)
                    const ulines = doc.splitTextToSize(clean(res.urgent), cw - 10)
                    const bh = ulines.length * 4.4 + 11
                    room(bh + 4)
                    this.fillColor(doc, '#fef2f2'); this.drawColor(doc, C.red); doc.setLineWidth(0.5)
                    doc.roundedRect(m, y, cw, bh, 2, 2, 'FD')
                    this.textColor(doc, C.red)
                    doc.text('IMPORTANT', m + 5, y + 6)
                    doc.setFont('helvetica', 'normal')
                    doc.text(ulines, m + 5, y + 11)
                    y += bh + 6
                }

                // Stats grid
                if (res.stats && res.stats.length) {
                    heading('Key Findings')
                    const rows = Math.ceil(res.stats.length / 2)
                    room(rows * 17 + 2)
                    res.stats.forEach((s, i) => {
                        const sx = m + (i % 2) * (cw / 2)
                        const sy = y + Math.floor(i / 2) * 17
                        this.fillColor(doc, C.light)
                        doc.rect(sx, sy, cw / 2 - 2, 15, 'F')
                        doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5)
                        this.textColor(doc, C.muted)
                        doc.text(clean(s.label), sx + 3, sy + 5)
                        doc.setFont('helvetica', 'bold'); doc.setFontSize(10)
                        this.textColor(doc, C.dark)
                        doc.text(doc.splitTextToSize(clean(s.value), cw / 2 - 8)[0], sx + 3, sy + 10.5)
                        if (s.note) {
                            doc.setFont('helvetica', 'normal'); doc.setFontSize(6.8)
                            this.textColor(doc, C.muted)
                            doc.text(doc.splitTextToSize(clean(s.note), cw / 2 - 8)[0], sx + 3, sy + 14)
                        }
                    })
                    y += rows * 17 + 4
                }

                // Table
                if (res.table && res.table.rows && res.table.rows.length) {
                    heading(clean(res.table.title))
                    const cols = res.table.columns
                    const colW = cols.length === 1 ? [cw] :
                        cols.length === 2 ? [cw * 0.62, cw * 0.38] :
                            cols.length === 3 ? [cw * 0.5, cw * 0.28, cw * 0.22] :
                                [cw * 0.34, cw * 0.22, cw * 0.22, cw * 0.22]
                    room(14)
                    this.fillColor(doc, toneHex)
                    doc.rect(m, y, cw, 8, 'F')
                    doc.setFontSize(8.5); doc.setFont('helvetica', 'bold'); this.textColor(doc, '#ffffff')
                    let cx = m
                    cols.forEach((c, i) => { doc.text(clean(c), cx + 3, y + 5.4); cx += colW[i] })
                    y += 8

                    res.table.rows.forEach((row, ri) => {
                        const cellLines = row.map((cell, i) => doc.splitTextToSize(clean(cell), colW[i] - 6))
                        const rh = Math.max(8, Math.max(...cellLines.map(l => l.length)) * 4.2 + 3.5)
                        room(rh)
                        this.fillColor(doc, ri % 2 === 0 ? C.light : '#ffffff')
                        doc.rect(m, y, cw, rh, 'F')
                        doc.setFont('helvetica', 'normal'); doc.setFontSize(8)
                        this.textColor(doc, C.slate)
                        let x = m
                        cellLines.forEach((lines, i) => {
                            if (i === 0) { doc.setFont('helvetica', 'normal'); this.textColor(doc, C.dark) }
                            else { doc.setFont('helvetica', 'normal'); this.textColor(doc, C.slate) }
                            doc.text(lines, x + 3, y + 5.2)
                            x += colW[i]
                        })
                        this.drawColor(doc, '#e2e8f0'); doc.setLineWidth(0.1)
                        doc.line(m, y + rh, pw - m, y + rh)
                        y += rh
                    })
                    y += 6

                    if (res.table.notes && res.table.notes.length) {
                        doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5)
                        this.textColor(doc, C.muted)
                        res.table.notes.forEach(n => {
                            const lines = doc.splitTextToSize(clean(n), cw - 6)
                            room(lines.length * 3.6 + 3)
                            doc.text(lines, m + 2, y)
                            y += lines.length * 3.6 + 2
                        })
                        y += 4
                    }
                }

                // Timeline
                if (res.timeline && res.timeline.length) {
                    heading('Your Schedule')
                    res.timeline.forEach(it => {
                        const dlines = doc.splitTextToSize(clean(it.desc), cw - 34)
                        const rh = dlines.length * 3.9 + 7
                        room(rh)
                        doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5)
                        this.textColor(doc, it.state === 'past' ? C.muted : toneHex)
                        doc.text(clean(it.tag), m + 1, y + 3.5)
                        doc.setFontSize(6.5); this.textColor(doc, C.muted)
                        doc.text(clean(it.date || ''), m + 1, y + 7)
                        doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5)
                        this.textColor(doc, it.state === 'past' ? C.muted : C.dark)
                        doc.text(clean(it.title), m + 30, y + 3.5)
                        doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5)
                        this.textColor(doc, C.slate)
                        doc.text(dlines, m + 30, y + 7)
                        y += rh + 1.5
                    })
                    y += 4
                }

                // Helplines
                if (res.helplines && res.helplines.length) {
                    heading('If You Need To Talk To Someone')
                    res.helplines.forEach(hl => {
                        room(7)
                        doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5)
                        this.textColor(doc, C.dark); doc.text(clean(hl[0]), m + 2, y)
                        doc.setFont('helvetica', 'normal'); this.textColor(doc, C.slate)
                        doc.text(clean(hl[1]), m + 62, y)
                        y += 6
                    })
                    y += 4
                }

                // Recommendations
                if (res.recommendations && res.recommendations.length) {
                    heading('What To Do Next')
                    doc.setFont('helvetica', 'normal'); doc.setFontSize(9)
                    res.recommendations.forEach(rec => {
                        const lines = doc.splitTextToSize(clean(rec), cw - 8)
                        const bh = lines.length * 4.4 + 2.5
                        room(bh)
                        this.textColor(doc, toneHex); doc.text('•', m + 1, y)
                        this.textColor(doc, C.slate); doc.text(lines, m + 6, y)
                        y += bh
                    })
                    y += 5
                }

                y = this.writePdfConsultBox(doc, y)
                y = this.writePdfDisclaimer(doc, y, def.disclaimer ||
                    'DISCLAIMER: This report is a screening aid for educational purposes only. It is NOT a medical diagnosis and does not replace an examination. Please consult Dr. Deepika Singh for a full evaluation before acting on anything in this report.')
                this.addPdfPageFooter(doc, C)
                doc.save(def.short.replace(/[^a-z0-9]+/gi, '-') + '-' + this.pdfSafeName(h.patient.name) + '.pdf')
            } catch (e) {
                console.error(e)
                alert('Could not generate the PDF. Please try again.')
            }
            h.pdfGenerating = false
        }
    }
}
