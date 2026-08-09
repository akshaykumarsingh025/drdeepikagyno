import './style.css'
import './style-v2.css'
import Alpine from 'alpinejs'

window.Alpine = Alpine

document.addEventListener('alpine:init', () => {
    Alpine.data('fertilityData', () => ({
        // Step navigation
        currentStep: 1,
        totalSteps: 4,
        mobileMenuOpen: false,

        // Mode
        mode: 'basic',

        // Step 1 - Patient Info
        patient: {
            name: '',
            phone: '',
            _honey: ''
        },
        patientError: { name: '', phone: '' },
        patientTouched: { name: false, phone: false },

        // Step 2 - Basic Questions
        basic: {
            age: '',
            menstrualRegularity: '',
            periodPain: '',
            height: '',
            weight: '',
            conditions: [],
            smoking: '',
            stress: '',
            pregnancyHistory: '',
            familyHistory: ''
        },
        basicError: {
            age: '', menstrualRegularity: '', periodPain: '',
            height: '', weight: '', smoking: '', stress: '', pregnancyHistory: '', familyHistory: ''
        },
        basicTouched: {
            age: false, menstrualRegularity: false, periodPain: false,
            height: false, weight: false, smoking: false, stress: false, pregnancyHistory: false, familyHistory: false
        },

        // Step 3 - Advanced Lab Values (all optional)
        lab: {
            amh: '',
            fsh: '',
            lh: '',
            tsh: '',
            prolactin: '',
            afc: '',
            vitaminD: '',
            hemoglobin: ''
        },

        // Results
        score: null,
        tier: null,
        tierData: null,
        parameterResults: [],
        recommendations: [],

        // UI state
        submitting: false,
        submitMessage: '',
        submitMessageType: '',
        pdfGenerating: false,
        showResults: false,
        scoreAnimation: false,

        // Score tiers
        tiers: [
            { min: 85, max: 100, label: 'Excellent', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', ring: '#10b981', message: 'Your fertility indicators look strong. Maintain a healthy lifestyle and schedule regular check-ups.' },
            { min: 70, max: 84, label: 'Good', color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-200', ring: '#0d9488', message: 'Generally favorable profile with minor areas that can be optimized for better outcomes.' },
            { min: 50, max: 69, label: 'Moderate', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', ring: '#d97706', message: 'Some factors may need attention. A consultation with Dr. Deepika Singh is recommended.' },
            { min: 30, max: 49, label: 'Below Average', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', ring: '#ea580c', message: 'Multiple risk factors detected. A professional fertility evaluation is strongly recommended.' },
            { min: 0, max: 29, label: 'Needs Attention', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', ring: '#dc2626', message: 'Significant concerns identified. Please schedule a consultation with Dr. Deepika Singh soon.' }
        ],

        // Recommendations templates per parameter
        recommendationMap: {
            age: {
                low: 'Age is an important factor in fertility. Consider consulting Dr. Deepika Singh for age-appropriate fertility assessment and family planning guidance.',
                medium: 'Your age is favorable. Continue maintaining good reproductive health with regular gynecological check-ups.'
            },
            menstrualRegularity: {
                low: 'Irregular menstrual cycles may indicate hormonal imbalances. A thorough evaluation including hormone profiling is recommended.',
                medium: 'Your menstrual cycle is fairly regular. Track your cycles to identify any patterns of irregularity.'
            },
            periodPain: {
                low: 'Severe period pain may indicate underlying conditions like endometriosis or fibroids. Please consult Dr. Deepika Singh for evaluation.',
                medium: 'Moderate period pain is manageable. If it worsens, consult your gynecologist.'
            },
            bmi: {
                low: 'Your BMI is outside the optimal range. Maintaining a healthy weight can positively impact fertility. Consider a consultation for personalized guidance.',
                medium: 'Your BMI is in a healthy range. Keep up with regular exercise and balanced nutrition.'
            },
            conditions: {
                low: 'Your diagnosed condition(s) may affect fertility. Dr. Deepika Singh specializes in managing PCOS, thyroid disorders, endometriosis, and fibroids with personalized treatment plans.',
                medium: 'No diagnosed conditions. Continue preventive care with regular gynecological screenings.'
            },
            smoking: {
                low: 'Smoking can significantly impact fertility. Consider smoking cessation programs. Dr. Deepika Singh can provide guidance and support.',
                medium: 'Good that you don\'t smoke. Avoid exposure to second-hand smoke as well.'
            },
            stress: {
                low: 'High stress levels can affect hormonal balance and fertility. Consider stress management techniques like yoga, meditation, or counseling.',
                medium: 'Your stress levels are manageable. Continue with healthy coping mechanisms.'
            },
            pregnancyHistory: {
                low: 'Your pregnancy history suggests a need for thorough fertility evaluation. Dr. Deepika Singh can help assess and address any underlying factors.',
                medium: 'Your reproductive history is favorable. Continue with regular follow-ups.'
            },
            familyHistory: {
                low: 'Family history of fertility issues suggests genetic or hereditary factors may be relevant. A comprehensive evaluation is recommended.',
                medium: 'No family history of fertility issues. Continue with routine care.'
            },
            amh: {
                low: 'Low AMH may indicate reduced ovarian reserve. Please discuss fertility preservation and treatment options with Dr. Deepika Singh.',
                medium: 'Your AMH level is satisfactory. Regular monitoring is recommended.'
            },
            fsh: {
                low: 'Elevated FSH levels may suggest diminished ovarian reserve. A comprehensive fertility assessment is recommended.',
                medium: 'Your FSH level is within normal range. Continue regular monitoring.'
            },
            lh: {
                low: 'Elevated LH levels may indicate PCOS or ovulatory dysfunction. Further evaluation by Dr. Deepika Singh is recommended.',
                medium: 'Your LH level is within normal range.'
            },
            tsh: {
                low: 'Abnormal TSH levels may affect fertility. Thyroid management is important for reproductive health. Consult Dr. Deepika Singh.',
                medium: 'Your TSH is well-controlled in the optimal range.'
            },
            prolactin: {
                low: 'Elevated prolactin levels may affect ovulation. Please consult Dr. Deepika Singh for evaluation and management.',
                medium: 'Your prolactin level is within normal range.'
            },
            afc: {
                low: 'Low antral follicle count may indicate reduced ovarian reserve. Consider consulting Dr. Deepika Singh for fertility planning.',
                medium: 'Your AFC is favorable. Continue regular monitoring.'
            },
            vitaminD: {
                low: 'Vitamin D deficiency is common and may impact fertility. Consider supplementation after consulting Dr. Deepika Singh.',
                medium: 'Your Vitamin D level is adequate. Maintain sun exposure and dietary sources.'
            },
            hemoglobin: {
                low: 'Low hemoglobin (anemia) can affect overall health and fertility. Please consult Dr. Deepika Singh for management.',
                medium: 'Your hemoglobin is at a healthy level. Maintain a balanced diet rich in iron.'
            }
        },

        init() {
            // Restore from sessionStorage if available
            const saved = sessionStorage.getItem('fertilityScoreState')
            if (saved) {
                try {
                    const parsed = JSON.parse(saved)
                    if (parsed.patient) this.patient = parsed.patient
                    if (parsed.basic) this.basic = parsed.basic
                    if (parsed.lab) this.lab = parsed.lab
                    if (parsed.mode) this.mode = parsed.mode
                    if (parsed.currentStep && parsed.currentStep > 1) this.currentStep = parsed.currentStep
                } catch (e) {}
            }
        },

        saveState() {
            sessionStorage.setItem('fertilityScoreState', JSON.stringify({
                patient: this.patient,
                basic: this.basic,
                lab: this.lab,
                mode: this.mode,
                currentStep: this.currentStep
            }))
        },

        validatePhone(phone) {
            if (!phone || !phone.trim()) return 'Phone number is required.'
            const digits = phone.replace(/[\s\-\(\)\+]/g, '')
            if (!/^\d{10,12}$/.test(digits)) return 'Enter a valid 10-digit phone number.'
            if (digits.length === 10 && !/^[6-9]/.test(digits)) return 'Indian phone numbers must start with 6-9.'
            return ''
        },

        validateName(name) {
            if (!name || !name.trim()) return 'Full name is required.'
            if (name.trim().length < 2) return 'Name must be at least 2 characters.'
            if (!/^[a-zA-Z\s.'-]+$/.test(name.trim())) return 'Name contains invalid characters.'
            return ''
        },

        validateBasicField(field, value) {
            switch (field) {
                case 'age':
                    if (!value || !value.toString().trim()) return 'Age is required.'
                    const age = parseInt(value)
                    if (isNaN(age) || age < 18 || age > 55) return 'Enter a valid age (18–55).'
                    return ''
                case 'menstrualRegularity':
                    if (!value) return 'Please select your menstrual cycle regularity.'
                    return ''
                case 'periodPain':
                    if (!value) return 'Please select your period pain level.'
                    return ''
                case 'height':
                    if (!value || !value.toString().trim()) return ''
                    const h = parseFloat(value)
                    if (isNaN(h) || h < 100 || h > 250) return 'Enter a valid height (100–250 cm).'
                    return ''
                case 'weight':
                    if (!value || !value.toString().trim()) return ''
                    const w = parseFloat(value)
                    if (isNaN(w) || w < 30 || w > 200) return 'Enter a valid weight (30–200 kg).'
                    return ''
                case 'smoking':
                    if (!value) return 'Please select your smoking status.'
                    return ''
                case 'stress':
                    if (!value) return 'Please select your stress level.'
                    return ''
                case 'pregnancyHistory':
                    if (!value) return 'Please select your pregnancy history.'
                    return ''
                case 'familyHistory':
                    if (!value) return 'Please select your family history.'
                    return ''
                default:
                    return ''
            }
        },

        validateBasic() {
            const fields = ['age', 'menstrualRegularity', 'periodPain', 'height', 'weight', 'smoking', 'stress', 'pregnancyHistory', 'familyHistory']
            let allValid = true
            fields.forEach(field => {
                this.basicTouched[field] = true
                const err = this.validateBasicField(field, this.basic[field])
                this.basicError[field] = err
                if (err) allValid = false
            })
            return allValid
        },

        canProceedToStep2() {
            return !this.validateName(this.patient.name) && !this.validatePhone(this.patient.phone)
        },

        async nextStep() {
            if (this.currentStep === 1) {
                this.patientTouched.name = true
                this.patientTouched.phone = true
                this.patientError.name = this.validateName(this.patient.name)
                this.patientError.phone = this.validatePhone(this.patient.phone)
                if (this.patientError.name || this.patientError.phone) return
            }
            if (this.currentStep === 2) {
                if (!this.validateBasic()) return
                if (this.mode === 'basic') {
                    await this.calculateScore()
                    return
                }
            }
            if (this.currentStep < this.totalSteps) {
                this.currentStep++
                this.saveState()
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }
        },

        prevStep() {
            if (this.currentStep > 1) {
                this.currentStep--
                this.saveState()
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }
        },

        goToStep(step) {
            if (step < this.currentStep) {
                this.currentStep = step
                this.saveState()
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }
        },

        toggleCondition(condition) {
            const idx = this.basic.conditions.indexOf(condition)
            if (idx > -1) {
                this.basic.conditions.splice(idx, 1)
            } else {
                this.basic.conditions.push(condition)
            }
        },

        get bmi() {
            const h = parseFloat(this.basic.height)
            const w = parseFloat(this.basic.weight)
            if (h > 0 && w > 0) {
                const bmi = w / ((h / 100) * (h / 100))
                return Math.round(bmi * 10) / 10
            }
            return null
        },

        get bmiCategory() {
            const b = this.bmi
            if (b === null) return ''
            if (b < 18.5) return 'Underweight'
            if (b < 25) return 'Normal'
            if (b < 30) return 'Overweight'
            return 'Obese'
        },

        calculateBasicScore() {
            const age = parseInt(this.basic.age)
            let ageScore = 0
            if (age >= 18 && age <= 25) ageScore = 100
            else if (age <= 30) ageScore = 95
            else if (age <= 34) ageScore = 85
            else if (age <= 37) ageScore = 65
            else if (age <= 40) ageScore = 45
            else if (age <= 43) ageScore = 25
            else if (age >= 44) ageScore = 10

            const menstrualScores = { regular: 100, slightly_irregular: 60, very_irregular: 20 }
            const menstrualScore = menstrualScores[this.basic.menstrualRegularity] || 0

            const painScores = { none_mild: 100, moderate: 70, severe: 40 }
            const painScore = painScores[this.basic.periodPain] || 0

            const bmi = this.bmi
            let bmiScore = 0
            if (bmi !== null) {
                if (bmi >= 18.5 && bmi <= 24.9) bmiScore = 100
                else if (bmi <= 29.9) bmiScore = 70
                else if (bmi >= 30) bmiScore = 40
                else if (bmi < 18.5) bmiScore = 50
            }

            let conditionsScore = 100
            const cond = this.basic.conditions
            if (cond.length > 0) {
                let total = 0
                if (cond.includes('pcos')) total += 50
                if (cond.includes('thyroid')) total += 40
                if (cond.includes('endometriosis')) total += 60
                if (cond.includes('fibroids')) total += 45
                const avg = total / cond.length
                conditionsScore = Math.max(0, 100 - (100 - avg) * (1 + (cond.length - 1) * 0.3))
            }

            const smokingScores = { never: 100, quit: 80, current: 30 }
            const smokingScore = smokingScores[this.basic.smoking] || 0

            const stressScores = { low: 100, moderate: 70, high: 40 }
            const stressScore = stressScores[this.basic.stress] || 0

            const pregScores = { successful: 100, complications: 70, trying: 30, never: 80 }
            const pregScore = pregScores[this.basic.pregnancyHistory] || 0

            const familyScores = { no: 100, yes: 50 }
            const familyScore = familyScores[this.basic.familyHistory] || 0

            // Weights
            const weights = {
                age: 0.30,
                menstrualRegularity: 0.20,
                periodPain: 0.05,
                bmi: 0.10,
                conditions: 0.15,
                smoking: 0.05,
                stress: 0.05,
                pregnancyHistory: 0.05,
                familyHistory: 0.05
            }

            const raw = (ageScore * weights.age) +
                (menstrualScore * weights.menstrualRegularity) +
                (painScore * weights.periodPain) +
                (bmiScore * weights.bmi) +
                (conditionsScore * weights.conditions) +
                (smokingScore * weights.smoking) +
                (stressScore * weights.stress) +
                (pregScore * weights.pregnancyHistory) +
                (familyScore * weights.familyHistory)

            return {
                total: Math.round(raw),
                parameters: [
                    { name: 'Age', score: ageScore, weight: weights.age, key: 'age' },
                    { name: 'Menstrual Regularity', score: menstrualScore, weight: weights.menstrualRegularity, key: 'menstrualRegularity' },
                    { name: 'Period Pain', score: painScore, weight: weights.periodPain, key: 'periodPain' },
                    { name: 'BMI', score: bmiScore, weight: weights.bmi, key: 'bmi' },
                    { name: 'Diagnosed Conditions', score: conditionsScore, weight: weights.conditions, key: 'conditions' },
                    { name: 'Smoking', score: smokingScore, weight: weights.smoking, key: 'smoking' },
                    { name: 'Stress Level', score: stressScore, weight: weights.stress, key: 'stress' },
                    { name: 'Pregnancy History', score: pregScore, weight: weights.pregnancyHistory, key: 'pregnancyHistory' },
                    { name: 'Family History', score: familyScore, weight: weights.familyHistory, key: 'familyHistory' }
                ]
            }
        },

        calculateAdvancedScore(basicResult) {
            const params = [...basicResult.parameters]

            const labScores = []

            const amh = parseFloat(this.lab.amh)
            if (!isNaN(amh) && amh >= 0) {
                let score = 0
                if (amh > 3.0) score = 100
                else if (amh >= 1.5) score = 80
                else if (amh >= 1.0) score = 55
                else if (amh >= 0.5) score = 30
                else score = 10
                labScores.push({ name: 'AMH Level', score, weight: 0.15, key: 'amh' })
            }

            const fsh = parseFloat(this.lab.fsh)
            if (!isNaN(fsh) && fsh >= 0) {
                let score = 0
                if (fsh < 8) score = 100
                else if (fsh <= 10) score = 75
                else if (fsh <= 15) score = 45
                else score = 15
                labScores.push({ name: 'FSH Level', score, weight: 0.10, key: 'fsh' })
            }

            const lh = parseFloat(this.lab.lh)
            if (!isNaN(lh) && lh >= 0) {
                let score = 0
                if (lh >= 2 && lh <= 15) score = 100
                else score = 50
                labScores.push({ name: 'LH Level', score, weight: 0.05, key: 'lh' })
            }

            const tsh = parseFloat(this.lab.tsh)
            if (!isNaN(tsh) && tsh >= 0) {
                let score = 0
                if (tsh >= 0.5 && tsh <= 2.5) score = 100
                else if (tsh <= 4.5) score = 70
                else score = 30
                labScores.push({ name: 'TSH Level', score, weight: 0.05, key: 'tsh' })
            }

            const prolactin = parseFloat(this.lab.prolactin)
            if (!isNaN(prolactin) && prolactin >= 0) {
                let score = 0
                if (prolactin < 25) score = 100
                else if (prolactin <= 50) score = 60
                else score = 20
                labScores.push({ name: 'Prolactin', score, weight: 0.03, key: 'prolactin' })
            }

            const afc = parseFloat(this.lab.afc)
            if (!isNaN(afc) && afc >= 0) {
                let score = 0
                if (afc > 15) score = 100
                else if (afc >= 10) score = 80
                else if (afc >= 5) score = 50
                else score = 15
                labScores.push({ name: 'Antral Follicle Count', score, weight: 0.07, key: 'afc' })
            }

            const vitaminD = parseFloat(this.lab.vitaminD)
            if (!isNaN(vitaminD) && vitaminD >= 0) {
                let score = 0
                if (vitaminD > 30) score = 100
                else if (vitaminD >= 20) score = 70
                else score = 40
                labScores.push({ name: 'Vitamin D', score, weight: 0.03, key: 'vitaminD' })
            }

            const hb = parseFloat(this.lab.hemoglobin)
            if (!isNaN(hb) && hb >= 0) {
                let score = 0
                if (hb > 12) score = 100
                else if (hb >= 10) score = 65
                else score = 30
                labScores.push({ name: 'Hemoglobin', score, weight: 0.02, key: 'hemoglobin' })
            }

            // If no lab values provided, return basic score
            if (labScores.length === 0) {
                return { total: basicResult.total, parameters: params }
            }

            // Dynamic weight redistribution
            const totalLabWeight = labScores.reduce((sum, p) => sum + p.weight, 0)
            const basicWeightTotal = params.reduce((sum, p) => sum + p.weight, 0)
            const redistributionFactor = 1 / (basicWeightTotal + totalLabWeight)

            let finalScore = 0
            const allParams = [...params, ...labScores]
            allParams.forEach(p => {
                const adjustedWeight = p.weight * redistributionFactor
                finalScore += p.score * adjustedWeight
                p.finalWeight = adjustedWeight
            })

            return {
                total: Math.round(finalScore),
                parameters: allParams
            }
        },

        getTier(score) {
            return this.tiers.find(t => score >= t.min && score <= t.max) || this.tiers[this.tiers.length - 1]
        },

        generateRecommendations(params) {
            const recs = []
            params.forEach(p => {
                const key = p.key
                const map = this.recommendationMap[key]
                if (!map) return
                if (p.score < 60) {
                    recs.push(map.low || '')
                } else if (p.score < 85) {
                    recs.push(map.medium || '')
                }
            })
            return recs.filter(r => r)
        },

        async calculateScore() {
            const basicResult = this.calculateBasicScore()
            const isAdvanced = this.mode === 'advanced'
            const finalResult = isAdvanced ? this.calculateAdvancedScore(basicResult) : basicResult

            this.score = finalResult.total
            this.tierData = this.getTier(this.score)
            this.tier = this.tierData.label
            this.parameterResults = finalResult.parameters.filter(p => p.score > 0)
            this.recommendations = this.generateRecommendations(finalResult.parameters)

            this.showResults = true
            this.currentStep = 4
            this.saveState()

            // Trigger score animation
            setTimeout(() => { this.scoreAnimation = true }, 100)

            // Submit to Google Sheets
            await this.submitToSheet()

            window.scrollTo({ top: 0, behavior: 'smooth' })
        },

        async submitToSheet() {
            this.submitting = true
            try {
                const payload = {
                    type: 'fertility_score',
                    data: {
                        name: this.patient.name,
                        phone: this.patient.phone,
                        mode: this.mode,
                        age: this.basic.age,
                        bmi: this.bmi,
                        menstrualRegularity: this.basic.menstrualRegularity,
                        periodPain: this.basic.periodPain,
                        conditions: this.basic.conditions.join(', '),
                        smoking: this.basic.smoking,
                        stress: this.basic.stress,
                        pregnancyHistory: this.basic.pregnancyHistory,
                        familyHistory: this.basic.familyHistory,
                        amh: this.lab.amh,
                        fsh: this.lab.fsh,
                        lh: this.lab.lh,
                        tsh: this.lab.tsh,
                        prolactin: this.lab.prolactin,
                        afc: this.lab.afc,
                        vitaminD: this.lab.vitaminD,
                        hemoglobin: this.lab.hemoglobin,
                        score: this.score,
                        tier: this.tier,
                        _honey: this.patient._honey
                    }
                }

                const response = await fetch('/api/submit-form', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                })

                const ct = response.headers.get('content-type') || ''
                if (ct.includes('application/json')) {
                    await response.json()
                }

                this.submitMessage = 'Your results have been saved successfully!'
                this.submitMessageType = 'success'

                // Clear session storage after successful submission
                sessionStorage.removeItem('fertilityScoreState')
            } catch (e) {
                this.submitMessage = 'Results saved locally. Could not connect to server.'
                this.submitMessageType = 'info'
            } finally {
                this.submitting = false
            }
        },

        async generatePDF() {
            this.pdfGenerating = true
            try {
                if (!this.score && this.score !== 0) {
                    throw new Error('Score is not available for PDF generation.')
                }

                if (!window.jspdf?.jsPDF) {
                    await new Promise((resolve, reject) => {
                        const script = document.createElement('script')
                        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
                        script.crossOrigin = 'anonymous'
                        script.referrerPolicy = 'no-referrer'
                        script.onload = resolve
                        script.onerror = reject
                        document.body.appendChild(script)
                    })
                }

                const { jsPDF } = window.jspdf
                const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
                const pageWidth = doc.internal.pageSize.getWidth()
                const pageHeight = doc.internal.pageSize.getHeight()
                const margin = 16
                const contentWidth = pageWidth - (margin * 2)
                const colors = {
                    teal: '#0d9488',
                    dark: '#0f172a',
                    slate: '#475569',
                    muted: '#64748b',
                    light: '#f8fafc',
                    paleTeal: '#f0fdfa',
                    amberBg: '#fef3c7',
                    amberText: '#92400e',
                    green: '#059669',
                    amber: '#d97706',
                    red: '#dc2626'
                }
                let y = 16

                const hexToRgb = (hex) => {
                    const normalized = hex.replace('#', '')
                    return [
                        parseInt(normalized.slice(0, 2), 16),
                        parseInt(normalized.slice(2, 4), 16),
                        parseInt(normalized.slice(4, 6), 16)
                    ]
                }
                const textColor = (hex) => doc.setTextColor(...hexToRgb(hex))
                const fillColor = (hex) => doc.setFillColor(...hexToRgb(hex))
                const drawColor = (hex) => doc.setDrawColor(...hexToRgb(hex))
                const cleanText = (value) => String(value ?? '').replace(/\s+/g, ' ').trim()
                const titleCase = (value) => cleanText(value).replace(/^\w/, char => char.toUpperCase())
                const statusFor = (score) => score >= 70 ? 'Good' : score >= 50 ? 'Fair' : 'Needs Attention'
                const statusColorFor = (score) => score >= 70 ? colors.green : score >= 50 ? colors.amber : colors.red
                const safeFileName = cleanText(this.patient.name)
                    .replace(/[^a-z0-9_-]+/gi, '_')
                    .replace(/^_+|_+$/g, '') || 'Patient'

                const addFooter = () => {
                    const pageNumber = doc.internal.getNumberOfPages()
                    doc.setFont('helvetica', 'normal')
                    doc.setFontSize(8)
                    textColor('#94a3b8')
                    doc.text('© 2026 Dr. Deepika Singh. All rights reserved. | drdeepikagyno.in', pageWidth / 2, pageHeight - 9, { align: 'center' })
                    doc.text(`Page ${pageNumber}`, pageWidth - margin, pageHeight - 9, { align: 'right' })
                }

                const ensureSpace = (height) => {
                    if (y + height <= pageHeight - 18) return
                    addFooter()
                    doc.addPage()
                    y = 16
                }

                const writeWrapped = (text, x, startY, maxWidth, options = {}) => {
                    const fontSize = options.fontSize || 10
                    const lineHeight = options.lineHeight || fontSize * 0.42
                    const lines = doc.splitTextToSize(cleanText(text), maxWidth)
                    doc.text(lines, x, startY, options.textOptions || {})
                    return startY + (lines.length * lineHeight)
                }

                // Header
                doc.setFont('helvetica', 'bold')
                doc.setFontSize(22)
                textColor(colors.dark)
                doc.text('Dr. Deepika Singh', pageWidth / 2, y, { align: 'center' })
                y += 6
                doc.setFont('helvetica', 'normal')
                doc.setFontSize(11)
                textColor(colors.teal)
                doc.text('Senior Consultant Gynecologist & Obstetrician', pageWidth / 2, y, { align: 'center' })
                y += 5
                doc.setFontSize(9)
                textColor(colors.muted)
                doc.text('MD (AIIMS) | FCLS | MCCOG | FOGSI | IFS | RCOG', pageWidth / 2, y, { align: 'center' })
                y += 6
                drawColor(colors.teal)
                doc.setLineWidth(0.7)
                doc.line(margin, y, pageWidth - margin, y)
                y += 10

                doc.setFont('helvetica', 'bold')
                doc.setFontSize(16)
                textColor(colors.teal)
                doc.text('Fertility Wellness Report', pageWidth / 2, y, { align: 'center' })
                y += 9

                // Patient details
                ensureSpace(22)
                fillColor(colors.light)
                doc.rect(margin, y, contentWidth, 18, 'F')
                doc.setFontSize(10)
                doc.setFont('helvetica', 'normal')
                textColor(colors.muted)
                doc.text('Patient:', margin + 4, y + 7)
                doc.text('Date:', margin + 96, y + 7)
                doc.text('Mode:', margin + 4, y + 14)
                doc.text('Phone:', margin + 96, y + 14)
                doc.setFont('helvetica', 'bold')
                textColor(colors.dark)
                doc.text(cleanText(this.patient.name) || 'Patient', margin + 24, y + 7)
                doc.setFont('helvetica', 'normal')
                textColor(colors.slate)
                doc.text(new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }), margin + 112, y + 7)
                doc.text(titleCase(this.mode), margin + 24, y + 14)
                doc.text(cleanText(this.patient.phone) || '-', margin + 112, y + 14)
                y += 26

                // Score card
                const scoreColor = this.tierData ? this.tierData.ring : colors.teal
                ensureSpace(42)
                fillColor(colors.paleTeal)
                drawColor(scoreColor)
                doc.setLineWidth(0.5)
                doc.roundedRect(margin, y, contentWidth, 36, 3, 3, 'FD')
                doc.setFont('helvetica', 'normal')
                doc.setFontSize(11)
                textColor(colors.muted)
                doc.text('Your Fertility Score', pageWidth / 2, y + 8, { align: 'center' })
                doc.setFont('helvetica', 'bold')
                doc.setFontSize(30)
                textColor(scoreColor)
                doc.text(`${this.score}`, pageWidth / 2 - 4, y + 21, { align: 'right' })
                doc.setFontSize(11)
                textColor('#94a3b8')
                doc.text('/ 100', pageWidth / 2 - 2, y + 21)
                fillColor(scoreColor)
                doc.roundedRect(pageWidth / 2 - 18, y + 24, 36, 7, 3, 3, 'F')
                doc.setFontSize(9)
                textColor('#ffffff')
                doc.text(cleanText(this.tier), pageWidth / 2, y + 29, { align: 'center' })
                y += 41

                if (this.tierData?.message) {
                    ensureSpace(14)
                    doc.setFont('helvetica', 'normal')
                    doc.setFontSize(10)
                    textColor(colors.slate)
                    y = writeWrapped(this.tierData.message, margin, y, contentWidth, { fontSize: 10, lineHeight: 4.5 })
                    y += 5
                }

                // Parameter table
                ensureSpace(20)
                doc.setFont('helvetica', 'bold')
                doc.setFontSize(12)
                textColor(colors.dark)
                doc.text('Parameter Breakdown', margin, y)
                y += 5
                fillColor(colors.teal)
                doc.rect(margin, y, contentWidth, 8, 'F')
                doc.setFontSize(9)
                textColor('#ffffff')
                doc.text('Parameter', margin + 3, y + 5.3)
                doc.text('Score', margin + 124, y + 5.3, { align: 'right' })
                doc.text('Status', margin + contentWidth - 3, y + 5.3, { align: 'right' })
                y += 8

                this.parameterResults.forEach((parameter, index) => {
                    const score = Math.round(Number(parameter.score) || 0)
                    const nameLines = doc.splitTextToSize(cleanText(parameter.name), 92)
                    const rowHeight = Math.max(8, 4 + (nameLines.length * 4.2))
                    ensureSpace(rowHeight)
                    fillColor(index % 2 === 0 ? colors.light : '#ffffff')
                    doc.rect(margin, y, contentWidth, rowHeight, 'F')
                    doc.setFont('helvetica', 'normal')
                    doc.setFontSize(9)
                    textColor(colors.dark)
                    doc.text(nameLines, margin + 3, y + 5)
                    doc.setFont('helvetica', 'bold')
                    doc.text(String(score), margin + 124, y + 5, { align: 'right' })
                    textColor(statusColorFor(score))
                    doc.text(statusFor(score), margin + contentWidth - 3, y + 5, { align: 'right' })
                    drawColor('#e2e8f0')
                    doc.setLineWidth(0.1)
                    doc.line(margin, y + rowHeight, pageWidth - margin, y + rowHeight)
                    y += rowHeight
                })
                y += 8

                if (this.recommendations.length) {
                    ensureSpace(14)
                    doc.setFont('helvetica', 'bold')
                    doc.setFontSize(12)
                    textColor(colors.dark)
                    doc.text('Personalized Recommendations', margin, y)
                    y += 6
                    doc.setFont('helvetica', 'normal')
                    doc.setFontSize(9)
                    textColor(colors.slate)
                    this.recommendations.forEach((recommendation) => {
                        const lines = doc.splitTextToSize(cleanText(recommendation), contentWidth - 7)
                        const blockHeight = lines.length * 4.4 + 2
                        ensureSpace(blockHeight)
                        textColor(colors.teal)
                        doc.text('•', margin + 1, y)
                        textColor(colors.slate)
                        doc.text(lines, margin + 6, y)
                        y += blockHeight
                    })
                    y += 5
                }

                // Consultation details
                ensureSpace(45)
                drawColor(colors.teal)
                doc.setLineWidth(0.7)
                doc.line(margin, y, pageWidth - margin, y)
                y += 7
                doc.setFont('helvetica', 'bold')
                doc.setFontSize(12)
                textColor(colors.dark)
                doc.text('Book a Consultation', pageWidth / 2, y, { align: 'center' })
                y += 7
                fillColor(colors.light)
                doc.rect(margin, y, contentWidth, 31, 'F')
                const leftX = margin + 4
                const rightX = margin + (contentWidth / 2) + 4
                doc.setFontSize(9)
                doc.setFont('helvetica', 'bold')
                textColor(colors.dark)
                doc.text('Dr. Deepika Singh', leftX, y + 6)
                doc.text('Clinic Address', rightX, y + 6)
                doc.text('Phone', leftX, y + 18)
                doc.text('Email', rightX, y + 18)
                doc.setFont('helvetica', 'normal')
                textColor(colors.muted)
                doc.text(['Senior Consultant Gynecologist', 'MD (AIIMS) | FCLS | MCCOG'], leftX, y + 11)
                doc.text(['F-11, South Extension Part 1', 'New Delhi - 110049'], rightX, y + 11)
                doc.text('+91 85959 54095 | WhatsApp: wa.me/918595954095', leftX, y + 23)
                doc.text('drdipikasingh2026@gmail.com', rightX, y + 23)
                doc.text('Mon-Sat: 10 AM - 8 PM | Sunday: 10 AM - 6 PM', leftX, y + 29)
                y += 39

                ensureSpace(18)
                fillColor(colors.amberBg)
                drawColor('#fcd34d')
                doc.roundedRect(margin, y, contentWidth, 16, 2, 2, 'FD')
                doc.setFont('helvetica', 'normal')
                doc.setFontSize(8)
                textColor(colors.amberText)
                const disclaimer = 'DISCLAIMER: This is an indicative wellness score for educational purposes only. It is NOT a medical diagnosis. Please consult Dr. Deepika Singh for a comprehensive fertility evaluation.'
                doc.text(doc.splitTextToSize(disclaimer, contentWidth - 8), margin + 4, y + 6)

                addFooter()
                doc.save(`Fertility-Report-${safeFileName}.pdf`)
            } catch (e) {
                console.error('PDF generation failed:', e)
                alert('Could not generate PDF. Please try again.')
            } finally {
                this.pdfGenerating = false
            }
        },

        resetCalculator() {
            this.currentStep = 1
            this.patient = { name: '', phone: '', _honey: '' }
            this.patientError = { name: '', phone: '' }
            this.patientTouched = { name: false, phone: false }
            this.basic = {
                age: '', menstrualRegularity: '', periodPain: '',
                height: '', weight: '', conditions: [],
                smoking: '', stress: '', pregnancyHistory: '', familyHistory: ''
            }
            this.basicError = { age: '', menstrualRegularity: '', periodPain: '', height: '', weight: '', smoking: '', stress: '', pregnancyHistory: '', familyHistory: '' }
            this.basicTouched = { age: false, menstrualRegularity: false, periodPain: false, height: false, weight: false, smoking: false, stress: false, pregnancyHistory: false, familyHistory: false }
            this.lab = {
                amh: '', fsh: '', lh: '', tsh: '',
                prolactin: '', afc: '', vitaminD: '', hemoglobin: ''
            }
            this.score = null
            this.tier = null
            this.tierData = null
            this.parameterResults = []
            this.recommendations = []
            this.showResults = false
            this.scoreAnimation = false
            this.submitMessage = ''
            this.submitMessageType = ''
            sessionStorage.removeItem('fertilityScoreState')
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }))
})

Alpine.start()
