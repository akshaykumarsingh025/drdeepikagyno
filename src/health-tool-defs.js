// ============================================================================
// HEALTH TOOL DEFINITIONS
// ----------------------------------------------------------------------------
// Each tool is pure data + a compute() function. The generic engine in
// health-tools.js handles lead capture, step navigation, rendering and PDF.
//
// compute(a) receives the raw answers object and returns:
//   { scoreValue, scoreDisplay, scoreCaption, headline, tone, message,
//     urgent, stats[], table, timeline[], recommendations[], sheet }
//
// Scales / instruments are re-worded originals informed by published clinical
// criteria (PBAC, WHO anaemia cut-offs, IOM gestational weight gain, WHO MEC,
// DIPSI, ACOG/FOGSI screening intervals, DSM-5 PMDD). They are screening aids,
// never diagnoses.
// ============================================================================

export const N = (v) => {
    const n = parseFloat(v)
    return isNaN(n) ? 0 : n
}
const has = (v) => v !== undefined && v !== null && v !== ''
const r1 = (n) => Math.round(n * 10) / 10
const fmt = (d) => d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
const addDays = (d, n) => new Date(d.getTime() + n * 86400000)
const today0 = () => { const t = new Date(); t.setHours(0, 0, 0, 0); return t }

// Field builders --------------------------------------------------------------
const sel = (key, label, options, o = {}) => ({ key, type: 'select', label, options, required: true, ...o })
const num = (key, label, o = {}) => ({ key, type: 'number', label, required: true, ...o })
const dat = (key, label, o = {}) => ({ key, type: 'date', label, required: true, ...o })
const chk = (key, label, options, o = {}) => ({ key, type: 'checkboxes', label, options, required: false, ...o })
const note = (text, o = {}) => ({ type: 'note', text, ...o })

const S04 = [['0', 'None'], ['1', 'Mild'], ['2', 'Moderate'], ['3', 'Severe'], ['4', 'Very severe']]
const S03 = [['0', 'Not at all'], ['1', 'A little'], ['2', 'Quite a bit'], ['3', 'A lot']]
const scale = (key, label, options = S04, o = {}) => ({ key, type: 'scale', label, options, required: true, ...o })

const YN = [['', 'Select...'], ['no', 'No'], ['yes', 'Yes']]

// ============================================================================
// 1. HEAVY PERIOD CHECKER  (PBAC-based)
// ============================================================================
const heavyPeriod = {
    id: 'heavy-period',
    name: 'Heavy Period Checker',
    short: 'Heavy Period Checker',
    icon: 'fa-droplet',
    tone: 'rose',
    tagline: 'Is my bleeding too heavy?',
    blurb: 'Score your period using the pictorial blood-loss chart used in clinics. Find out if your bleeding is genuinely heavy and needs treatment.',
    cta: 'Check My Flow',
    intro: 'Count what you used during your last full period. Estimates are fine — this is a screening score, not a lab test.',
    pdfTitle: 'Heavy Menstrual Bleeding Assessment',
    keywords: 'heavy periods, menorrhagia, PBAC score',
    steps: [
        {
            title: 'About Your Period',
            desc: 'A few basics about your cycle.',
            fields: [
                num('age', 'Your age', { min: 10, max: 60, unit: 'years', placeholder: 'e.g. 24' }),
                sel('cycleLength', 'How many days between periods?', [['', 'Select...'], ['short', 'Less than 21 days'], ['normal', '21 to 35 days'], ['long', '36 to 90 days'], ['verylong', 'More than 90 days / very unpredictable']]),
                num('bleedDays', 'How many days does bleeding last?', { min: 1, max: 20, unit: 'days', placeholder: 'e.g. 6' })
            ]
        },
        {
            title: 'Bleeding Amount',
            desc: 'Think about your last full period and count across all days. Rough numbers are fine.',
            fields: [
                sel('productType', 'What do you mainly use?', [['', 'Select...'], ['pad', 'Sanitary pads'], ['tampon', 'Tampons'], ['cup', 'Menstrual cup'], ['cloth', 'Cloth']]),
                num('lightP', 'Lightly stained pads/tampons (small patch only)', { min: 0, max: 100, required: false, placeholder: 'e.g. 8' }),
                num('modP', 'Moderately soaked (about half full)', { min: 0, max: 100, required: false, placeholder: 'e.g. 6' }),
                num('fullP', 'Completely soaked / had to change urgently', { min: 0, max: 100, required: false, placeholder: 'e.g. 4' }),
                num('smallClots', 'Small clots (smaller than a 1-rupee coin)', { min: 0, max: 100, required: false, placeholder: 'e.g. 3' }),
                num('bigClots', 'Large clots (bigger than a 1-rupee coin)', { min: 0, max: 100, required: false, placeholder: 'e.g. 1' }),
                num('flooding', 'Times blood leaked onto clothes or bedding', { min: 0, max: 50, required: false, placeholder: 'e.g. 2' })
            ]
        },
        {
            title: 'How It Affects You',
            desc: 'These answers help judge whether the bleeding is causing harm.',
            fields: [
                sel('soakHour', 'Do you ever soak through a pad or tampon in under an hour?', [['', 'Select...'], ['no', 'No'], ['sometimes', 'Occasionally'], ['often', 'Yes, most periods']]),
                sel('nightChange', 'Do you have to change protection during the night?', [['', 'Select...'], ['no', 'No'], ['once', 'Once a night'], ['multiple', 'Two or more times']]),
                sel('doubling', 'Do you use two pads together, or a pad plus a tampon?', YN),
                sel('missDays', 'Do you miss school, college or work because of your period?', [['', 'Select...'], ['no', 'Never'], ['some', 'Occasionally'], ['often', 'Most months']]),
                sel('tired', 'Do you feel unusually tired, breathless or dizzy?', [['', 'Select...'], ['no', 'No'], ['mild', 'Sometimes'], ['yes', 'Yes, often']]),
                sel('painLevel', 'How bad is your period pain?', [['', 'Select...'], ['none', 'None or very mild'], ['mod', 'Moderate, painkillers help'], ['severe', 'Severe, painkillers barely help']])
            ]
        }
    ],
    compute(a) {
        // Pictorial Blood-loss Assessment Chart scoring
        const score = N(a.lightP) * 1 + N(a.modP) * 5 + N(a.fullP) * 20 +
            N(a.smallClots) * 1 + N(a.bigClots) * 5 + N(a.flooding) * 5

        let headline, tone, message
        if (score < 100) {
            headline = 'Within Normal Range'; tone = 'emerald'
            message = 'Your estimated blood loss is within the normal range. Periods vary a lot between women, and yours does not currently meet the clinical definition of heavy menstrual bleeding.'
        } else if (score < 150) {
            headline = 'Heavy Bleeding'; tone = 'amber'
            message = 'A score of 100 or more meets the clinical definition of heavy menstrual bleeding. This is common and very treatable — but it is worth investigating rather than putting up with.'
        } else if (score < 250) {
            headline = 'Very Heavy Bleeding'; tone = 'orange'
            message = 'Your blood loss is well above the heavy-bleeding threshold. At this level, iron loss adds up quickly and anaemia is likely. Please arrange a check-up.'
        } else {
            headline = 'Severe Bleeding'; tone = 'red'
            message = 'Your estimated blood loss is severe. This level of bleeding almost always causes anaemia and usually has a treatable cause such as fibroids, adenomyosis, a hormonal imbalance or a clotting problem.'
        }

        const flags = []
        if (a.soakHour === 'often') flags.push('soaking through protection in under an hour')
        else if (a.soakHour === 'sometimes') flags.push('occasionally soaking through in under an hour')
        if (a.bigClots && N(a.bigClots) > 0) flags.push('passing large clots')
        if (a.nightChange === 'multiple') flags.push('changing protection more than once a night')
        if (a.doubling === 'yes') flags.push('needing double protection')
        if (N(a.bleedDays) > 7) flags.push('bleeding for more than 7 days')
        if (a.tired === 'yes') flags.push('tiredness, breathlessness or dizziness')
        if (a.missDays === 'often') flags.push('missing school, college or work')

        let urgent = null
        if (a.tired === 'yes' && score >= 150) {
            urgent = 'Heavy bleeding together with tiredness, breathlessness or dizziness strongly suggests iron-deficiency anaemia. Please get a haemoglobin (CBC) and ferritin test done soon, and see a gynaecologist.'
        }

        const recs = []
        if (score >= 100) {
            recs.push('Ask for a complete blood count (CBC) and serum ferritin. Heavy periods are the commonest cause of iron deficiency in Indian women, and it is often missed.')
            recs.push('A pelvic ultrasound can check for fibroids, adenomyosis, polyps or ovarian causes — the most common treatable reasons for heavy bleeding.')
            recs.push('Treatment options range from tranexamic acid and hormonal tablets to the hormonal IUD, which reduces blood loss by up to 90%. Surgery is rarely the first step.')
        } else {
            recs.push('Your flow is in the normal range. Keep an eye on any change — a period that becomes noticeably heavier than your own baseline is worth reporting.')
        }
        if (N(a.bleedDays) > 7) recs.push('Bleeding for more than 7 days is outside the normal range regardless of how heavy each day feels, and should be evaluated.')
        if (a.cycleLength === 'long' || a.cycleLength === 'verylong') recs.push('Long or unpredictable gaps between periods can point to PCOS or a thyroid problem. Consider the PCOS Risk Screener and a thyroid check.')
        if (a.cycleLength === 'short') recs.push('Cycles shorter than 21 days mean more periods per year and more total blood loss. This pattern deserves a hormonal review.')
        if (a.painLevel === 'severe') recs.push('Severe pain that painkillers barely touch, alongside heavy bleeding, raises the possibility of endometriosis or adenomyosis. The Period Pain Checker goes into this in more detail.')
        if (N(a.age) < 20) recs.push('In teenagers, heavy periods from the very first cycles can occasionally signal an inherited bleeding disorder such as von Willebrand disease. Mention this to your doctor if bleeding has always been heavy.')
        if (a.tired !== 'no') recs.push('Include iron-rich foods daily — dates, ragi, green leafy vegetables, rajma, jaggery — with a source of vitamin C such as lemon or amla to improve absorption.')

        return {
            scoreValue: Math.min(100, Math.round((score / 300) * 100)),
            scoreDisplay: String(score),
            scoreCaption: 'PBAC Score',
            headline, tone, message, urgent,
            stats: [
                { label: 'Blood Loss Score', value: String(score), note: '100+ = heavy' },
                { label: 'Bleeding Duration', value: N(a.bleedDays) + ' days', note: 'Normal: up to 7' },
                { label: 'Large Clots', value: N(a.bigClots) > 0 ? 'Yes' : 'No', note: 'Coin-sized or bigger' },
                { label: 'Warning Signs', value: String(flags.length), note: flags.length ? 'See list below' : 'None reported' }
            ],
            table: flags.length ? {
                title: 'Warning Signs You Reported',
                columns: ['Sign'],
                rows: flags.map(f => [f.charAt(0).toUpperCase() + f.slice(1)])
            } : null,
            recommendations: recs,
            sheet: 'PBAC ' + score + ' - ' + headline
        }
    }
}

// ============================================================================
// 2. ANAEMIA RISK SCREENER
// ============================================================================
const anaemia = {
    id: 'anaemia',
    name: 'Anaemia Risk Screener',
    short: 'Anaemia Screener',
    icon: 'fa-heart-pulse',
    tone: 'red',
    tagline: 'Low iron affects 1 in 2 Indian women',
    blurb: 'Check your risk of iron-deficiency anaemia from symptoms, periods and diet. Enter your haemoglobin if you have a recent report.',
    cta: 'Check My Risk',
    intro: 'More than half of Indian women aged 15-49 are anaemic, and most do not know it. This takes two minutes.',
    pdfTitle: 'Anaemia Risk Assessment',
    keywords: 'anemia test, low hemoglobin, iron deficiency women',
    steps: [
        {
            title: 'About You',
            fields: [
                num('age', 'Your age', { min: 10, max: 80, unit: 'years' }),
                sel('stage', 'Which describes you right now?', [['', 'Select...'], ['normal', 'Not pregnant or breastfeeding'], ['pregnant', 'Pregnant'], ['postpartum', 'Delivered in the last 6 months'], ['breastfeeding', 'Breastfeeding']]),
                sel('diet', 'Your usual diet', [['', 'Select...'], ['nonveg', 'Non-vegetarian (meat/fish regularly)'], ['eggveg', 'Vegetarian + eggs'], ['veg', 'Pure vegetarian'], ['vegan', 'Vegan']]),
                sel('tea', 'Do you drink tea or coffee with or right after meals?', [['', 'Select...'], ['no', 'Rarely'], ['sometimes', 'Sometimes'], ['yes', 'Almost every meal']])
            ]
        },
        {
            title: 'Symptoms',
            desc: 'How much have you noticed each of these in the last month?',
            fields: [
                scale('sFatigue', 'Tiredness or weakness that rest does not fix', S03),
                scale('sBreath', 'Breathlessness climbing stairs or walking fast', S03),
                scale('sDizzy', 'Dizziness or feeling faint on standing up', S03),
                scale('sPalp', 'Heart racing or pounding', S03),
                scale('sPale', 'Pale skin, inner eyelids, tongue or nail beds', S03),
                scale('sHair', 'Hair fall or brittle, spoon-shaped nails', S03),
                scale('sHead', 'Frequent headaches or poor concentration', S03),
                sel('sPica', 'Do you crave ice, mud, chalk, raw rice or slate?', [['', 'Select...'], ['no', 'No'], ['sometimes', 'Occasionally'], ['yes', 'Yes, strongly']], { hint: 'Called pica — a classic sign of iron deficiency' }),
                sel('sLegs', 'Restless, crawling feeling in your legs at night?', YN)
            ]
        },
        {
            title: 'Risk Factors',
            fields: [
                sel('heavyPeriods', 'Are your periods heavy?', [['', 'Select...'], ['no', 'No, light or normal'], ['mod', 'Somewhat heavy'], ['yes', 'Yes — clots, flooding, or lasting over 7 days']]),
                chk('rf', 'Tick anything that applies to you', [
                    ['recentPreg', 'Given birth in the last year'],
                    ['closeSpacing', 'Two or more pregnancies close together'],
                    ['gi', 'Ulcers, piles, or blood in stool'],
                    ['known', 'Told before that I am anaemic'],
                    ['transfusion', 'Needed a blood transfusion in the past'],
                    ['surgery', 'Recent surgery or major blood loss'],
                    ['worms', 'Live in an area where worm infection is common'],
                    ['thal', 'Family history of thalassaemia or sickle cell']
                ]),
                sel('supplement', 'Are you currently taking iron tablets?', [['', 'Select...'], ['no', 'No'], ['irregular', 'Yes, but irregularly'], ['yes', 'Yes, regularly']])
            ]
        },
        {
            title: 'Lab Values (Optional)',
            desc: 'Have a recent blood report? Entering it makes this far more accurate. Skip if you do not.',
            optional: true,
            fields: [
                num('hb', 'Haemoglobin (g/dL)', { min: 2, max: 20, step: 0.1, required: false, placeholder: 'e.g. 10.4', hint: 'Normal for women: 12 or above' }),
                num('ferritin', 'Serum ferritin (ng/mL)', { min: 0, max: 1000, step: 1, required: false, placeholder: 'e.g. 12', hint: 'Below 30 suggests low iron stores' }),
                num('mcv', 'MCV (fL)', { min: 40, max: 130, step: 0.1, required: false, placeholder: 'e.g. 72', hint: 'Below 80 suggests iron deficiency' })
            ]
        }
    ],
    compute(a) {
        let sym = 0
        const symKeys = ['sFatigue', 'sBreath', 'sDizzy', 'sPalp', 'sPale', 'sHair', 'sHead']
        symKeys.forEach(k => { sym += N(a[k]) })
        if (a.sPica === 'yes') sym += 4; else if (a.sPica === 'sometimes') sym += 2
        if (a.sLegs === 'yes') sym += 2
        // symptom max = 7*3 + 4 + 2 = 27

        let risk = 0
        if (a.heavyPeriods === 'yes') risk += 12; else if (a.heavyPeriods === 'mod') risk += 6
        const rf = Array.isArray(a.rf) ? a.rf : []
        if (rf.includes('recentPreg')) risk += 6
        if (rf.includes('closeSpacing')) risk += 4
        if (rf.includes('gi')) risk += 6
        if (rf.includes('known')) risk += 8
        if (rf.includes('transfusion')) risk += 4
        if (rf.includes('surgery')) risk += 4
        if (rf.includes('worms')) risk += 3
        if (rf.includes('thal')) risk += 4
        if (a.stage === 'pregnant') risk += 6
        else if (a.stage === 'postpartum') risk += 5
        else if (a.stage === 'breastfeeding') risk += 3
        if (a.diet === 'veg') risk += 3; else if (a.diet === 'vegan') risk += 5
        if (a.tea === 'yes') risk += 3; else if (a.tea === 'sometimes') risk += 1
        // risk max ~ 60

        const pct = Math.min(100, Math.round(((sym / 27) * 55) + ((risk / 60) * 45)))

        // Lab overrides — WHO haemoglobin thresholds
        const hb = has(a.hb) ? N(a.hb) : null
        const isPreg = a.stage === 'pregnant'
        const cutoff = isPreg ? 11 : 12
        let headline, tone, message, hbClass = null

        if (hb !== null && hb > 0) {
            if (hb >= cutoff) { hbClass = 'No anaemia'; headline = 'Haemoglobin Normal'; tone = 'emerald' }
            else if (hb >= (isPreg ? 10 : 11)) { hbClass = 'Mild anaemia'; headline = 'Mild Anaemia'; tone = 'amber' }
            else if (hb >= 7) { hbClass = 'Moderate anaemia'; headline = 'Moderate Anaemia'; tone = 'orange' }
            else { hbClass = 'Severe anaemia'; headline = 'Severe Anaemia'; tone = 'red' }
            message = hb >= cutoff
                ? 'Your haemoglobin is at or above the WHO cut-off of ' + cutoff + ' g/dL. Note that iron stores can still be low even with a normal haemoglobin, so if you have symptoms, ask for a ferritin test as well.'
                : 'Your haemoglobin of ' + hb + ' g/dL is below the WHO cut-off of ' + cutoff + ' g/dL for ' + (isPreg ? 'pregnancy' : 'non-pregnant women') + ', which confirms anaemia. The important next step is finding the cause, not just taking iron tablets.'
        } else {
            if (pct < 25) { headline = 'Low Risk'; tone = 'emerald'; message = 'Your symptoms and risk factors suggest anaemia is unlikely. A haemoglobin test at your next check-up is still worthwhile — anaemia is often silent.' }
            else if (pct < 45) { headline = 'Moderate Risk'; tone = 'amber'; message = 'You have some symptoms or risk factors that make anaemia possible. A simple, cheap blood test (CBC) will settle it.' }
            else if (pct < 65) { headline = 'High Risk'; tone = 'orange'; message = 'Your pattern of symptoms and risk factors is quite suggestive of iron-deficiency anaemia. Please get a CBC and ferritin test.' }
            else { headline = 'Very High Risk'; tone = 'red'; message = 'You have a strong pattern of anaemia symptoms alongside significant risk factors. Please get tested soon rather than starting supplements blindly.' }
        }

        let urgent = null
        if (hb !== null && hb > 0 && hb < 7) {
            urgent = 'A haemoglobin below 7 g/dL is severe anaemia and needs medical attention promptly — not just iron tablets. Please contact a doctor without delay.'
        } else if (a.sBreath === '3' && a.sPalp === '3') {
            urgent = 'Marked breathlessness together with a racing heart needs prompt medical assessment. Please do not wait for a routine appointment.'
        }

        const recs = []
        if (hb === null || hb === 0) recs.push('Get a complete blood count (CBC) with serum ferritin. Ferritin is the key test — it shows iron stores and drops long before haemoglobin does.')
        if (a.heavyPeriods === 'yes' || a.heavyPeriods === 'mod') recs.push('Heavy periods are the single most common cause of iron deficiency in women. Treating the bleeding fixes the anaemia far more reliably than iron alone — try the Heavy Period Checker.')
        if (has(a.ferritin) && N(a.ferritin) < 30) recs.push('A ferritin below 30 ng/mL confirms depleted iron stores even if your haemoglobin looks acceptable. This alone can explain fatigue and hair fall.')
        if (has(a.mcv) && N(a.mcv) < 80) recs.push('A low MCV (small red cells) fits iron deficiency, but also thalassaemia trait, which is common in India. Ask about HPLC testing if iron treatment does not work.')
        if (a.diet === 'veg' || a.diet === 'vegan') recs.push('Plant iron is absorbed poorly. Pair iron foods — ragi, bajra, rajma, spinach, dates, jaggery, sesame — with vitamin C such as lemon, amla or orange to multiply absorption.')
        if (a.tea === 'yes' || a.tea === 'sometimes') recs.push('Tannins in tea and coffee block iron absorption substantially. Keep them at least one hour away from meals — a small change with a real effect.')
        if (a.supplement === 'irregular') recs.push('Iron tablets need several months of consistent use to refill stores. Taking them on alternate days often works better and causes less nausea than daily dosing.')
        if (a.stage === 'pregnant') recs.push('In pregnancy, anaemia raises the risk of preterm birth, low birth weight and postpartum haemorrhage. Iron-folic acid supplementation is standard from the second trimester.')
        if (rf.includes('thal')) recs.push('With a family history of thalassaemia, ask for HPLC before taking long-term iron. Iron given unnecessarily to a thalassaemia carrier can cause harm.')
        if (rf.includes('worms')) recs.push('Routine deworming (albendazole) is recommended alongside iron in areas where worm infection is common.')
        if (rf.includes('gi')) recs.push('Blood loss from piles or an ulcer must be treated at source. Ask about a stool occult blood test.')
        recs.push('Cook in an iron kadhai when you can — it measurably raises the iron content of food, especially acidic dishes.')

        return {
            scoreValue: hb !== null && hb > 0 ? Math.min(100, Math.round((hb / cutoff) * 100)) : pct,
            scoreDisplay: hb !== null && hb > 0 ? String(r1(hb)) : pct + '%',
            scoreCaption: hb !== null && hb > 0 ? 'Haemoglobin (g/dL)' : 'Risk Score',
            headline, tone, message, urgent,
            stats: [
                { label: hb !== null && hb > 0 ? 'WHO Classification' : 'Symptom Load', value: hbClass || (sym > 14 ? 'High' : sym > 7 ? 'Moderate' : 'Low'), note: hb !== null && hb > 0 ? 'Cut-off ' + cutoff + ' g/dL' : sym + ' of 27' },
                { label: 'Risk Factor Score', value: risk + ' pts', note: risk >= 20 ? 'Significant' : risk >= 10 ? 'Some' : 'Few' },
                { label: 'Ferritin', value: has(a.ferritin) ? N(a.ferritin) + ' ng/mL' : 'Not entered', note: has(a.ferritin) ? (N(a.ferritin) < 30 ? 'Low iron stores' : 'Adequate') : 'Worth testing' },
                { label: 'Heavy Periods', value: a.heavyPeriods === 'yes' ? 'Yes' : a.heavyPeriods === 'mod' ? 'Somewhat' : 'No', note: 'Commonest cause' }
            ],
            recommendations: recs,
            sheet: (hb !== null && hb > 0 ? 'Hb ' + r1(hb) + ' - ' : 'Risk ' + pct + '% - ') + headline
        }
    }
}

// ============================================================================
// 3. MENOPAUSE SYMPTOM CHECKER
// ============================================================================
const menopause = {
    id: 'menopause',
    name: 'Menopause Symptom Checker',
    short: 'Menopause Checker',
    icon: 'fa-temperature-half',
    tone: 'purple',
    tagline: 'Score your symptoms across 11 areas',
    blurb: 'Rate hot flushes, sleep, mood and urogenital symptoms to see how much menopause is affecting you — and what actually helps.',
    cta: 'Score My Symptoms',
    intro: 'Rate each symptom as you have experienced it over the past month. There are no right answers.',
    pdfTitle: 'Menopause Symptom Report',
    keywords: 'menopause symptoms, perimenopause, hot flashes treatment',
    steps: [
        {
            title: 'Your Stage',
            fields: [
                num('age', 'Your age', { min: 30, max: 75, unit: 'years' }),
                sel('periods', 'Your periods over the last 12 months', [['', 'Select...'], ['regular', 'Still regular'], ['irregular', 'Irregular — cycle length changing'], ['skipping', 'Skipping months at a time'], ['stopped1', 'Stopped, but less than 12 months ago'], ['stopped12', 'Stopped for 12 months or more'], ['surgery', 'Stopped after surgery to remove ovaries/uterus']]),
                sel('hrt', 'Are you on any hormone therapy currently?', [['', 'Select...'], ['no', 'No'], ['yes', 'Yes'], ['past', 'Used in the past']])
            ]
        },
        {
            title: 'Physical Symptoms',
            desc: 'How severe has each been over the past month?',
            fields: [
                scale('m1', 'Hot flushes or sudden sweating'),
                scale('m2', 'Heart discomfort — racing, skipping or pounding'),
                scale('m3', 'Trouble sleeping, or waking and not falling back asleep'),
                scale('m4', 'Joint pain, muscle aches or stiffness')
            ]
        },
        {
            title: 'Mood & Energy',
            fields: [
                scale('m5', 'Low mood, tearfulness or loss of interest'),
                scale('m6', 'Irritability, short temper or feeling on edge'),
                scale('m7', 'Anxiety, restlessness or panicky feelings'),
                scale('m8', 'Physical and mental exhaustion, or poor memory and focus')
            ]
        },
        {
            title: 'Urinary & Intimate Health',
            desc: 'These are the symptoms women mention least and treat most easily.',
            fields: [
                scale('m9', 'Bladder problems — urgency, frequency, leaking or infections'),
                scale('m10', 'Vaginal dryness, burning or itching'),
                scale('m11', 'Discomfort during intimacy, or loss of desire')
            ]
        },
        {
            title: 'Bone & Heart Risk (Optional)',
            optional: true,
            fields: [
                chk('bone', 'Tick anything that applies', [
                    ['fracture', 'Broken a bone after a minor fall'],
                    ['family', 'Parent had a hip fracture or osteoporosis'],
                    ['steroid', 'Long-term steroid use'],
                    ['smoke', 'Current smoker'],
                    ['thin', 'Very slim build (BMI under 19)'],
                    ['early', 'Periods stopped before age 45'],
                    ['bp', 'High blood pressure'],
                    ['chol', 'High cholesterol'],
                    ['diab', 'Diabetes'],
                    ['sedentary', 'Little or no weight-bearing exercise']
                ])
            ]
        }
    ],
    compute(a) {
        const som = N(a.m1) + N(a.m2) + N(a.m3) + N(a.m4)
        const psy = N(a.m5) + N(a.m6) + N(a.m7) + N(a.m8)
        const uro = N(a.m9) + N(a.m10) + N(a.m11)
        const total = som + psy + uro // 0-44

        let headline, tone, message
        if (total <= 4) { headline = 'Minimal Symptoms'; tone = 'emerald'; message = 'You are reporting little or no symptom burden. Focus stays on prevention — bone density, heart health and staying active.' }
        else if (total <= 8) { headline = 'Mild Symptoms'; tone = 'teal'; message = 'Your symptoms are mild. Lifestyle measures usually manage this level well, and it is a good moment to get baseline health checks done.' }
        else if (total <= 16) { headline = 'Moderate Symptoms'; tone = 'amber'; message = 'Your symptoms are at a level that noticeably affects daily life. Effective treatments exist, and many women put up with this far longer than they need to.' }
        else { headline = 'Severe Symptoms'; tone = 'red'; message = 'Your symptom burden is high. This is very treatable — please do not accept it as something to simply endure. A consultation can make a substantial difference.' }

        let stage = 'Reproductive years'
        if (a.periods === 'surgery') stage = 'Surgical menopause'
        else if (a.periods === 'stopped12') stage = 'Postmenopause'
        else if (a.periods === 'stopped1') stage = 'Late transition'
        else if (a.periods === 'skipping') stage = 'Late perimenopause'
        else if (a.periods === 'irregular') stage = 'Early perimenopause'
        else if (N(a.age) >= 45) stage = 'Late reproductive'

        const bone = Array.isArray(a.bone) ? a.bone : []
        const boneRisk = ['fracture', 'family', 'steroid', 'smoke', 'thin', 'early', 'sedentary'].filter(k => bone.includes(k)).length
        const heartRisk = ['bp', 'chol', 'diab', 'smoke'].filter(k => bone.includes(k)).length

        let urgent = null
        if (a.periods === 'stopped12' && false) urgent = null
        if (a.periods === 'stopped12' && a.m1 !== undefined) {
            // no urgency by default
        }

        const recs = []
        const domains = [{ n: 'Physical', v: som, m: 16 }, { n: 'Mood', v: psy, m: 16 }, { n: 'Urogenital', v: uro, m: 12 }]
        const worst = domains.slice().sort((x, y) => (y.v / y.m) - (x.v / x.m))[0]

        if (som >= 8) recs.push('Hot flushes and night sweats respond well to treatment. Menopausal hormone therapy remains the most effective option for most women under 60, and non-hormonal alternatives exist if it is not suitable for you.')
        if (N(a.m3) >= 3) recs.push('Poor sleep amplifies every other menopausal symptom. Treating night sweats often fixes the sleep problem without needing sleeping tablets.')
        if (psy >= 8) recs.push('Mood changes in perimenopause are hormonal, not a character flaw. They often respond to hormone therapy, and sometimes need specific treatment — either way it is worth raising openly.')
        if (uro >= 4) recs.push('Vaginal dryness and bladder symptoms do not improve on their own and tend to worsen with time. Low-dose local vaginal oestrogen is safe, highly effective, and works even for women who cannot take systemic hormones.')
        if (N(a.m11) >= 2) recs.push('Discomfort during intimacy is extremely common after menopause and almost always treatable. Please do mention it — most women never bring it up.')
        if (a.periods === 'stopped1' || a.periods === 'irregular' || a.periods === 'skipping') recs.push('Pregnancy is still possible until 12 months without a period. Contraception is advised until then if relevant.')
        if (boneRisk >= 2 || a.periods === 'surgery' || bone.includes('early')) recs.push('Your bone-risk profile warrants a DEXA bone density scan. Bone loss is fastest in the first 5 years after periods stop, and it is silent until a fracture happens.')
        if (heartRisk >= 1) recs.push('Cardiovascular risk rises sharply after menopause. Ask for a lipid profile, blood pressure check and HbA1c — these matter more than most menopause symptoms in the long run.')
        recs.push('Aim for 1,000-1,200 mg of calcium daily and get vitamin D checked — deficiency is near-universal in Indian women and worsens joint pain and fatigue.')
        recs.push('Weight-bearing and resistance exercise twice a week protects bone density and muscle mass better than any supplement.')
        if (a.periods === 'stopped12') recs.push('Any bleeding after 12 months without a period is abnormal and must be evaluated promptly, even if it is just spotting.')

        return {
            scoreValue: Math.round((total / 44) * 100),
            scoreDisplay: String(total),
            scoreCaption: 'Symptom Score / 44',
            headline, tone, message, urgent,
            stats: [
                { label: 'Likely Stage', value: stage, note: 'Based on your periods' },
                { label: 'Physical', value: som + ' / 16', note: som >= 8 ? 'High' : som >= 4 ? 'Moderate' : 'Low' },
                { label: 'Mood & Energy', value: psy + ' / 16', note: psy >= 8 ? 'High' : psy >= 4 ? 'Moderate' : 'Low' },
                { label: 'Urogenital', value: uro + ' / 12', note: uro >= 6 ? 'High' : uro >= 3 ? 'Moderate' : 'Low' }
            ],
            table: {
                title: 'Domain Breakdown',
                columns: ['Domain', 'Score', 'Level'],
                rows: [
                    ['Physical (flushes, sleep, joints)', som + ' / 16', som >= 8 ? 'High' : som >= 4 ? 'Moderate' : 'Low'],
                    ['Mood & energy', psy + ' / 16', psy >= 8 ? 'High' : psy >= 4 ? 'Moderate' : 'Low'],
                    ['Urogenital & intimate', uro + ' / 12', uro >= 6 ? 'High' : uro >= 3 ? 'Moderate' : 'Low'],
                    ['Most affected area', worst.n, Math.round((worst.v / worst.m) * 100) + '%']
                ]
            },
            recommendations: recs,
            sheet: 'Menopause ' + total + '/44 - ' + headline + ' (' + stage + ')'
        }
    }
}

// ============================================================================
// 4. PREGNANCY WEIGHT GAIN TRACKER
// ============================================================================
const pregWeight = {
    id: 'preg-weight',
    name: 'Pregnancy Weight Gain Tracker',
    short: 'Weight Gain Tracker',
    icon: 'fa-weight-scale',
    tone: 'teal',
    tagline: 'Are you gaining the right amount?',
    blurb: 'Check your pregnancy weight gain against evidence-based targets for your pre-pregnancy BMI, with a week-by-week plan.',
    cta: 'Check My Gain',
    intro: 'You will need your pre-pregnancy weight and your current weight.',
    pdfTitle: 'Pregnancy Weight Gain Report',
    keywords: 'pregnancy weight gain calculator, weight gain in pregnancy chart',
    steps: [
        {
            title: 'Your Measurements',
            fields: [
                num('height', 'Height', { min: 130, max: 200, unit: 'cm', placeholder: 'e.g. 158' }),
                num('preWeight', 'Weight before pregnancy', { min: 30, max: 160, step: 0.1, unit: 'kg', placeholder: 'e.g. 55' }),
                num('curWeight', 'Weight today', { min: 30, max: 200, step: 0.1, unit: 'kg', placeholder: 'e.g. 62' }),
                num('week', 'How many weeks pregnant are you?', { min: 1, max: 42, unit: 'weeks', placeholder: 'e.g. 26' }),
                sel('twins', 'Are you carrying twins?', [['', 'Select...'], ['no', 'No, single baby'], ['yes', 'Yes, twins']])
            ]
        }
    ],
    compute(a) {
        const h = N(a.height) / 100
        const pre = N(a.preWeight), cur = N(a.curWeight), wk = N(a.week)
        const bmi = r1(pre / (h * h))
        const twins = a.twins === 'yes'

        let cat, catLabel
        if (bmi < 18.5) { cat = 'under'; catLabel = 'Underweight' }
        else if (bmi < 25) { cat = 'normal'; catLabel = 'Normal weight' }
        else if (bmi < 30) { cat = 'over'; catLabel = 'Overweight' }
        else { cat = 'obese'; catLabel = 'Obese' }

        // Institute of Medicine total gain ranges (kg)
        const totals = twins
            ? { under: [22.5, 28], normal: [17, 25], over: [14, 23], obese: [11, 19] }
            : { under: [12.5, 18], normal: [11.5, 16], over: [7, 11.5], obese: [5, 9] }
        // Weekly rate for 2nd/3rd trimester (kg/week)
        const rates = twins
            ? { under: [0.6, 0.8], normal: [0.6, 0.8], over: [0.5, 0.7], obese: [0.4, 0.6] }
            : { under: [0.44, 0.58], normal: [0.35, 0.5], over: [0.23, 0.33], obese: [0.17, 0.27] }
        const firstTri = twins ? [0.5, 2.5] : (cat === 'obese' ? [0.2, 2] : cat === 'over' ? [0.5, 2] : [0.5, 2])

        const rangeAt = (w) => {
            if (w <= 13) {
                const f = Math.min(1, w / 13)
                return [r1(firstTri[0] * f), r1(firstTri[1] * f)]
            }
            const extra = w - 13
            return [r1(firstTri[0] + rates[cat][0] * extra), r1(firstTri[1] + rates[cat][1] * extra)]
        }

        const gain = r1(cur - pre)
        const [lo, hi] = rangeAt(wk)
        let headline, tone, message
        if (gain < lo) {
            const short = r1(lo - gain)
            headline = 'Below Target'; tone = 'amber'
            message = 'At ' + wk + ' weeks you have gained ' + gain + ' kg, which is about ' + short + ' kg below the expected range of ' + lo + '-' + hi + ' kg. Gaining too little is linked with low birth weight and preterm birth, so this is worth discussing.'
        } else if (gain <= hi) {
            headline = 'On Track'; tone = 'emerald'
            message = 'At ' + wk + ' weeks you have gained ' + gain + ' kg, comfortably inside the expected range of ' + lo + '-' + hi + ' kg for your pre-pregnancy BMI. Keep doing what you are doing.'
        } else {
            const over = r1(gain - hi)
            headline = 'Above Target'; tone = 'orange'
            message = 'At ' + wk + ' weeks you have gained ' + gain + ' kg, about ' + over + ' kg above the expected range of ' + lo + '-' + hi + ' kg. Excess gain raises the risk of gestational diabetes, high blood pressure and a large baby — but the aim is to slow the rate, never to lose weight in pregnancy.'
        }

        const [tLo, tHi] = totals[cat]
        const proj = wk > 13 ? r1(gain + ((rates[cat][0] + rates[cat][1]) / 2) * Math.max(0, 40 - wk)) : r1((tLo + tHi) / 2)

        const rows = []
        for (let w = 12; w <= 40; w += 4) {
            const [l, hgh] = rangeAt(w)
            rows.push(['Week ' + w, l + ' - ' + hgh + ' kg', w === Math.round(wk / 4) * 4 ? 'You are here' : (w < wk ? 'Passed' : 'Upcoming')])
        }

        let urgent = null
        if (wk > 20 && gain > hi + 5) urgent = 'A sudden or very large jump in weight, especially with swelling of the face and hands or a headache, can signal pre-eclampsia. If this gain came on suddenly over days rather than weeks, get your blood pressure and urine checked promptly.'
        if (wk > 20 && gain < 0) urgent = 'Losing weight after 20 weeks of pregnancy is not expected and should be reviewed by your obstetrician.'

        const recs = []
        if (cat === 'obese' || cat === 'over') recs.push('Starting pregnancy above a healthy BMI means your target gain is genuinely lower — this is not restriction, it is the evidence-based range. Steady, slower gain gives the best outcomes for you and the baby.')
        if (cat === 'under') recs.push('Starting underweight means you need to gain more than average. Prioritise calorie-dense, nutritious foods — nuts, ghee, paneer, bananas, dates — rather than simply eating more volume.')
        if (gain > hi) recs.push('Focus on cutting refined carbohydrates and sugary drinks rather than reducing overall food. Protein and fibre at every meal blunt weight gain without depriving the baby.')
        if (gain < lo) recs.push('Add an extra 350-450 kcal a day in the second and third trimesters through nutrient-dense snacks. Persistent nausea or vomiting that is limiting your intake needs treatment, not endurance.')
        if (cat === 'obese' || cat === 'over' || gain > hi) recs.push('You are in a higher-risk group for gestational diabetes. Make sure your 24-28 week glucose test is not missed — the Gestational Diabetes Risk Checker can tell you more.')
        recs.push('Pregnancy needs roughly 300 extra calories a day in the second trimester and 450 in the third — far less than "eating for two" suggests.')
        recs.push('150 minutes a week of moderate activity, such as brisk walking or prenatal yoga, is safe in an uncomplicated pregnancy and improves both weight control and labour outcomes.')
        recs.push('Weigh yourself at the same time of day, in similar clothing, once a week rather than daily — day-to-day fluctuation is mostly water.')

        return {
            scoreValue: Math.max(0, Math.min(100, Math.round((gain / Math.max(hi, 1)) * 70))),
            scoreDisplay: (gain >= 0 ? '+' : '') + gain,
            scoreCaption: 'kg gained',
            headline, tone, message, urgent,
            stats: [
                { label: 'Pre-pregnancy BMI', value: String(bmi), note: catLabel },
                { label: 'Target This Week', value: lo + ' - ' + hi + ' kg', note: 'Week ' + wk },
                { label: 'Recommended Total', value: tLo + ' - ' + tHi + ' kg', note: twins ? 'Twin pregnancy' : 'By 40 weeks' },
                { label: 'Projected at 40w', value: proj + ' kg', note: proj > tHi ? 'Above range' : proj < tLo ? 'Below range' : 'Within range' }
            ],
            table: { title: 'Your Week-by-Week Target Range', columns: ['Stage', 'Expected Total Gain', 'Status'], rows },
            recommendations: recs,
            sheet: 'Gain ' + gain + 'kg at wk ' + wk + ' - ' + headline + ' (BMI ' + bmi + ')'
        }
    }
}

// ============================================================================
// 5. ANTENATAL CARE SCHEDULE
// ============================================================================
const antenatal = {
    id: 'antenatal',
    name: 'Antenatal Care Planner',
    short: 'Antenatal Planner',
    icon: 'fa-clipboard-list',
    tone: 'sky',
    tagline: 'Every visit, scan and test — with dates',
    blurb: 'Enter your last period date and get a complete personalised pregnancy calendar: check-ups, scans, blood tests and vaccinations.',
    cta: 'Build My Plan',
    intro: 'Your schedule is calculated from your last menstrual period and adjusted for your risk factors.',
    pdfTitle: 'Antenatal Care Schedule',
    keywords: 'antenatal care schedule india, pregnancy scan chart, ANC visits',
    steps: [
        {
            title: 'Pregnancy Details',
            fields: [
                dat('lmp', 'First day of your last menstrual period'),
                num('cycle', 'Usual cycle length', { min: 20, max: 45, unit: 'days', required: false, placeholder: '28' }),
                sel('parity', 'Is this your first pregnancy?', [['', 'Select...'], ['first', 'Yes, first pregnancy'], ['second', 'No, I have had a baby before']]),
                sel('bloodGroup', 'Do you know your blood group Rh type?', [['', 'Select...'], ['unknown', "Don't know"], ['pos', 'Rh positive'], ['neg', 'Rh negative']])
            ]
        },
        {
            title: 'Risk Factors',
            desc: 'These change how often you need to be seen. Tick anything that applies.',
            fields: [
                num('age', 'Your age', { min: 15, max: 55, unit: 'years' }),
                chk('risks', 'Tick anything that applies', [
                    ['twins', 'Twins or triplets'],
                    ['diabetes', 'Diabetes (before or during pregnancy)'],
                    ['bp', 'High blood pressure'],
                    ['thyroid', 'Thyroid disorder'],
                    ['lscs', 'Previous caesarean section'],
                    ['preterm', 'Previous preterm delivery'],
                    ['loss', 'Previous miscarriage or stillbirth'],
                    ['ivf', 'Conceived through IVF/IUI'],
                    ['anaemia', 'Known anaemia'],
                    ['obese', 'BMI above 30']
                ])
            ]
        }
    ],
    compute(a) {
        const cycle = has(a.cycle) ? N(a.cycle) : 28
        const lmp = new Date(a.lmp + 'T00:00:00')
        const edd = addDays(lmp, 280 + (cycle - 28))
        const t = today0()
        const days = Math.floor((t - lmp) / 86400000)
        const gw = Math.max(0, Math.floor(days / 7)), gd = Math.max(0, days % 7)

        const risks = Array.isArray(a.risks) ? a.risks : []
        const highRisk = risks.length > 0 || N(a.age) >= 35 || N(a.age) < 18
        const rhNeg = a.bloodGroup === 'neg'

        const at = (w, d = 0) => addDays(lmp, w * 7 + d)
        const state = (w) => gw > w + 1 ? 'past' : (gw >= w - 1 ? 'now' : 'future')

        const items = [
            [8, 'Booking Visit & Dating Scan', 'Confirm pregnancy and dates. Bloods: CBC, blood group & Rh, HIV, HBsAg, VDRL, TSH, urine routine, blood sugar. Start folic acid if not already.'],
            [11, 'NT Scan & Dual Marker', 'Nuchal translucency scan with the double marker blood test, done between 11 and 13 weeks 6 days. This is a firm window — it cannot be done later.'],
            [14, 'Start Iron & Calcium', 'Iron-folic acid and calcium supplementation begins from the second trimester and continues through pregnancy and for 3 months after delivery.'],
            [16, 'Second Antenatal Visit', 'Blood pressure, weight, urine check. Quadruple marker test if the dual marker was missed.'],
            [20, 'Anomaly Scan', 'Detailed level-2 ultrasound checking the baby\'s organs, growth and placenta. Ideally done between 18 and 22 weeks.'],
            [24, 'Glucose Screening', 'Oral glucose tolerance test (75 g) between 24 and 28 weeks to screen for gestational diabetes. Recommended for all Indian women.'],
            [26, 'Third Antenatal Visit', 'Blood pressure, weight, fundal height, fetal heart rate. Repeat haemoglobin.'],
            [28, 'Tdap Vaccination', 'Tdap (tetanus, diphtheria, pertussis) between 27 and 36 weeks protects the newborn from whooping cough. Give in every pregnancy.'],
            [30, 'Growth Scan', 'Ultrasound to check the baby\'s growth, liquor volume and placental position.'],
            [32, 'Antenatal Visit', 'Fortnightly visits begin. Watch for swelling, headache and reduced fetal movement.'],
            [34, 'Antenatal Visit', 'Blood pressure and growth check. Discuss birth plan and place of delivery.'],
            [36, 'Term Growth Scan & GBS', 'Growth and presentation scan. Confirm the baby\'s position. Repeat CBC before delivery.'],
            [37, 'Weekly Visits Begin', 'Weekly review from 37 weeks until delivery.'],
            [40, 'Estimated Due Date', 'Your expected date of delivery. Most first babies arrive within a week either side.']
        ]
        if (rhNeg) items.splice(9, 0, [28, 'Anti-D Injection', 'You are Rh negative — an anti-D injection at 28 weeks prevents antibodies forming against the baby\'s blood. A second dose is given after delivery if the baby is Rh positive.'])
        if (risks.includes('twins')) items.splice(5, 0, [22, 'Twin Growth Surveillance', 'Twin pregnancies need growth scans every 3-4 weeks from 22 weeks to check both babies are growing evenly.'])
        if (risks.includes('diabetes')) items.splice(1, 0, [10, 'Early Glucose Test', 'With diabetes risk, glucose testing is done at the booking visit rather than waiting until 24 weeks.'])
        if (risks.includes('lscs')) items.push([36, 'Delivery Planning after Caesarean', 'Discuss whether a trial of vaginal birth after caesarean (VBAC) or a planned repeat caesarean suits you.'])

        items.sort((x, y) => x[0] - y[0])

        const timeline = items.map(([w, title, desc]) => ({
            tag: 'Week ' + w,
            date: fmt(at(w)),
            title, desc, state: state(w)
        }))

        let headline, tone, message
        if (gw < 1 || gw > 45) {
            headline = 'Check Your Dates'; tone = 'amber'
            message = 'The date entered gives a gestational age outside the expected range. Please check that you entered the first day of your last period correctly.'
        } else if (highRisk) {
            headline = 'High-Risk Pregnancy Schedule'; tone = 'amber'
            message = 'Based on what you have told us, your pregnancy needs closer monitoring than routine care. The schedule below includes the additional checks — your doctor may add more.'
        } else {
            headline = 'Routine Pregnancy Schedule'; tone = 'teal'
            message = 'You are currently ' + gw + ' weeks and ' + gd + ' days pregnant. Below is your personalised schedule of visits, scans, tests and vaccinations with actual dates.'
        }

        const next = timeline.find(x => x.state !== 'past')

        const recs = []
        recs.push('Carry this schedule to every visit. The single biggest cause of missed problems in pregnancy is a skipped scan window — the NT scan in particular cannot be done after 13 weeks 6 days.')
        if (risks.includes('anaemia') || true) recs.push('Take iron and calcium at different times of day — calcium blocks iron absorption when taken together.')
        if (rhNeg) recs.push('Being Rh negative matters most from 28 weeks onward. Keep the anti-D dates and report any bleeding or abdominal injury immediately, as an extra dose may be needed.')
        if (risks.includes('bp')) recs.push('With high blood pressure, home BP monitoring plus low-dose aspirin from 12 weeks is often advised to reduce pre-eclampsia risk. Discuss this at your next visit.')
        if (risks.includes('diabetes')) recs.push('Blood sugar control in the first trimester matters most for the baby\'s development. Ask for a referral to a dietitian early rather than late.')
        if (N(a.age) >= 35) recs.push('Age 35 or above slightly raises the chance of chromosomal conditions, gestational diabetes and blood pressure problems. NIPT is an option to discuss alongside the standard dual marker.')
        if (risks.includes('preterm') || risks.includes('loss')) recs.push('With a previous preterm birth or loss, cervical length measurement at the anomaly scan is worth requesting — it identifies women who benefit from progesterone.')
        recs.push('Report immediately at any stage: bleeding, severe headache, blurred vision, upper abdominal pain, marked swelling of face and hands, fever, leaking fluid, or reduced fetal movements after 28 weeks.')

        return {
            scoreValue: Math.min(100, Math.round((gw / 40) * 100)),
            scoreDisplay: gw + 'w ' + gd + 'd',
            scoreCaption: 'Gestational age',
            headline, tone, message, urgent: null,
            stats: [
                { label: 'Estimated Due Date', value: fmt(edd), note: 'From LMP + cycle' },
                { label: 'Trimester', value: gw < 14 ? 'First' : gw < 28 ? 'Second' : 'Third', note: 'Week ' + gw },
                { label: 'Next Milestone', value: next ? next.tag : 'Delivery', note: next ? next.title : 'Full term' },
                { label: 'Care Level', value: highRisk ? 'High risk' : 'Routine', note: highRisk ? 'Closer monitoring' : '8-contact model' }
            ],
            timeline,
            recommendations: recs,
            sheet: 'ANC Plan - ' + gw + 'w, EDD ' + fmt(edd) + (highRisk ? ' (high risk)' : '')
        }
    }
}

// ============================================================================
// 6. CERVICAL SCREENING & HPV VACCINE CHECKER
// ============================================================================
const cervical = {
    id: 'cervical',
    name: 'Cervical Screening Checker',
    short: 'Cervical Screening',
    icon: 'fa-shield-heart',
    tone: 'indigo',
    tagline: 'Pap, HPV test and vaccine — when are you due?',
    blurb: 'Cervical cancer is almost entirely preventable. Find out which test you need, when you are next due, and whether the HPV vaccine still applies to you.',
    cta: 'Check My Screening',
    intro: 'India accounts for roughly a fifth of the world\'s cervical cancer deaths, almost all of them preventable by screening.',
    pdfTitle: 'Cervical Screening & HPV Vaccine Plan',
    keywords: 'pap smear when, HPV vaccine age india, cervical cancer screening',
    steps: [
        {
            title: 'About You',
            fields: [
                num('age', 'Your age', { min: 9, max: 90, unit: 'years' }),
                sel('sexuallyActive', 'Have you ever been sexually active?', [['', 'Select...'], ['no', 'No'], ['yes', 'Yes'], ['skip', 'Prefer not to say']]),
                sel('hysterectomy', 'Have you had your uterus removed (hysterectomy)?', [['', 'Select...'], ['no', 'No'], ['cervixOut', 'Yes, including the cervix'], ['cervixIn', 'Yes, but the cervix was left in place']])
            ]
        },
        {
            title: 'Screening History',
            fields: [
                sel('everTested', 'Have you ever had a Pap smear or HPV test?', [['', 'Select...'], ['never', 'Never'], ['pap', 'Yes, a Pap smear'], ['hpv', 'Yes, an HPV test'], ['both', 'Yes, both together (co-test)'], ['unsure', 'Not sure']]),
                dat('lastTest', 'Date of your most recent test', { required: false, when: (a) => a.everTested && a.everTested !== 'never' }),
                sel('lastResult', 'What was the result?', [['', 'Select...'], ['normal', 'Normal / negative'], ['abnormal', 'Abnormal — needed a repeat or colposcopy'], ['treated', 'Abnormal and treated (LEEP/cryo/cone)'], ['unsure', 'Not sure']], { required: false, when: (a) => a.everTested && a.everTested !== 'never' })
            ]
        },
        {
            title: 'Vaccine & Risk',
            fields: [
                sel('vaccine', 'Have you had the HPV vaccine?', [['', 'Select...'], ['no', 'No'], ['partial', 'Started but did not finish the doses'], ['yes', 'Yes, completed the course'], ['unsure', 'Not sure']]),
                chk('risk', 'Tick anything that applies', [
                    ['hiv', 'HIV positive or immunosuppressed'],
                    ['transplant', 'On immunosuppressant medication'],
                    ['smoker', 'Current smoker'],
                    ['multiple', 'Multiple partners, or a partner with multiple partners'],
                    ['earlySex', 'First sexual activity before age 18'],
                    ['dontKnow', 'Family history of cervical cancer']
                ]),
                chk('symptoms', 'Any of these symptoms? (Tick if yes)', [
                    ['postCoital', 'Bleeding after intercourse'],
                    ['interMenstrual', 'Bleeding between periods'],
                    ['postMeno', 'Any bleeding after menopause'],
                    ['discharge', 'Persistent foul-smelling discharge'],
                    ['pelvicPain', 'Persistent pelvic pain']
                ])
            ]
        }
    ],
    compute(a) {
        const age = N(a.age)
        const risk = Array.isArray(a.risk) ? a.risk : []
        const symptoms = Array.isArray(a.symptoms) ? a.symptoms : []
        const immuno = risk.includes('hiv') || risk.includes('transplant')

        let dueText, testName, intervalYears, headline, tone, message

        if (a.hysterectomy === 'cervixOut' && a.lastResult !== 'treated' && a.lastResult !== 'abnormal') {
            headline = 'Screening Not Required'; tone = 'emerald'; testName = 'None'; intervalYears = 0
            message = 'With the cervix removed and no history of abnormal cells, routine cervical screening is no longer needed. Continue routine gynaecological care.'
        } else if (age < 21) {
            headline = age >= 9 && age <= 26 ? 'Vaccine Age — Screening Not Yet' : 'Screening Not Yet Due'; tone = 'teal'
            testName = 'None yet'; intervalYears = 0
            message = 'Cervical screening is not recommended before age 21, even if you are sexually active, because abnormalities at this age almost always clear on their own. Vaccination is what matters at your age.'
        } else if (age <= 29) {
            testName = 'Pap smear (cervical cytology)'; intervalYears = 3
            headline = 'Pap Smear Every 3 Years'; tone = 'teal'
            message = 'From 21 to 29, a Pap smear every three years is the recommended approach. HPV testing is not used as the primary test in this age group because transient infection is very common.'
        } else if (age <= 65) {
            testName = 'HPV DNA test (or co-test with Pap)'; intervalYears = 5
            headline = 'HPV Test Every 5 Years'; tone = 'teal'
            message = 'From 30 to 65, an HPV DNA test every five years is the preferred approach — it detects risk earlier and lasts longer than a Pap alone. A Pap every three years remains an acceptable alternative.'
        } else {
            testName = 'Usually none'; intervalYears = 0
            headline = 'Screening May Stop'; tone = 'emerald'
            message = 'Above 65, screening can usually stop if you have had adequate negative screening in the previous ten years. If you have never been screened, or your history is unclear, screening should continue.'
        }

        if (immuno && age >= 21) {
            intervalYears = 1; testName = 'Pap smear (annual)'
            headline = 'Annual Screening Needed'; tone = 'amber'
            message = 'Being immunosuppressed means cervical abnormalities progress faster and clear less often. Annual screening is recommended rather than the routine interval.'
        }

        let nextDue = 'As soon as possible'
        let overdue = false
        if (intervalYears > 0) {
            if (!a.lastTest || a.everTested === 'never') {
                nextDue = age >= 21 ? 'Now — you have never been screened' : 'Not yet due'
                overdue = age >= 21
            } else {
                const last = new Date(a.lastTest + 'T00:00:00')
                const due = new Date(last); due.setFullYear(due.getFullYear() + intervalYears)
                nextDue = fmt(due)
                overdue = due < today0()
            }
        } else {
            nextDue = 'Not applicable'
        }

        if (a.lastResult === 'abnormal' || a.lastResult === 'treated') {
            headline = 'Follow-Up Screening Required'; tone = 'amber'
            message = 'A previous abnormal result changes the schedule entirely — routine intervals do not apply. Women treated for cervical abnormalities need surveillance for at least 25 years afterwards, usually annually at first.'
            nextDue = 'Per your specialist\'s advice — do not use routine intervals'
        }

        if (overdue && intervalYears > 0) {
            headline = 'You Are Overdue'; tone = 'orange'
            message = 'Your last test was longer ago than the recommended interval. ' + message
        }

        let urgent = null
        if (symptoms.length > 0) {
            urgent = 'You reported symptoms that need direct evaluation regardless of when your last screening test was. Bleeding after intercourse, bleeding between periods or after menopause, or persistent foul discharge must be examined — screening tests are for women without symptoms and are not a substitute for a check-up.'
            headline = 'See a Doctor — Symptoms Present'; tone = 'red'
        }

        // Vaccine eligibility (Indian schedule, Cervavac/Gardasil)
        let vaccine, vaccineNote
        if (a.vaccine === 'yes') { vaccine = 'Completed'; vaccineNote = 'Continue screening as scheduled — the vaccine reduces risk substantially but does not remove the need for screening.' }
        else if (a.vaccine === 'partial') { vaccine = 'Complete the course'; vaccineNote = 'Finish the remaining doses. There is no need to restart from the beginning however long the gap.' }
        else if (age >= 9 && age <= 14) { vaccine = 'Eligible — 2 doses'; vaccineNote = 'At ages 9-14 only two doses are needed, six months apart. This is the ideal age — the immune response is strongest and it is given before any exposure.' }
        else if (age >= 15 && age <= 26) { vaccine = 'Eligible — 3 doses'; vaccineNote = 'At 15-26 the schedule is three doses over six months. Vaccination is still clearly worthwhile, including if you are already sexually active.' }
        else if (age >= 27 && age <= 45) { vaccine = 'Discuss with your doctor'; vaccineNote = 'Between 27 and 45 the vaccine is licensed and can be given, but the benefit is smaller because exposure is more likely to have already happened. It is an individual decision worth discussing.' }
        else { vaccine = 'Not indicated'; vaccineNote = 'The HPV vaccine is not routinely given at your age. Screening remains the effective protection.' }

        const recs = []
        if (symptoms.length) recs.push('Book an examination for your symptoms now. Do not wait for a screening appointment — a speculum examination is quick and settles most concerns immediately.')
        if (age >= 21 && (a.everTested === 'never' || a.everTested === 'unsure')) recs.push('Never having been screened is the single largest risk factor for cervical cancer in India. Around 80% of cases occur in women who have never had a Pap or HPV test.')
        if (risk.includes('smoker')) recs.push('Smoking roughly doubles the risk of cervical cancer by impairing the immune clearance of HPV. Stopping meaningfully reduces risk.')
        if (immuno) recs.push('Immunosuppression warrants annual screening and a lower threshold for colposcopy. Make sure whoever manages your immune condition knows your screening schedule.')
        recs.push('A Pap smear takes under five minutes, needs no anaesthesia and is not usually painful. Schedule it when you are not bleeding, ideally mid-cycle.')
        recs.push(vaccineNote)
        if (a.vaccine === 'yes') recs.push('Vaccination protects against the highest-risk HPV types but not all of them. Screening is still required on the normal schedule.')
        recs.push('HPV is extremely common and usually clears by itself. A positive HPV test means monitoring, not cancer — the point of screening is to find changes long before they become dangerous.')

        return {
            scoreValue: null,
            scoreDisplay: null,
            scoreCaption: null,
            headline, tone, message, urgent,
            stats: [
                { label: 'Recommended Test', value: testName, note: intervalYears ? 'Every ' + intervalYears + ' year' + (intervalYears > 1 ? 's' : '') : 'Not applicable' },
                { label: 'Next Due', value: nextDue, note: overdue ? 'Overdue' : 'On schedule' },
                { label: 'HPV Vaccine', value: vaccine, note: 'Age ' + age },
                { label: 'Risk Factors', value: String(risk.length), note: risk.length ? 'See recommendations' : 'None reported' }
            ],
            table: {
                title: 'Screening Schedule by Age',
                columns: ['Age Group', 'Recommended Test', 'Interval'],
                rows: [
                    ['Under 21', 'No screening', 'Vaccination instead'],
                    ['21 - 29', 'Pap smear', 'Every 3 years'],
                    ['30 - 65', 'HPV DNA test', 'Every 5 years'],
                    ['30 - 65 (alternative)', 'Pap smear alone', 'Every 3 years'],
                    ['Over 65', 'May stop', 'If adequately screened'],
                    ['Immunosuppressed', 'Pap smear', 'Every year']
                ]
            },
            recommendations: recs,
            sheet: headline + ' | Test: ' + testName + ' | Due: ' + nextDue + ' | Vaccine: ' + vaccine
        }
    }
}

// ============================================================================
// 7. CONTRACEPTION METHOD FINDER
// ============================================================================
const contraception = {
    id: 'contraception',
    name: 'Contraception Method Finder',
    short: 'Contraception Finder',
    icon: 'fa-pills',
    tone: 'emerald',
    tagline: 'Which method actually suits you?',
    blurb: 'Match your health history and plans against every available method, with medical eligibility flags based on WHO criteria.',
    cta: 'Find My Method',
    intro: 'Your answers are checked against WHO medical eligibility criteria. This narrows the options — the final choice is yours and your doctor\'s.',
    pdfTitle: 'Contraception Options Report',
    keywords: 'best contraception for me, birth control options india, IUD vs pill',
    steps: [
        {
            title: 'About You',
            fields: [
                num('age', 'Your age', { min: 15, max: 60, unit: 'years' }),
                sel('plans', 'When might you want a pregnancy?', [['', 'Select...'], ['soon', 'Within the next year'], ['later', 'In 1 to 3 years'], ['much', 'More than 3 years away'], ['never', 'My family is complete'], ['unsure', 'Not sure yet']]),
                sel('postpartum', 'Have you delivered recently?', [['', 'Select...'], ['no', 'No'], ['under6w', 'Yes, less than 6 weeks ago'], ['6wto6m', 'Yes, 6 weeks to 6 months ago'], ['over6m', 'Yes, more than 6 months ago']]),
                sel('breastfeeding', 'Are you breastfeeding?', YN)
            ]
        },
        {
            title: 'Medical History',
            desc: 'These determine which methods are safe for you. Answer honestly — some combinations genuinely matter.',
            fields: [
                sel('migraine', 'Do you get migraines with aura (flashing lights, zigzag lines or numbness before the headache)?', [['', 'Select...'], ['no', 'No migraines'], ['without', 'Migraines, but without aura'], ['with', 'Yes, migraines with aura']]),
                sel('bp', 'Your blood pressure', [['', 'Select...'], ['normal', 'Normal'], ['mild', 'Mildly raised or on treatment'], ['high', 'Above 160/100'], ['unknown', "Don't know"]]),
                sel('smoking', 'Do you smoke?', [['', 'Select...'], ['no', 'No'], ['light', 'Yes, under 15 a day'], ['heavy', 'Yes, 15 or more a day']]),
                chk('conditions', 'Tick anything that applies', [
                    ['clot', 'Blood clot in leg or lung (DVT/PE), now or in the past'],
                    ['breastCa', 'Breast cancer, current or past'],
                    ['liver', 'Active liver disease'],
                    ['diabetes', 'Diabetes for more than 20 years, or with complications'],
                    ['heart', 'Heart disease or stroke'],
                    ['lupus', 'Lupus with antiphospholipid antibodies'],
                    ['epilepsy', 'On anti-epileptic medication'],
                    ['tb', 'On rifampicin (TB treatment)'],
                    ['fibroids', 'Fibroids distorting the uterine cavity'],
                    ['pid', 'Current pelvic infection']
                ])
            ]
        },
        {
            title: 'Preferences',
            fields: [
                sel('daily', 'Could you reliably take a tablet at the same time every day?', [['', 'Select...'], ['yes', 'Yes, easily'], ['maybe', 'Probably, but I might forget'], ['no', 'No, I would forget']]),
                sel('hormonal', 'How do you feel about hormonal methods?', [['', 'Select...'], ['fine', 'Fine with them'], ['prefer_not', 'Prefer non-hormonal if possible'], ['no', 'Do not want hormones at all']]),
                sel('periodsHeavy', 'Are your periods heavy or very painful?', YN),
                sel('acne', 'Do you have acne, excess hair or PCOS?', YN),
                sel('privacy', 'Do you need the method to be private or invisible to others?', YN)
            ]
        }
    ],
    compute(a) {
        const age = N(a.age)
        const c = Array.isArray(a.conditions) ? a.conditions : []
        const noHormone = a.hormonal === 'no'
        const preferNoHormone = a.hormonal === 'prefer_not'

        // WHO MEC category 3/4 conditions for combined hormonal contraception
        const cocBlockers = []
        if (a.migraine === 'with') cocBlockers.push('migraine with aura')
        if (c.includes('clot')) cocBlockers.push('history of blood clots')
        if (c.includes('breastCa')) cocBlockers.push('breast cancer')
        if (c.includes('heart')) cocBlockers.push('heart disease or stroke')
        if (c.includes('liver')) cocBlockers.push('active liver disease')
        if (c.includes('lupus')) cocBlockers.push('lupus with antiphospholipid antibodies')
        if (a.bp === 'high') cocBlockers.push('blood pressure above 160/100')
        if (age >= 35 && (a.smoking === 'light' || a.smoking === 'heavy')) cocBlockers.push('smoking at age 35 or over')
        if (a.postpartum === 'under6w') cocBlockers.push('less than 6 weeks after delivery')
        if (a.breastfeeding === 'yes' && a.postpartum === 'under6w') cocBlockers.push('breastfeeding in the early weeks')
        if (c.includes('diabetes')) cocBlockers.push('long-standing or complicated diabetes')

        const progBlockers = []
        if (c.includes('breastCa')) progBlockers.push('breast cancer')
        if (c.includes('liver')) progBlockers.push('active liver disease')

        const iudBlockers = []
        if (c.includes('pid')) iudBlockers.push('current pelvic infection')
        if (c.includes('fibroids')) iudBlockers.push('fibroids distorting the cavity')

        const rate = (suit, reason) => ({ suit, reason })
        const methods = []

        const push = (name, eff, dur, suit, note) => methods.push({ name, eff, dur, suit, note })

        // Copper IUD
        push('Copper IUD (Cu-T)', '99.2%', 'Up to 10 years',
            iudBlockers.length ? 'Not suitable' : (a.periodsHeavy === 'yes' ? 'Discuss' : 'Recommended'),
            iudBlockers.length ? 'Avoid because of ' + iudBlockers.join(' and ') + '.'
                : a.periodsHeavy === 'yes' ? 'Highly effective and hormone-free, but it usually makes periods heavier — a poor fit if yours are already heavy.'
                    : 'Hormone-free, fit-and-forget, reversible any time. Often the best choice if you want no hormones.')

        // Hormonal IUD
        push('Hormonal IUD (LNG-IUS)', '99.8%', '5 to 8 years',
            noHormone ? 'Not preferred' : iudBlockers.length ? 'Not suitable' : (a.periodsHeavy === 'yes' ? 'Best match' : 'Recommended'),
            noHormone ? 'You indicated you do not want hormones. Note the hormone here acts mainly inside the uterus with very low blood levels.'
                : iudBlockers.length ? 'Avoid because of ' + iudBlockers.join(' and ') + '.'
                    : a.periodsHeavy === 'yes' ? 'Reduces menstrual blood loss by up to 90% and is also a treatment for heavy periods, not just contraception. Two problems, one solution.'
                        : 'The most effective reversible method available. Periods usually become very light or stop altogether, which is safe.')

        // Implant
        push('Contraceptive Implant', '99.9%', '3 years',
            noHormone ? 'Not preferred' : progBlockers.length ? 'Not suitable' : a.privacy === 'yes' ? 'Recommended' : 'Suitable',
            progBlockers.length ? 'Avoid because of ' + progBlockers.join(' and ') + '.'
                : 'A small rod under the skin of the upper arm. Nothing to remember, invisible to others, and safe while breastfeeding. Irregular spotting is common in the first months.')

        // Injectable
        push('Injectable (DMPA)', '96%', 'Every 3 months',
            noHormone ? 'Not preferred' : progBlockers.length ? 'Not suitable' : a.plans === 'soon' ? 'Discuss' : 'Suitable',
            progBlockers.length ? 'Avoid because of ' + progBlockers.join(' and ') + '.'
                : a.plans === 'soon' ? 'Fertility can take 6-12 months to return after stopping, so it is a poor fit if you want a pregnancy within the year.'
                    : 'One injection every three months, private, and safe while breastfeeding. Can reduce bone density with long-term use, which reverses on stopping.')

        // Combined pill
        push('Combined Pill', '93% typical use', 'Daily',
            noHormone ? 'Not preferred' : cocBlockers.length ? 'Not suitable' : a.daily === 'no' ? 'Not ideal' : a.acne === 'yes' ? 'Good match' : 'Suitable',
            cocBlockers.length ? 'Avoid because of ' + cocBlockers.join('; ') + '. This is a firm medical contraindication, not a preference.'
                : a.daily === 'no' ? 'Effectiveness drops sharply with missed pills. Given what you said about remembering, a long-acting method would serve you better.'
                    : a.acne === 'yes' ? 'Also improves acne, excess hair and cycle regularity, which makes it a strong option alongside PCOS.'
                        : 'Well-established, reversible immediately, and makes periods lighter and more predictable.')

        // POP
        push('Progestogen-Only Pill', '93% typical use', 'Daily',
            noHormone ? 'Not preferred' : progBlockers.length ? 'Not suitable' : (cocBlockers.length && a.daily !== 'no') ? 'Good alternative' : a.daily === 'no' ? 'Not ideal' : 'Suitable',
            progBlockers.length ? 'Avoid because of ' + progBlockers.join(' and ') + '.'
                : cocBlockers.length ? 'A useful alternative when the combined pill is ruled out — it avoids oestrogen entirely and is safe while breastfeeding.'
                    : 'Safe while breastfeeding and with migraine. Needs to be taken within a narrow daily window to stay effective.')

        // Patch/Ring
        push('Patch or Vaginal Ring', '93% typical use', 'Weekly / monthly',
            noHormone ? 'Not preferred' : cocBlockers.length ? 'Not suitable' : 'Suitable',
            cocBlockers.length ? 'Carries the same restrictions as the combined pill: ' + cocBlockers.join('; ') + '.'
                : 'Same hormones as the combined pill without a daily tablet. Limited availability in India.')

        // Condoms
        push('Condoms', '87% typical use', 'Every act',
            'Always advisable',
            'The only method that also protects against sexually transmitted infections. Worth using alongside any other method if STI protection matters.')

        // Sterilisation
        push('Sterilisation (tubal ligation)', '99.5%', 'Permanent',
            a.plans === 'never' ? 'Consider' : 'Not suitable',
            a.plans === 'never' ? 'A reasonable option once your family is definitely complete. Regret is more common under 30 — a hormonal IUD or implant gives near-identical effectiveness while staying reversible.'
                : 'Permanent, so not appropriate while future pregnancy is still a possibility.')

        // Fertility awareness
        push('Fertility Awareness', '76-88%', 'Daily tracking',
            noHormone || preferNoHormone ? 'Discuss' : 'Least effective',
            'Requires regular cycles, daily tracking and consistent abstinence during the fertile window. Roughly 1 in 4 women using it typically become pregnant within a year — the least reliable option here.')

        // LAM
        if (a.breastfeeding === 'yes' && a.postpartum === 'under6w') {
            push('Lactational Amenorrhoea (LAM)', '98% if criteria met', 'Up to 6 months',
                'Temporary option',
                'Only reliable if you are fully breastfeeding, periods have not returned, and the baby is under 6 months. All three must be true. Plan the next method now.')
        }

        const best = methods.filter(m => m.suit === 'Best match' || m.suit === 'Recommended' || m.suit === 'Good match')
        const blocked = methods.filter(m => m.suit === 'Not suitable')

        let headline, tone, message
        if (cocBlockers.length) {
            headline = best.length ? 'Options Found — With Restrictions' : 'Specialist Advice Needed'
            tone = 'amber'
            message = 'Your history rules out oestrogen-containing methods (' + cocBlockers.join('; ') + '). This is a genuine safety limit, not a preference — but plenty of highly effective alternatives remain, shown below.'
        } else if (best.length) {
            headline = best.length + ' Strong ' + (best.length === 1 ? 'Match' : 'Matches')
            tone = 'emerald'
            message = 'Based on your health history and what you want from a method, the options below are ranked for you. Nothing in your answers rules out the major methods.'
        } else {
            headline = 'Review Your Options'; tone = 'teal'
            message = 'Every method has been assessed against your answers. Discuss the shortlist below with your gynaecologist.'
        }

        const recs = []
        if (a.plans === 'soon') recs.push('Since you may want a pregnancy within a year, prioritise methods with immediate return of fertility — the pill, implant, IUD and condoms all qualify. The injectable does not.')
        if (a.plans === 'never') recs.push('For a completed family, long-acting methods and sterilisation are worth comparing. A hormonal IUD matches sterilisation for effectiveness while remaining reversible, and treats heavy periods as a bonus.')
        if (a.periodsHeavy === 'yes') recs.push('With heavy or painful periods, the hormonal IUD is the standout choice — it is both a contraceptive and a first-line treatment for heavy menstrual bleeding.')
        if (a.acne === 'yes') recs.push('For PCOS, acne or excess hair, combined hormonal methods help symptoms directly. If oestrogen is not suitable for you, other treatments can address the symptoms separately.')
        if (a.breastfeeding === 'yes') recs.push('While breastfeeding, progestogen-only methods (mini-pill, implant, injection, hormonal IUD) do not affect milk supply. Oestrogen-containing methods can reduce it.')
        if (a.daily !== 'yes') recs.push('Typical-use failure rates for daily pills are around 7 per 100 women per year, almost entirely from missed doses. Long-acting methods remove that variable entirely.')
        if (c.includes('epilepsy') || c.includes('tb')) recs.push('Anti-epileptic drugs and rifampicin speed up the breakdown of hormonal contraceptives and can make pills, patches and implants fail. The copper IUD, hormonal IUD and injectable are unaffected — flag this specifically to your doctor.')
        if (a.bp === 'unknown') recs.push('Get your blood pressure measured before starting any oestrogen-containing method. It is a two-minute check that changes what is safe for you.')
        recs.push('Emergency contraception is available up to 72 hours after unprotected sex (up to 120 hours for some options), and a copper IUD works up to 5 days after and is the most effective method by far.')
        recs.push('No method except condoms protects against sexually transmitted infections. Dual protection is worth considering.')

        return {
            scoreValue: null, scoreDisplay: null, scoreCaption: null,
            headline, tone, message, urgent: null,
            stats: [
                { label: 'Strong Matches', value: String(best.length), note: best.length ? best[0].name : 'See table' },
                { label: 'Ruled Out', value: String(blocked.length), note: blocked.length ? 'Medical reasons' : 'None' },
                { label: 'Oestrogen Methods', value: cocBlockers.length ? 'Not safe' : 'Safe for you', note: cocBlockers.length ? cocBlockers[0] : 'No contraindications' },
                { label: 'Pregnancy Plans', value: a.plans === 'soon' ? 'Within a year' : a.plans === 'later' ? '1-3 years' : a.plans === 'much' ? '3+ years' : a.plans === 'never' ? 'Family complete' : 'Undecided', note: 'Guides the choice' }
            ],
            table: {
                title: 'Your Personalised Method Comparison',
                columns: ['Method', 'Effectiveness', 'How Often', 'For You'],
                rows: methods.map(m => [m.name, m.eff, m.dur, m.suit]),
                notes: methods.map(m => m.name + ': ' + m.note)
            },
            recommendations: recs,
            sheet: headline + ' | Top: ' + (best[0] ? best[0].name : 'n/a') + (cocBlockers.length ? ' | COC contraindicated' : '')
        }
    }
}

// ============================================================================
// 8. GESTATIONAL DIABETES RISK
// ============================================================================
const gdm = {
    id: 'gdm',
    name: 'Gestational Diabetes Risk',
    short: 'GDM Risk Checker',
    icon: 'fa-droplet-slash',
    tone: 'orange',
    tagline: 'South Asian women are at higher risk',
    blurb: 'Find out your risk of diabetes in pregnancy and exactly when you should be tested. Indian women develop GDM at more than twice the global rate.',
    cta: 'Check GDM Risk',
    intro: 'Gestational diabetes has no symptoms in most women — testing is the only way to find it.',
    pdfTitle: 'Gestational Diabetes Risk Report',
    keywords: 'gestational diabetes test, GDM risk, sugar in pregnancy',
    steps: [
        {
            title: 'Pregnancy & Body',
            fields: [
                num('age', 'Your age', { min: 15, max: 55, unit: 'years' }),
                num('week', 'Weeks pregnant (enter 0 if planning)', { min: 0, max: 42, unit: 'weeks' }),
                num('height', 'Height', { min: 130, max: 200, unit: 'cm' }),
                num('preWeight', 'Weight before pregnancy', { min: 30, max: 160, step: 0.1, unit: 'kg' })
            ]
        },
        {
            title: 'History',
            fields: [
                chk('history', 'Tick anything that applies', [
                    ['prevGdm', 'Gestational diabetes in a previous pregnancy'],
                    ['bigBaby', 'Previous baby weighing 3.5 kg or more'],
                    ['stillbirth', 'Previous unexplained stillbirth'],
                    ['pcos', 'PCOS'],
                    ['familyDm', 'Parent or sibling with type 2 diabetes'],
                    ['prediabetes', 'Told before that I had prediabetes or high sugar'],
                    ['hypertension', 'High blood pressure'],
                    ['steroids', 'On steroid medication'],
                    ['acanthosis', 'Dark velvety patches on neck or armpits'],
                    ['twins', 'Twin pregnancy']
                ]),
                sel('activity', 'Physical activity level', [['', 'Select...'], ['active', 'Active — 150+ min a week'], ['moderate', 'Some activity'], ['sedentary', 'Mostly sedentary']]),
                sel('diet', 'How often do you eat refined carbohydrates — white rice, maida, sweets, sugary drinks?', [['', 'Select...'], ['rare', 'Rarely'], ['some', 'Most days'], ['often', 'At almost every meal']])
            ]
        },
        {
            title: 'Test Results (Optional)',
            optional: true,
            fields: [
                num('fasting', 'Fasting blood sugar (mg/dL)', { min: 40, max: 400, required: false, placeholder: 'e.g. 96' }),
                num('ogtt', '2-hour value after 75 g glucose (mg/dL)', { min: 40, max: 500, required: false, placeholder: 'e.g. 148', hint: 'DIPSI threshold for GDM: 140 or above' }),
                num('hba1c', 'HbA1c (%)', { min: 3, max: 15, step: 0.1, required: false, placeholder: 'e.g. 5.4' })
            ]
        }
    ],
    compute(a) {
        const h = N(a.height) / 100
        const bmi = r1(N(a.preWeight) / (h * h))
        const hist = Array.isArray(a.history) ? a.history : []
        const age = N(a.age), wk = N(a.week)

        let score = 0
        // Every South Asian woman carries baseline elevated risk
        score += 10
        if (age >= 35) score += 12; else if (age >= 30) score += 7; else if (age >= 25) score += 3
        if (bmi >= 30) score += 18; else if (bmi >= 25) score += 12; else if (bmi >= 23) score += 7
        if (hist.includes('prevGdm')) score += 25
        if (hist.includes('bigBaby')) score += 12
        if (hist.includes('stillbirth')) score += 8
        if (hist.includes('pcos')) score += 12
        if (hist.includes('familyDm')) score += 12
        if (hist.includes('prediabetes')) score += 18
        if (hist.includes('hypertension')) score += 6
        if (hist.includes('steroids')) score += 6
        if (hist.includes('acanthosis')) score += 8
        if (hist.includes('twins')) score += 6
        if (a.activity === 'sedentary') score += 6; else if (a.activity === 'moderate') score += 2
        if (a.diet === 'often') score += 6; else if (a.diet === 'some') score += 3

        const pct = Math.min(100, score)

        // Lab overrides
        const ogtt = has(a.ogtt) ? N(a.ogtt) : null
        const fast = has(a.fasting) ? N(a.fasting) : null
        const hba1c = has(a.hba1c) ? N(a.hba1c) : null
        let headline, tone, message, confirmed = false

        if (ogtt !== null && ogtt > 0) {
            confirmed = true
            if (ogtt >= 200) { headline = 'GDM Confirmed — Markedly High'; tone = 'red'; message = 'A 2-hour value of ' + ogtt + ' mg/dL is far above the DIPSI diagnostic threshold of 140 mg/dL. This needs management starting now, very likely including insulin.' }
            else if (ogtt >= 140) { headline = 'GDM Diagnosed'; tone = 'orange'; message = 'A 2-hour value of ' + ogtt + ' mg/dL meets the DIPSI criterion for gestational diabetes (140 mg/dL or above). The good news is that most women control it with diet and exercise alone.' }
            else if (ogtt >= 120) { headline = 'Borderline'; tone = 'amber'; message = 'A 2-hour value of ' + ogtt + ' mg/dL is below the diagnostic cut-off but not comfortably so. Repeat testing later in pregnancy is sensible, along with dietary changes now.' }
            else { headline = 'Test Normal'; tone = 'emerald'; message = 'A 2-hour value of ' + ogtt + ' mg/dL is normal. If you tested before 24 weeks and carry risk factors, the test should be repeated at 24-28 weeks.' }
        } else {
            if (pct < 25) { headline = 'Low Risk'; tone = 'emerald'; message = 'Your risk profile is low, but routine testing is still recommended for all pregnant women in India at 24-28 weeks. Universal screening is national policy for good reason.' }
            else if (pct < 45) { headline = 'Moderate Risk'; tone = 'amber'; message = 'You have some risk factors for gestational diabetes. Make sure your 24-28 week glucose test happens on time.' }
            else if (pct < 70) { headline = 'High Risk'; tone = 'orange'; message = 'Your risk factors are significant. Early glucose testing at the booking visit is recommended, repeated at 24-28 weeks even if the first test is normal.' }
            else { headline = 'Very High Risk'; tone = 'red'; message = 'You carry multiple strong risk factors. Test at the first antenatal visit rather than waiting, and again at 24-28 weeks. Early detection makes management far easier.' }
        }

        let urgent = null
        if (fast !== null && fast >= 126) urgent = 'A fasting sugar of ' + fast + ' mg/dL or above is in the overt diabetes range, not just gestational diabetes. This needs prompt medical review, not a routine appointment.'
        else if (ogtt !== null && ogtt >= 200) urgent = 'This glucose level needs specialist management without delay. Please contact your obstetrician now.'

        let testTiming
        if (wk === 0) testTiming = 'Before conception — get a fasting sugar and HbA1c now'
        else if (pct >= 45 && wk < 20) testTiming = 'Now, at your booking visit'
        else if (wk < 24) testTiming = 'At 24-28 weeks' + (pct >= 45 ? ' (plus one now)' : '')
        else if (wk <= 28) testTiming = 'Now — you are in the testing window'
        else testTiming = 'Overdue — test as soon as possible'

        const recs = []
        if (confirmed && ogtt >= 140) {
            recs.push('Start with medical nutrition therapy: three modest meals plus two or three snacks, avoiding long gaps. Around 70-85% of women achieve control with diet and exercise alone.')
            recs.push('Self-monitor blood sugar four times a day — fasting and two hours after each main meal. Targets are usually under 95 mg/dL fasting and under 120 mg/dL after meals.')
            recs.push('A 20-30 minute walk after each main meal blunts the post-meal sugar spike more effectively than almost any other single measure.')
            recs.push('Gestational diabetes raises your lifetime risk of type 2 diabetes substantially. A repeat glucose test 6-12 weeks after delivery, then annually, is essential — this step is very often skipped.')
        } else {
            recs.push('The DIPSI test used across India is a single-step 75 g glucose load taken irrespective of the last meal, with one blood sample at 2 hours. It needs no fasting, which is why compliance is much better.')
            recs.push('Switch from white rice and maida to whole grains, millets and brown rice. Pair carbohydrates with protein and vegetables to slow absorption.')
        }
        if (bmi >= 25) recs.push('Starting pregnancy above a healthy BMI is one of the strongest modifiable risk factors for gestational diabetes. Keeping weight gain within your target range meaningfully lowers the risk.')
        if (hist.includes('pcos')) recs.push('PCOS involves insulin resistance, which is the same mechanism that drives gestational diabetes. Women with PCOS should always be tested early.')
        if (hist.includes('prevGdm')) recs.push('Gestational diabetes recurs in roughly half of subsequent pregnancies. Test at the booking visit rather than waiting until 24 weeks.')
        if (hist.includes('familyDm')) recs.push('A first-degree relative with type 2 diabetes roughly doubles your risk. It is a strong signal to test early.')
        if (a.activity === 'sedentary') recs.push('150 minutes a week of moderate activity meaningfully reduces the chance of developing gestational diabetes, and is safe in an uncomplicated pregnancy.')
        if (hba1c !== null && hba1c >= 5.7) recs.push('An HbA1c of ' + hba1c + '% suggests raised sugars in the preceding months. In early pregnancy this may indicate pre-existing rather than gestational diabetes, which is managed differently.')
        recs.push('Untreated gestational diabetes raises the risk of a large baby, birth injury, caesarean delivery and newborn low blood sugar. Treated, outcomes are close to those of any other pregnancy.')

        return {
            scoreValue: pct,
            scoreDisplay: confirmed ? String(ogtt) : pct + '%',
            scoreCaption: confirmed ? '2-hr glucose (mg/dL)' : 'Risk Score',
            headline, tone, message, urgent,
            stats: [
                { label: 'Pre-pregnancy BMI', value: String(bmi), note: bmi >= 25 ? 'Above healthy range' : 'Healthy range' },
                { label: 'Risk Factors', value: String(hist.length), note: hist.length ? 'See recommendations' : 'None reported' },
                { label: 'Test Timing', value: testTiming, note: 'DIPSI 75 g test' },
                { label: 'Diagnostic Cut-off', value: '140 mg/dL', note: '2 hours after 75 g' }
            ],
            recommendations: recs,
            sheet: (confirmed ? 'OGTT ' + ogtt + ' - ' : 'Risk ' + pct + '% - ') + headline + ' | wk ' + wk
        }
    }
}

// ============================================================================
// 9. POSTNATAL MOOD CHECK
// ============================================================================
const postnatal = {
    id: 'postnatal-mood',
    name: 'Postnatal Mood Check',
    short: 'Postnatal Mood Check',
    icon: 'fa-hand-holding-heart',
    tone: 'sky',
    tagline: 'You are not weak, and you are not alone',
    blurb: 'A confidential 10-question check on how you have been feeling since your baby arrived. Around 1 in 5 new mothers experience postnatal depression.',
    cta: 'Check In With Yourself',
    intro: 'Answer based on how you have felt over the past 7 days, not just today. There are no wrong answers, and nobody sees this but you.',
    pdfTitle: 'Postnatal Wellbeing Report',
    keywords: 'postpartum depression test, baby blues, new mother mental health',
    sober: true,
    steps: [
        {
            title: 'About You',
            fields: [
                num('weeks', 'How many weeks ago did you deliver?', { min: 0, max: 104, unit: 'weeks', placeholder: 'e.g. 8' }),
                sel('delivery', 'How was the delivery?', [['', 'Select...'], ['normal', 'Normal delivery'], ['lscs', 'Caesarean section'], ['assisted', 'Forceps or vacuum'], ['complicated', 'Complicated / needed extra care']]),
                sel('feeding', 'How is feeding going?', [['', 'Select...'], ['well', 'Going well'], ['struggling', 'Struggling but managing'], ['hard', 'Very difficult'], ['formula', 'Formula feeding']]),
                sel('support', 'How much practical support do you have at home?', [['', 'Select...'], ['lots', 'Plenty'], ['some', 'Some'], ['little', 'Very little'], ['none', 'None']])
            ]
        },
        {
            title: 'The Past 7 Days',
            desc: 'Choose the answer that comes closest to how you have felt in the last week.',
            fields: [
                scale('p1', 'I have been able to laugh and see the funny side of things', [['0', 'As much as I always could'], ['1', 'Not quite so much now'], ['2', 'Definitely less now'], ['3', 'Not at all']]),
                scale('p2', 'I have looked forward to things with enjoyment', [['0', 'As much as ever'], ['1', 'Rather less than I used to'], ['2', 'Definitely less'], ['3', 'Hardly at all']]),
                scale('p3', 'I have blamed myself unnecessarily when things went wrong', [['0', 'Never'], ['1', 'Hardly ever'], ['2', 'Some of the time'], ['3', 'Most of the time']]),
                scale('p4', 'I have felt worried or anxious for no clear reason', [['0', 'Not at all'], ['1', 'Hardly ever'], ['2', 'Sometimes'], ['3', 'Very often']]),
                scale('p5', 'I have felt scared or panicky for no good reason', [['0', 'Not at all'], ['1', 'Not much'], ['2', 'Sometimes'], ['3', 'Quite a lot']])
            ]
        },
        {
            title: 'The Past 7 Days',
            desc: 'A few more, in the same way.',
            fields: [
                scale('p6', 'Things have been getting on top of me', [['0', "No, I've been coping fine"], ['1', 'No, mostly coping well'], ['2', "Yes, sometimes I haven't coped"], ['3', "Yes, most of the time I haven't coped at all"]]),
                scale('p7', 'I have been so unhappy that I have had difficulty sleeping', [['0', 'Not at all'], ['1', 'Not very often'], ['2', 'Sometimes'], ['3', 'Most of the time']]),
                scale('p8', 'I have felt sad or miserable', [['0', 'Not at all'], ['1', 'Not very often'], ['2', 'Quite often'], ['3', 'Most of the time']]),
                scale('p9', 'I have been so unhappy that I have been crying', [['0', 'Never'], ['1', 'Only occasionally'], ['2', 'Quite often'], ['3', 'Most of the time']]),
                scale('p10', 'The thought of harming myself has occurred to me', [['0', 'Never'], ['1', 'Hardly ever'], ['2', 'Sometimes'], ['3', 'Quite often']], { hint: 'Please answer honestly. Whatever you choose, help is available and this feeling is treatable.' })
            ]
        }
    ],
    compute(a) {
        let total = 0
        for (let i = 1; i <= 10; i++) total += N(a['p' + i])
        const selfHarm = N(a.p10)
        const wks = N(a.weeks)

        let headline, tone, message
        if (total <= 8) { headline = 'Low Likelihood of Depression'; tone = 'emerald'; message = 'Your answers suggest you are coping reasonably well. The early months are demanding for everyone, and it is worth checking in with yourself again in a few weeks.' }
        else if (total <= 12) { headline = 'Possible Depression'; tone = 'amber'; message = 'Your score is in the range where postnatal depression is possible. This is not a diagnosis, but it is a clear signal to speak to a doctor rather than wait and see.' }
        else if (total <= 19) { headline = 'Likely Depression'; tone = 'orange'; message = 'Your score is in the range where postnatal depression is likely. This is a genuine medical condition caused by hormonal and life changes — not a reflection of you as a mother. It responds well to treatment.' }
        else { headline = 'Significant Distress'; tone = 'red'; message = 'Your answers indicate a substantial level of distress. Please speak to a doctor soon. Postnatal depression at this level is very treatable, and getting help early makes a real difference to both you and your baby.' }

        let urgent = null
        if (selfHarm >= 1) {
            urgent = 'You indicated thoughts of harming yourself. Please talk to someone today — a doctor, your partner, a family member, or a helpline. Tele-MANAS: 14416 (free, 24x7, many Indian languages). KIRAN: 1800-599-0019. These thoughts are a symptom of an illness that can be treated, and they do not mean you are a bad mother. If you feel you may act on them, go to the nearest emergency department or call someone to stay with you now.'
            if (tone !== 'red') { tone = 'red'; headline = 'Please Speak To Someone Today' }
        }

        const recs = []
        if (selfHarm >= 1) recs.push('Please do not sit with this alone. Tell one person today — a partner, parent, friend or doctor. Saying it out loud is often the hardest and most important step.')
        if (wks <= 2 && total <= 12) recs.push('In the first two weeks, "baby blues" affect up to 80% of women — tearfulness, mood swings and irritability that settle on their own. If it is still present after two weeks, it is worth reassessing.')
        if (total >= 10) {
            recs.push('Postnatal depression affects roughly 1 in 5 Indian mothers. It is caused by an abrupt hormonal shift combined with sleep loss and enormous life change — not by weakness or by failing at motherhood.')
            recs.push('Treatment works. Talking therapy is effective for mild to moderate symptoms, and medication is available and compatible with breastfeeding when needed. Ask specifically about options that allow you to continue feeding.')
            recs.push('Tell your partner or a family member what this score said. Postnatal depression is far harder to recover from in isolation, and the people around you usually want to help but do not know how.')
        }
        if (a.support === 'little' || a.support === 'none') recs.push('Low practical support is one of the strongest predictors of postnatal depression. Ask directly for specific help — one night feed, one meal, two hours of sleep — rather than general offers.')
        if (a.feeding === 'hard' || a.feeding === 'struggling') recs.push('Feeding difficulties and low mood feed into each other. A lactation consultant can often resolve the practical problem quickly, and a fed baby matters far more than how it happens.')
        if (a.delivery === 'complicated' || a.delivery === 'assisted') recs.push('A difficult birth raises the risk of both depression and post-traumatic symptoms. Talking through what happened with your obstetrician often helps more than people expect.')
        recs.push('Sleep deprivation alone can produce many of these symptoms. If at all possible, arrange one uninterrupted 4-5 hour block of sleep with someone else covering a feed.')
        recs.push('Get your haemoglobin and thyroid checked. Postpartum anaemia and thyroiditis both mimic depression closely and are simple to treat once found.')
        recs.push('This questionnaire is a screening aid, not a diagnosis. Only a clinician can make that assessment — but a score like yours is a good enough reason to book the appointment.')

        return {
            scoreValue: Math.round((total / 30) * 100),
            scoreDisplay: String(total),
            scoreCaption: 'Score / 30',
            headline, tone, message, urgent,
            hideGauge: true,
            stats: [
                { label: 'Your Score', value: total + ' / 30', note: total >= 13 ? 'Above threshold' : total >= 10 ? 'Borderline' : 'Below threshold' },
                { label: 'Weeks Postpartum', value: wks + ' weeks', note: wks <= 2 ? 'Baby blues window' : 'Beyond baby blues' },
                { label: 'Support at Home', value: a.support === 'lots' ? 'Plenty' : a.support === 'some' ? 'Some' : a.support === 'little' ? 'Very little' : 'None', note: (a.support === 'little' || a.support === 'none') ? 'A known risk factor' : 'Protective' },
                { label: 'Safety Item', value: selfHarm >= 1 ? 'Needs attention' : 'No concern flagged', note: selfHarm >= 1 ? 'Please seek help today' : 'Question 10' }
            ],
            recommendations: recs,
            helplines: [
                ['Tele-MANAS (Govt. of India)', '14416 — free, 24x7, multiple languages'],
                ['KIRAN Mental Health Helpline', '1800-599-0019 — free, 24x7'],
                ['Dr. Deepika Singh', '+91 85959 54095']
            ],
            sheet: 'Postnatal mood ' + total + '/30 - ' + headline + (selfHarm >= 1 ? ' [SAFETY ITEM FLAGGED - PRIORITY CALLBACK]' : '')
        }
    }
}

// ============================================================================
// 10. PMS / PMDD SCREENER
// ============================================================================
const pms = {
    id: 'pms',
    name: 'PMS & PMDD Screener',
    short: 'PMS / PMDD Screener',
    icon: 'fa-cloud-bolt',
    tone: 'violet',
    tagline: 'When it is more than "just PMS"',
    blurb: 'Severe premenstrual mood symptoms affect around 1 in 20 women and have a name — PMDD. Find out where you sit and what helps.',
    cta: 'Screen My Symptoms',
    intro: 'Answer about the week or two before your period, comparing it with how you feel after it ends.',
    pdfTitle: 'PMS & PMDD Screening Report',
    keywords: 'PMDD test, severe PMS, premenstrual mood symptoms',
    steps: [
        {
            title: 'Timing',
            desc: 'PMDD is defined by when symptoms happen, not just how bad they are.',
            fields: [
                num('age', 'Your age', { min: 12, max: 60, unit: 'years' }),
                sel('timing', 'Do your symptoms appear in the 1-2 weeks before your period?', [['', 'Select...'], ['yes', 'Yes, clearly'], ['sometimes', 'Sometimes'], ['no', 'No clear pattern']]),
                sel('resolve', 'Do they improve within a few days of your period starting?', [['', 'Select...'], ['yes', 'Yes, they lift clearly'], ['partly', 'Partly'], ['no', 'No, they continue all month']]),
                sel('freeWeek', 'Is there a stretch after your period when you feel completely fine?', [['', 'Select...'], ['yes', 'Yes'], ['somewhat', 'Somewhat'], ['no', 'No, never really']])
            ]
        },
        {
            title: 'Mood Symptoms',
            desc: 'How severe are these in the days before your period?',
            fields: [
                scale('c1', 'Sudden mood swings, or feeling suddenly tearful'),
                scale('c2', 'Irritability, anger, or increased conflict with people'),
                scale('c3', 'Low mood, hopelessness, or feeling worthless'),
                scale('c4', 'Anxiety, tension, or feeling on edge')
            ]
        },
        {
            title: 'Other Symptoms',
            fields: [
                scale('o1', 'Loss of interest in usual activities'),
                scale('o2', 'Difficulty concentrating'),
                scale('o3', 'Fatigue or lack of energy'),
                scale('o4', 'Appetite changes, cravings, or overeating'),
                scale('o5', 'Sleeping too much or too little'),
                scale('o6', 'Feeling overwhelmed or out of control'),
                scale('o7', 'Physical symptoms — breast tenderness, bloating, headache, joint pain')
            ]
        },
        {
            title: 'Impact',
            fields: [
                sel('work', 'Do these symptoms affect your work, studies or daily tasks?', [['', 'Select...'], ['no', 'Not really'], ['some', 'Somewhat'], ['lot', 'Significantly'], ['severe', 'I sometimes cannot function']]),
                sel('relationships', 'Do they affect your relationships?', [['', 'Select...'], ['no', 'Not really'], ['some', 'Somewhat'], ['lot', 'Significantly'], ['severe', 'They cause serious conflict']]),
                sel('otherDx', 'Do you have a diagnosed depression or anxiety condition?', [['', 'Select...'], ['no', 'No'], ['yes', 'Yes'], ['unsure', 'Not sure']]),
                sel('tracked', 'Have you tracked these symptoms across two or more cycles?', YN)
            ]
        }
    ],
    compute(a) {
        const core = ['c1', 'c2', 'c3', 'c4']
        const other = ['o1', 'o2', 'o3', 'o4', 'o5', 'o6', 'o7']
        const coreCount = core.filter(k => N(a[k]) >= 2).length
        const otherCount = other.filter(k => N(a[k]) >= 2).length
        const totalSymptoms = coreCount + otherCount
        const total = [...core, ...other].reduce((s, k) => s + N(a[k]), 0) // 0-44

        const cyclic = a.timing === 'yes' && (a.resolve === 'yes' || a.resolve === 'partly') && a.freeWeek !== 'no'
        const partlyCyclic = a.timing !== 'no' && a.resolve !== 'no'
        const impaired = a.work === 'lot' || a.work === 'severe' || a.relationships === 'lot' || a.relationships === 'severe'

        let headline, tone, message
        if (!partlyCyclic) {
            headline = 'Not a Premenstrual Pattern'; tone = 'amber'
            message = 'Your symptoms do not follow the cyclical pattern that defines PMS and PMDD — they continue through the month rather than lifting after your period. That points towards a mood or anxiety condition in its own right, which is equally treatable but managed differently. It is worth discussing directly.'
        } else if (cyclic && coreCount >= 1 && totalSymptoms >= 5 && impaired) {
            headline = 'Pattern Consistent with PMDD'; tone = 'orange'
            message = 'You report ' + totalSymptoms + ' significant symptoms including ' + coreCount + ' core mood symptom' + (coreCount > 1 ? 's' : '') + ', clear cyclical timing, and real impact on your life. That combination fits the diagnostic pattern for premenstrual dysphoric disorder. PMDD is a recognised condition, not an exaggeration of normal PMS, and it responds to specific treatment.'
        } else if (totalSymptoms >= 4 && (impaired || total >= 18)) {
            headline = 'Moderate to Severe PMS'; tone = 'amber'
            message = 'Your symptoms are cyclical and significant enough to affect daily life, but do not fully meet the pattern for PMDD. Moderate to severe PMS is common and there is plenty that helps.'
        } else if (totalSymptoms >= 2) {
            headline = 'Mild PMS'; tone = 'teal'
            message = 'You have a recognisable premenstrual pattern at a mild level. Most women experience some version of this, and simple measures usually keep it manageable.'
        } else {
            headline = 'Minimal Premenstrual Symptoms'; tone = 'emerald'
            message = 'Your symptoms are minimal. Nothing here suggests PMS or PMDD is affecting you significantly.'
        }

        let urgent = null
        if (N(a.c3) >= 4 && impaired) urgent = 'Severe premenstrual low mood that reaches this intensity deserves prompt attention, particularly if it ever includes thoughts of self-harm. If it does, please contact a doctor or call Tele-MANAS on 14416 today.'

        const recs = []
        if (a.tracked !== 'yes') recs.push('Track your symptoms daily across two full cycles before any diagnosis is made. Prospective tracking is a formal requirement for diagnosing PMDD, because looking back tends to distort the pattern. A simple 0-3 rating in a notebook or phone app is enough.')
        if (cyclic && totalSymptoms >= 5 && impaired) {
            recs.push('SSRIs are the first-line treatment for PMDD and work differently here than in depression — they often help within a day or two, and can be taken only during the luteal phase rather than continuously.')
            recs.push('Suppressing ovulation with a continuous combined pill is another effective approach, since the symptoms are driven by the hormonal shift after ovulation rather than by abnormal hormone levels.')
        }
        if (!partlyCyclic) recs.push('Because your symptoms are not clearly cyclical, the more useful step is an assessment for depression or an anxiety condition. The treatments differ and getting the right one matters.')
        if (a.otherDx === 'yes') recs.push('An existing mood or anxiety condition often worsens premenstrually — this is called premenstrual exacerbation, and it is managed by adjusting existing treatment rather than adding a new diagnosis.')
        recs.push('Calcium at 1,000-1,200 mg daily has reasonable evidence for reducing premenstrual symptoms. Vitamin B6 and magnesium have weaker but real supporting evidence.')
        recs.push('Aerobic exercise, consistent sleep and reducing caffeine, alcohol and salt in the luteal phase all help measurably, and cost nothing to try.')
        if (N(a.o7) >= 3) recs.push('Marked breast tenderness and bloating respond to reducing salt, caffeine and, where relevant, a well-fitted supportive bra. Persistent severe breast pain deserves a separate examination.')
        recs.push('Symptoms that appear only before your period are not "in your head" and not a personality flaw. The hormonal shift after ovulation affects brain chemistry, and sensitivity to it varies genuinely between women.')

        return {
            scoreValue: Math.round((total / 44) * 100),
            scoreDisplay: String(total),
            scoreCaption: 'Severity / 44',
            headline, tone, message, urgent,
            stats: [
                { label: 'Core Mood Symptoms', value: coreCount + ' / 4', note: coreCount >= 1 ? 'Required for PMDD' : 'None significant' },
                { label: 'Total Symptoms', value: String(totalSymptoms), note: totalSymptoms >= 5 ? '5+ meets threshold' : 'Below threshold' },
                { label: 'Cyclical Pattern', value: cyclic ? 'Yes, clear' : partlyCyclic ? 'Partial' : 'No', note: 'Defines PMS/PMDD' },
                { label: 'Functional Impact', value: impaired ? 'Significant' : 'Limited', note: 'Required for PMDD' }
            ],
            table: {
                title: 'How PMDD Is Distinguished from PMS',
                columns: ['Criterion', 'Required', 'You'],
                rows: [
                    ['Symptoms in the luteal phase only', 'Yes', a.timing === 'yes' ? 'Yes' : a.timing === 'sometimes' ? 'Partly' : 'No'],
                    ['Resolve after period starts', 'Yes', a.resolve === 'yes' ? 'Yes' : a.resolve === 'partly' ? 'Partly' : 'No'],
                    ['At least 1 core mood symptom', 'Yes', coreCount >= 1 ? 'Yes (' + coreCount + ')' : 'No'],
                    ['5 or more symptoms in total', 'Yes', totalSymptoms >= 5 ? 'Yes (' + totalSymptoms + ')' : 'No (' + totalSymptoms + ')'],
                    ['Interferes with work or relationships', 'Yes', impaired ? 'Yes' : 'No'],
                    ['Confirmed over 2 tracked cycles', 'Yes', a.tracked === 'yes' ? 'Yes' : 'Not yet']
                ]
            },
            recommendations: recs,
            sheet: 'PMS/PMDD ' + total + '/44 - ' + headline
        }
    }
}

// ============================================================================
// 11. TEEN PERIOD HEALTH CHECKER
// ============================================================================
const teen = {
    id: 'teen-period',
    name: 'Teen Period Checker',
    short: 'Teen Period Checker',
    icon: 'fa-child-dress',
    tone: 'pink',
    tagline: 'Is my period normal? — for ages 10 to 19',
    blurb: 'Written for teenagers and their mothers. Find out what is normal at your age, and the few things genuinely worth seeing a doctor about.',
    cta: 'Check My Cycle',
    intro: 'Most answers here turn out to be "this is completely normal". This tool exists mainly to say so with confidence.',
    pdfTitle: 'Teen Menstrual Health Report',
    keywords: 'is my period normal teenager, first period age, irregular periods teen',
    steps: [
        {
            title: 'About You',
            fields: [
                num('age', 'Your age now', { min: 8, max: 21, unit: 'years' }),
                sel('started', 'Have your periods started?', [['', 'Select...'], ['yes', 'Yes'], ['no', 'Not yet']]),
                num('menarcheAge', 'How old were you at your first period?', { min: 8, max: 20, unit: 'years', required: false, when: (a) => a.started === 'yes' }),
                sel('breastDev', 'Have you noticed breast development?', [['', 'Select...'], ['yes', 'Yes'], ['starting', 'Just starting'], ['no', 'Not yet']], { when: (a) => a.started === 'no' })
            ]
        },
        {
            title: 'Your Cycle',
            when: (a) => a.started === 'yes',
            fields: [
                sel('regularity', 'How predictable are your periods?', [['', 'Select...'], ['regular', 'Pretty regular — I can guess the date'], ['somewhat', 'Roughly predictable, within a week or so'], ['irregular', 'Unpredictable month to month'], ['rare', 'Only a few times a year']]),
                sel('gap', 'Usual gap between periods', [['', 'Select...'], ['short', 'Less than 21 days'], ['normal', '21 to 45 days'], ['long', '45 to 90 days'], ['verylong', 'More than 90 days']]),
                num('bleedDays', 'How many days does bleeding last?', { min: 1, max: 20, unit: 'days' }),
                sel('heavy', 'Do you soak through a pad in less than 2 hours, or pass big clots?', [['', 'Select...'], ['no', 'No'], ['sometimes', 'Sometimes'], ['yes', 'Yes, often']])
            ]
        },
        {
            title: 'Pain & Impact',
            when: (a) => a.started === 'yes',
            fields: [
                sel('pain', 'How bad is your period pain?', [['', 'Select...'], ['none', 'None or very mild'], ['mild', 'Mild — I barely notice it'], ['mod', 'Moderate — painkillers help'], ['severe', 'Severe — painkillers barely help']]),
                sel('missSchool', 'Do you miss school or college because of your period?', [['', 'Select...'], ['no', 'Never'], ['rare', 'Once or twice a year'], ['some', 'Most months, a day or so'], ['often', 'Most months, more than a day']]),
                chk('other', 'Tick anything you have noticed', [
                    ['acne', 'Bad acne'],
                    ['hair', 'Extra hair on face, chest or tummy'],
                    ['weight', 'Rapid weight gain'],
                    ['darkPatches', 'Dark patches on neck or armpits'],
                    ['tired', 'Very tired, dizzy or breathless'],
                    ['discharge', 'Unusual discharge, itching or smell']
                ])
            ]
        }
    ],
    compute(a) {
        const age = N(a.age)
        const started = a.started === 'yes'
        const menarche = N(a.menarcheAge)
        const yearsSince = started && menarche ? age - menarche : 0
        const other = Array.isArray(a.other) ? a.other : []

        const concerns = []
        const reassurance = []
        // Some findings need a doctor regardless of how few other concerns there
        // are, so they escalate the headline on their own.
        let serious = false

        if (!started) {
            if (age >= 15) { serious = true; concerns.push('Periods have not started by age 15. This is called primary amenorrhoea and always deserves a check-up — most causes are simple and treatable.') }
            else if (age >= 13 && a.breastDev === 'no') { serious = true; concerns.push('No periods and no breast development by age 13 is worth investigating. Puberty normally begins with breast development around age 10-11.') }
            else if (age >= 13) reassurance.push('Breast development has started, which means puberty is underway. Periods usually follow 2-3 years after that first change, so there is time yet.')
            else reassurance.push('At your age, not having started periods is completely normal. Most girls in India start between 11 and 14, and anywhere from 10 to 15 is within the normal range.')
        } else {
            if (menarche && menarche < 9) { serious = true; concerns.push('Starting periods before age 9 is early and should be assessed.') }
            else if (menarche) reassurance.push('Starting at ' + menarche + ' is within the normal range of 10 to 15 years.')

            if (a.gap === 'verylong') { serious = true; concerns.push('Gaps of more than 90 days between periods are outside the normal range at any age, including in the first years. This is worth checking.') }
            else if (a.gap === 'long' && yearsSince >= 3) concerns.push('By three years after your first period, cycles usually settle to between 21 and 35 days. Gaps of 45-90 days at this stage suggest a hormonal cause worth investigating, most commonly PCOS or thyroid.')
            else if (a.gap === 'long') reassurance.push('Longer gaps are genuinely normal in the first two to three years — the cycle takes time to settle. A gap of up to 45 days is expected at this stage.')
            else if (a.gap === 'short') concerns.push('Periods closer together than 21 days are more frequent than expected and worth mentioning to a doctor.')
            else reassurance.push('Your cycle length is in the normal range.')

            if (a.regularity === 'irregular' && yearsSince < 3) reassurance.push('Irregular periods in the first three years are the rule, not the exception — cycles are often anovulatory at first and become predictable with time.')
            else if (a.regularity === 'rare') { serious = true; concerns.push('Having only a few periods a year needs evaluation regardless of how long ago yours started.') }
            else if (a.regularity === 'irregular' && yearsSince >= 3) concerns.push('Persistent irregularity three or more years after your first period is worth a hormonal check.')

            if (N(a.bleedDays) > 7) concerns.push('Bleeding for more than 7 days is longer than expected and should be checked.')
            else reassurance.push('Bleeding for ' + N(a.bleedDays) + ' days is within the normal range of 2 to 7 days.')

            if (a.heavy === 'yes') { serious = true; concerns.push('Soaking through a pad in under 2 hours, or passing large clots, means heavy bleeding. This is treatable and also a common cause of low iron in teenagers.') }
            else if (a.heavy === 'sometimes') concerns.push('Occasionally soaking through quickly is worth keeping an eye on. Try the Heavy Period Checker for a proper measurement.')

            if (a.pain === 'severe') { serious = true; concerns.push('Period pain that painkillers barely touch is not something to simply put up with. It is treatable, and occasionally points to endometriosis, which is under-diagnosed in teenagers.') }
            if (a.missSchool === 'often') { serious = true; concerns.push('Missing more than a day of school most months is a sign that the pain or bleeding needs proper treatment — it is not something you should have to work around.') }
            else if (a.missSchool === 'some') concerns.push('Missing school because of periods most months suggests the pain or bleeding could be controlled much better than it currently is.')

            if (other.includes('acne') && other.includes('hair')) concerns.push('Acne together with extra body hair and irregular periods can indicate PCOS. It is very manageable when picked up early.')
            if (other.includes('darkPatches')) concerns.push('Dark velvety patches on the neck or armpits suggest insulin resistance and are worth a blood sugar check.')
            if (other.includes('tired')) concerns.push('Feeling very tired, dizzy or breathless alongside periods often means low iron. A simple blood test will confirm it.')
            if (other.includes('discharge')) concerns.push('Unusual discharge, itching or smell should be examined — it is usually a simple, easily treated infection.')
        }

        let headline, tone, message
        if (concerns.length === 0) {
            headline = 'Everything Looks Normal'; tone = 'emerald'
            message = 'Nothing in your answers falls outside what is normal for your age. Periods vary enormously between people, and yours are behaving as expected.'
        } else if (serious) {
            headline = 'Please See a Doctor'; tone = 'orange'
            message = 'Most of what you described may well be normal, but at least one thing needs a doctor to look at it properly rather than waiting to see if it settles. None of this is an emergency, and almost all of it has a straightforward treatment.'
        } else if (concerns.length <= 2) {
            headline = 'Mostly Normal — One or Two Things to Check'; tone = 'amber'
            message = 'Most of what you described is completely normal. There ' + (concerns.length === 1 ? 'is one thing' : 'are a couple of things') + ' worth mentioning to a doctor — not because anything is wrong, but because they are easy to sort out.'
        } else {
            headline = 'Worth Seeing a Doctor'; tone = 'orange'
            message = 'Several things you described are worth getting checked. None of them are emergencies, and almost all of them have straightforward treatments. Take this report with you.'
        }

        let urgent = null
        if (a.heavy === 'yes' && other.includes('tired')) urgent = 'Heavy bleeding together with tiredness, dizziness or breathlessness usually means low iron (anaemia). Please get a blood test and see a doctor soon — this is very treatable but should not be ignored.'

        const recs = []
        recs.push('Track your periods on a phone app or calendar. Three months of dates tells a doctor far more than trying to remember, and takes ten seconds a month.')
        if (concerns.length) recs.push('Take this report to the appointment. It saves explaining everything from scratch, and gives the doctor the specific details that matter.')
        if (a.pain !== 'none' && a.pain !== 'mild') recs.push('For period pain, ibuprofen or mefenamic acid taken as soon as pain starts — or even a day before — works much better than waiting until it is severe. A hot water bottle genuinely helps too.')
        if (other.includes('tired') || a.heavy !== 'no') recs.push('Ask for a haemoglobin test. Iron deficiency is extremely common in Indian teenage girls and causes tiredness, poor concentration and hair fall long before it becomes obvious.')
        if (!started && age >= 14) recs.push('If periods have not started by 15, or by 13 with no signs of puberty, an examination and a few blood tests can identify the reason. Most causes are readily treatable.')
        recs.push('Bring a parent if that helps, but know that you can also ask to speak to the doctor on your own for part of the visit. Nothing you describe here is embarrassing to a gynaecologist.')
        recs.push('Normal ranges for teenagers: first period between 10 and 15, cycles of 21-45 days in the first three years, bleeding for 2-7 days, and pain that responds to ordinary painkillers.')

        return {
            scoreValue: null, scoreDisplay: null, scoreCaption: null,
            headline, tone, message, urgent,
            stats: [
                { label: 'Things Looking Normal', value: String(reassurance.length), note: 'See list below' },
                { label: 'Worth Checking', value: String(concerns.length), note: concerns.length ? 'Not urgent' : 'Nothing flagged' },
                { label: 'Periods Started', value: started ? (menarche ? 'Age ' + menarche : 'Yes') : 'Not yet', note: started && yearsSince ? yearsSince + ' years ago' : 'Normal range 10-15' },
                { label: 'Cycle Pattern', value: started ? (a.gap === 'normal' ? 'Normal' : a.gap === 'short' ? 'Short' : a.gap === 'long' ? 'Long' : 'Very long') : 'N/A', note: started ? '21-45 days is normal for teens' : '' }
            ],
            table: (reassurance.length || concerns.length) ? {
                title: 'What Your Answers Show',
                columns: ['Finding', 'Type'],
                rows: [
                    ...reassurance.map(x => [x, 'Normal']),
                    ...concerns.map(x => [x, 'Check it'])
                ]
            } : null,
            recommendations: recs,
            sheet: 'Teen check - ' + headline + ' (' + concerns.length + ' concerns)'
        }
    }
}

// ============================================================================
// 12. PERIOD PAIN & ENDOMETRIOSIS SCREENER
// ============================================================================
const endo = {
    id: 'period-pain',
    name: 'Period Pain & Endometriosis Checker',
    short: 'Period Pain Checker',
    icon: 'fa-bolt',
    tone: 'amber',
    tagline: 'Endometriosis takes 7 years to diagnose. It should not.',
    blurb: 'Severe period pain is common but not normal. Check your symptoms against the recognised warning signs for endometriosis and adenomyosis.',
    cta: 'Check My Pain',
    intro: 'Period pain that stops you functioning is not something you are supposed to tolerate. This checks for the patterns doctors look for.',
    pdfTitle: 'Period Pain & Endometriosis Screening',
    keywords: 'endometriosis symptoms, severe period pain, painful periods treatment',
    steps: [
        {
            title: 'Your Pain',
            fields: [
                num('age', 'Your age', { min: 10, max: 60, unit: 'years' }),
                num('painScore', 'Worst period pain on a scale of 0 to 10', { min: 0, max: 10, unit: '/10', placeholder: 'e.g. 8' }),
                sel('painDays', 'How many days of each cycle are you in pain?', [['', 'Select...'], ['0', 'None'], ['1', '1 day'], ['2', '2 to 3 days'], ['4', '4 to 7 days'], ['8', 'More than a week']]),
                sel('painkillers', 'Do painkillers control it?', [['', 'Select...'], ['none', "I don't need them"], ['yes', 'Yes, they work well'], ['partly', 'Only partly'], ['no', 'Barely at all']]),
                sel('missDays', 'Do you miss work, school or plans because of it?', [['', 'Select...'], ['no', 'Never'], ['rare', 'Rarely'], ['some', 'Most months'], ['often', 'Most months, more than a day']])
            ]
        },
        {
            title: 'Pattern & Symptoms',
            desc: 'These are the specific patterns that distinguish endometriosis from ordinary period pain.',
            fields: [
                sel('before', 'Does the pain start before the bleeding does?', [['', 'Select...'], ['no', 'No, it starts with the bleeding'], ['sameday', 'Same day'], ['yes', 'Yes, a day or more before']]),
                sel('sex', 'Do you have deep pain during or after intercourse?', [['', 'Select...'], ['na', 'Not applicable'], ['no', 'No'], ['sometimes', 'Sometimes'], ['yes', 'Yes, regularly']]),
                sel('bowel', 'Pain when passing stool or urine during your period?', [['', 'Select...'], ['no', 'No'], ['sometimes', 'Sometimes'], ['yes', 'Yes, regularly']]),
                sel('chronic', 'Do you get pelvic pain at other times of the month too?', [['', 'Select...'], ['no', 'No'], ['sometimes', 'Occasionally'], ['yes', 'Yes, often']]),
                sel('worsening', 'Has the pain got worse over the years?', [['', 'Select...'], ['no', 'No, about the same'], ['some', 'Somewhat worse'], ['yes', 'Definitely worse']])
            ]
        },
        {
            title: 'Related Symptoms',
            fields: [
                chk('assoc', 'Tick anything that applies', [
                    ['heavy', 'Heavy bleeding or clots'],
                    ['bloat', 'Severe bloating during periods'],
                    ['fatigue', 'Extreme fatigue around periods'],
                    ['nausea', 'Nausea or vomiting with the pain'],
                    ['bowelSym', 'Diarrhoea or constipation with periods'],
                    ['back', 'Low back or leg pain with periods'],
                    ['family', 'Mother or sister with endometriosis'],
                    ['infertility', 'Difficulty conceiving'],
                    ['ovarianCyst', 'Told I have an ovarian cyst or chocolate cyst'],
                    ['noRelief', 'Tried the pill and it did not help']
                ]),
                sel('duration', 'How long have you had this pain?', [['', 'Select...'], ['recent', 'Less than a year'], ['few', '1 to 3 years'], ['many', 'More than 3 years'], ['always', 'Since my periods began']])
            ]
        }
    ],
    compute(a) {
        const assoc = Array.isArray(a.assoc) ? a.assoc : []
        let score = 0

        const p = N(a.painScore)
        if (p >= 8) score += 18; else if (p >= 6) score += 12; else if (p >= 4) score += 6
        const pd = N(a.painDays)
        if (pd >= 8) score += 12; else if (pd >= 4) score += 8; else if (pd >= 2) score += 4
        if (a.painkillers === 'no') score += 14; else if (a.painkillers === 'partly') score += 8
        if (a.missDays === 'often') score += 12; else if (a.missDays === 'some') score += 8; else if (a.missDays === 'rare') score += 3

        if (a.before === 'yes') score += 10; else if (a.before === 'sameday') score += 4
        if (a.sex === 'yes') score += 14; else if (a.sex === 'sometimes') score += 8
        if (a.bowel === 'yes') score += 14; else if (a.bowel === 'sometimes') score += 7
        if (a.chronic === 'yes') score += 12; else if (a.chronic === 'sometimes') score += 6
        if (a.worsening === 'yes') score += 8; else if (a.worsening === 'some') score += 4

        if (assoc.includes('heavy')) score += 5
        if (assoc.includes('bloat')) score += 3
        if (assoc.includes('fatigue')) score += 3
        if (assoc.includes('nausea')) score += 4
        if (assoc.includes('bowelSym')) score += 5
        if (assoc.includes('back')) score += 4
        if (assoc.includes('family')) score += 10
        if (assoc.includes('infertility')) score += 12
        if (assoc.includes('ovarianCyst')) score += 14
        if (assoc.includes('noRelief')) score += 8

        const pct = Math.min(100, Math.round((score / 150) * 100))

        let headline, tone, message
        if (pct < 20) { headline = 'Typical Period Pain'; tone = 'emerald'; message = 'Your pattern fits ordinary primary dysmenorrhoea — period pain caused by normal uterine contractions. It is common, and usually manageable with simple measures.' }
        else if (pct < 40) { headline = 'Moderate — Worth Managing Better'; tone = 'teal'; message = 'Your pain is more troublesome than average but does not show the specific patterns most associated with endometriosis. There is a lot that can be done to control it better than you currently are.' }
        else if (pct < 60) { headline = 'Several Warning Signs Present'; tone = 'amber'; message = 'You report several features that raise the possibility of endometriosis or adenomyosis rather than ordinary period pain. This warrants a proper gynaecological assessment rather than more painkillers.' }
        else if (pct < 78) { headline = 'Strongly Suggestive Pattern'; tone = 'orange'; message = 'Your combination of symptoms is strongly suggestive of endometriosis or adenomyosis. Please arrange an assessment. The average delay to diagnosis is 7-8 years, largely because women are told this pain is normal — it is not.' }
        else { headline = 'Highly Suggestive — Please Get Assessed'; tone = 'red'; message = 'You report a strong cluster of the features specifically associated with endometriosis. Please see a gynaecologist rather than continuing to manage this alone. Effective treatment exists at every level of severity.' }

        const flags = []
        if (a.painkillers === 'no') flags.push('Pain not controlled by painkillers')
        if (a.before === 'yes') flags.push('Pain starts before bleeding')
        if (a.sex === 'yes' || a.sex === 'sometimes') flags.push('Deep pain during intercourse')
        if (a.bowel === 'yes' || a.bowel === 'sometimes') flags.push('Pain passing stool or urine during periods')
        if (a.chronic === 'yes') flags.push('Pelvic pain outside periods')
        if (a.worsening === 'yes') flags.push('Progressively worsening over years')
        if (assoc.includes('family')) flags.push('Family history of endometriosis')
        if (assoc.includes('infertility')) flags.push('Difficulty conceiving')
        if (assoc.includes('ovarianCyst')) flags.push('Known ovarian or chocolate cyst')
        if (assoc.includes('noRelief')) flags.push('No relief from hormonal treatment')
        if (a.missDays === 'often' || a.missDays === 'some') flags.push('Regularly missing work or school')

        let urgent = null
        if (p >= 9 && a.painkillers === 'no' && a.chronic === 'yes') urgent = 'Severe pain that painkillers do not touch, present outside your period as well, needs assessment soon rather than at a routine appointment. Sudden severe one-sided pelvic pain with fainting or vomiting is an emergency — go to hospital.'

        const recs = []
        if (pct >= 40) {
            recs.push('Ask specifically for a transvaginal ultrasound by someone experienced in endometriosis. A normal scan does not rule it out — superficial disease is invisible on imaging, which is a major reason diagnosis gets delayed.')
            recs.push('Treatment does not have to start with surgery. Hormonal management — continuous combined pill, progestogens or the hormonal IUD — is first-line and effective for most women.')
            recs.push('Keep a pain diary for two cycles noting pain score, days affected, painkillers used and days missed. Concrete numbers change how seriously symptoms are taken.')
        }
        if (assoc.includes('infertility')) recs.push('Endometriosis is found in 25-50% of women investigated for infertility. If you are trying to conceive, this changes both the urgency and the treatment approach — mention it explicitly.')
        if (a.painkillers === 'partly' || a.painkillers === 'yes') recs.push('NSAIDs such as mefenamic acid or ibuprofen work best started 24 hours before pain is expected, rather than after it begins. Many women under-dose and conclude they do not work.')
        if (assoc.includes('heavy')) recs.push('Heavy bleeding alongside severe pain, especially with a bulky uterus, points towards adenomyosis. It is often missed and responds well to the hormonal IUD.')
        if (a.duration === 'many' || a.duration === 'always') recs.push('You have had this for years. The average woman with endometriosis sees several doctors before diagnosis — being specific about the pattern, not just "bad periods", makes a real difference.')
        recs.push('Heat, regular exercise and pelvic floor physiotherapy all have genuine evidence for pelvic pain, and work alongside medical treatment rather than instead of it.')
        recs.push('Pain that stops you doing normal things is never "just part of being a woman". That phrase is the single biggest reason endometriosis goes undiagnosed for years.')

        return {
            scoreValue: pct,
            scoreDisplay: pct + '%',
            scoreCaption: 'Suggestive Score',
            headline, tone, message, urgent,
            stats: [
                { label: 'Pain Score', value: p + ' / 10', note: p >= 7 ? 'Severe' : p >= 4 ? 'Moderate' : 'Mild' },
                { label: 'Warning Signs', value: String(flags.length), note: flags.length >= 4 ? 'Significant cluster' : flags.length ? 'Some present' : 'None' },
                { label: 'Days in Pain', value: pd ? pd + '+ days' : 'None', note: 'Per cycle' },
                { label: 'Painkiller Response', value: a.painkillers === 'no' ? 'Poor' : a.painkillers === 'partly' ? 'Partial' : 'Good', note: 'Key indicator' }
            ],
            table: flags.length ? {
                title: 'Warning Signs You Reported',
                columns: ['Feature'],
                rows: flags.map(f => [f])
            } : null,
            recommendations: recs,
            sheet: 'Period pain ' + pct + '% - ' + headline + ' (' + flags.length + ' flags)'
        }
    }
}

// ============================================================================
// 13. THYROID SYMPTOM CHECKER
// ============================================================================
const thyroid = {
    id: 'thyroid',
    name: 'Thyroid Symptom Checker',
    short: 'Thyroid Checker',
    icon: 'fa-gauge-high',
    tone: 'cyan',
    tagline: 'One in ten Indian women has a thyroid disorder',
    blurb: 'Thyroid problems mimic PCOS, infertility and depression. Check your symptoms and interpret your TSH if you have a report.',
    cta: 'Check My Thyroid',
    intro: 'Thyroid disorders are up to ten times more common in women, and are frequently mistaken for something else.',
    pdfTitle: 'Thyroid Symptom Report',
    keywords: 'thyroid symptoms women, TSH normal range, hypothyroidism test',
    steps: [
        {
            title: 'About You',
            fields: [
                num('age', 'Your age', { min: 12, max: 80, unit: 'years' }),
                sel('status', 'Which applies to you?', [['', 'Select...'], ['none', 'Not pregnant or planning'], ['planning', 'Planning a pregnancy'], ['pregnant', 'Currently pregnant'], ['postpartum', 'Delivered in the last year']]),
                sel('known', 'Have you been diagnosed with a thyroid condition before?', [['', 'Select...'], ['no', 'No'], ['hypo', 'Yes, underactive (hypothyroid)'], ['hyper', 'Yes, overactive (hyperthyroid)'], ['nodule', 'Yes, a nodule or goitre']]),
                sel('familyHx', 'Thyroid disease in your family?', YN)
            ]
        },
        {
            title: 'Underactive Symptoms',
            desc: 'How much have you noticed these over the last few months?',
            fields: [
                scale('h1', 'Tiredness and low energy', S03),
                scale('h2', 'Feeling cold when others do not', S03),
                scale('h3', 'Weight gain despite no change in eating', S03),
                scale('h4', 'Constipation', S03),
                scale('h5', 'Dry skin, hair fall, or brittle nails', S03),
                scale('h6', 'Heavy or prolonged periods', S03),
                scale('h7', 'Low mood, poor memory or slow thinking', S03),
                scale('h8', 'Puffy face or swelling around the eyes', S03)
            ]
        },
        {
            title: 'Overactive Symptoms',
            fields: [
                scale('t1', 'Unexplained weight loss', S03),
                scale('t2', 'Feeling hot or sweating more than usual', S03),
                scale('t3', 'Palpitations or a racing heart', S03),
                scale('t4', 'Anxiety, restlessness or irritability', S03),
                scale('t5', 'Trembling hands', S03),
                scale('t6', 'Loose stools or going more often', S03),
                scale('t7', 'Light or absent periods', S03),
                scale('t8', 'Difficulty sleeping', S03)
            ]
        },
        {
            title: 'Neck & Lab Values',
            fields: [
                sel('neck', 'Any swelling, lump or tightness in the front of your neck?', [['', 'Select...'], ['no', 'No'], ['maybe', 'Possibly'], ['yes', 'Yes, clearly']]),
                num('tsh', 'TSH (mIU/L)', { min: 0, max: 150, step: 0.01, required: false, placeholder: 'e.g. 6.2', hint: 'Optional — from a recent blood report' }),
                num('t4', 'Free T4 (ng/dL)', { min: 0, max: 10, step: 0.01, required: false, placeholder: 'e.g. 1.1' }),
                sel('tpo', 'Anti-TPO antibodies', [['', 'Not tested / unknown'], ['neg', 'Negative'], ['pos', 'Positive']], { required: false })
            ]
        }
    ],
    compute(a) {
        const hypo = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'h7', 'h8'].reduce((s, k) => s + N(a[k]), 0) // 0-24
        const hyper = ['t1', 't2', 't3', 't4', 't5', 't6', 't7', 't8'].reduce((s, k) => s + N(a[k]), 0) // 0-24
        const tsh = has(a.tsh) ? N(a.tsh) : null
        const t4 = has(a.t4) ? N(a.t4) : null
        const preg = a.status === 'pregnant'

        let headline, tone, message, labVerdict = 'Not entered'

        if (tsh !== null && tsh > 0) {
            const upper = preg ? 4.0 : 4.5
            const pregTarget = preg ? 2.5 : null
            if (tsh > 10) { labVerdict = 'Clearly underactive'; headline = 'Overt Hypothyroidism Likely'; tone = 'red'; message = 'A TSH above 10 mIU/L indicates a clearly underactive thyroid regardless of symptoms. This needs treatment — thyroxine replacement is inexpensive, safe and highly effective.' }
            else if (tsh > upper) { labVerdict = 'Mildly underactive'; headline = 'Subclinical Hypothyroidism'; tone = 'amber'; message = 'A TSH of ' + tsh + ' mIU/L is above the upper limit of ' + upper + '. Whether this needs treatment depends on your symptoms, antibody status and whether you are pregnant or planning to be. It should be repeated and reviewed rather than ignored.' }
            else if (preg && tsh > 2.5) { labVerdict = 'Above pregnancy target'; headline = 'Above Pregnancy Target'; tone = 'amber'; message = 'A TSH of ' + tsh + ' is within the general population range but above the target of 2.5 mIU/L that is usually aimed for in pregnancy and while trying to conceive. This is worth acting on.' }
            else if (tsh < 0.4) { labVerdict = 'Overactive'; headline = 'Possible Hyperthyroidism'; tone = 'orange'; message = 'A TSH below 0.4 mIU/L suggests an overactive thyroid. Free T4 and T3 are needed to confirm and grade it, and it should be assessed promptly.' }
            else { labVerdict = 'Normal'; headline = 'Thyroid Function Normal'; tone = 'emerald'; message = 'Your TSH of ' + tsh + ' mIU/L is within the normal range' + (preg ? ' including the tighter pregnancy target' : '') + '. If you have significant symptoms, the cause is likely to be something other than your thyroid — which is worth pursuing rather than dropping.' }
        } else {
            const lean = hypo - hyper
            if (hypo < 6 && hyper < 6) { headline = 'Thyroid Problem Unlikely'; tone = 'emerald'; message = 'Your symptom pattern does not particularly suggest a thyroid disorder. A TSH test is still cheap and worthwhile if you have unexplained fatigue or menstrual changes.' }
            else if (lean >= 5) { headline = 'Pattern Suggests Underactive Thyroid'; tone = 'amber'; message = 'Your symptoms lean towards hypothyroidism — an underactive thyroid, which is by far the commonest thyroid problem in Indian women. A single TSH blood test will settle it.' }
            else if (lean <= -5) { headline = 'Pattern Suggests Overactive Thyroid'; tone = 'amber'; message = 'Your symptoms lean towards hyperthyroidism — an overactive thyroid. A TSH with free T4 and T3 is the next step, and this one should not be delayed.' }
            else { headline = 'Mixed Symptom Pattern'; tone = 'teal'; message = 'You have symptoms from both directions, which is common and does not point clearly either way. Many of these symptoms overlap with anaemia, PCOS, vitamin D deficiency and stress. A TSH test plus a CBC is a sensible starting panel.' }
        }

        let urgent = null
        if (hyper >= 15 && N(a.t3 || 0) === 0 && N(a.t4) === 0 && (tsh === null || tsh < 0.4)) {
            urgent = 'A strong cluster of overactive symptoms — palpitations, weight loss, tremor and heat intolerance — should be assessed soon rather than at a routine appointment, as untreated hyperthyroidism affects the heart.'
        }
        if (a.neck === 'yes') urgent = (urgent ? urgent + ' ' : '') + 'A clearly visible or palpable neck swelling should be examined and scanned. Most thyroid nodules are benign, but they all warrant assessment.'

        const recs = []
        if (tsh === null || tsh === 0) recs.push('Ask for a TSH test — it is inexpensive, needs no fasting, and is the single best screening test. Add free T4 if symptoms are marked.')
        if (a.status === 'planning' || preg) recs.push('In pregnancy and while trying to conceive, the target TSH is under 2.5 mIU/L, tighter than the general range. Untreated hypothyroidism raises the risk of miscarriage and affects the baby\'s neurological development — this is one of the few situations where a borderline result definitely needs acting on.')
        if (a.status === 'postpartum') recs.push('Postpartum thyroiditis affects roughly 5-10% of women in the year after delivery, often producing an overactive phase followed by an underactive one. It is very commonly mistaken for postnatal depression or simply exhaustion.')
        if (N(a.h6) >= 2) recs.push('Heavy periods are a classic and often-missed sign of an underactive thyroid. If yours are heavy, checking thyroid function is worthwhile before assuming a gynaecological cause.')
        if (hypo >= 10) recs.push('Hypothyroid symptoms overlap heavily with iron deficiency and vitamin D deficiency, both extremely common in Indian women. Ask for a CBC, ferritin and vitamin D alongside the TSH — treating the wrong one wastes months.')
        if (a.tpo === 'pos') recs.push('Positive anti-TPO antibodies indicate Hashimoto\'s thyroiditis, the commonest cause of hypothyroidism. It means your thyroid function should be monitored annually even if it is currently normal, and treated more readily in pregnancy.')
        if (a.familyHx === 'yes') recs.push('A family history of thyroid disease meaningfully raises your own risk and is a good reason for periodic testing even without symptoms.')
        if (tsh !== null && tsh > 4.5) recs.push('Take thyroxine on an empty stomach, 30-60 minutes before breakfast, and keep calcium and iron tablets at least 4 hours apart — they block absorption substantially. This is the commonest reason treatment appears not to work.')
        recs.push('Thyroid symptoms overlap with PCOS, anaemia and depression, which is why it is so often missed. A single blood test rules it in or out definitively.')

        return {
            scoreValue: Math.round((Math.max(hypo, hyper) / 24) * 100),
            scoreDisplay: tsh !== null && tsh > 0 ? String(tsh) : String(Math.max(hypo, hyper)),
            scoreCaption: tsh !== null && tsh > 0 ? 'TSH (mIU/L)' : 'Symptom load',
            headline, tone, message, urgent,
            stats: [
                { label: 'Underactive Symptoms', value: hypo + ' / 24', note: hypo >= 12 ? 'High' : hypo >= 6 ? 'Moderate' : 'Low' },
                { label: 'Overactive Symptoms', value: hyper + ' / 24', note: hyper >= 12 ? 'High' : hyper >= 6 ? 'Moderate' : 'Low' },
                { label: 'TSH Interpretation', value: labVerdict, note: preg ? 'Pregnancy target < 2.5' : 'Normal 0.4 - 4.5' },
                { label: 'Neck Swelling', value: a.neck === 'yes' ? 'Yes' : a.neck === 'maybe' ? 'Possibly' : 'No', note: a.neck === 'no' ? 'Reassuring' : 'Needs examination' }
            ],
            table: {
                title: 'TSH Reference Ranges',
                columns: ['Situation', 'Target TSH (mIU/L)'],
                rows: [
                    ['General adult population', '0.4 - 4.5'],
                    ['Trying to conceive', 'Below 2.5'],
                    ['First trimester of pregnancy', '0.1 - 2.5'],
                    ['Second / third trimester', '0.2 - 3.0'],
                    ['On treatment, being monitored', '0.5 - 2.5']
                ]
            },
            recommendations: recs,
            sheet: (tsh !== null && tsh > 0 ? 'TSH ' + tsh + ' - ' : 'Symptoms H' + hypo + '/T' + hyper + ' - ') + headline
        }
    }
}

// ============================================================================
export const TOOL_DEFS = [
    heavyPeriod, anaemia, endo, teen, pms, thyroid,
    menopause, cervical, contraception,
    antenatal, pregWeight, gdm, postnatal
]

export const TOOL_MAP = TOOL_DEFS.reduce((m, t) => { m[t.id] = t; return m }, {})

// ----------------------------------------------------------------------------
// The six original hand-built tools. Listed here only so the tools page can
// render one consistent catalogue; their logic still lives in tools.js and they
// are opened with selectTool() rather than htOpen().
// ----------------------------------------------------------------------------
export const LEGACY_TOOLS = [
    { id: 'pcos', legacy: true, name: 'PCOS Risk Screener', short: 'PCOS Screener', icon: 'fa-venus', tone: 'rose', tagline: 'Rotterdam-criteria screening', blurb: '10 questions covering cycles, skin, hair and weight to estimate your risk of polycystic ovary syndrome.', cta: 'Start Screening', keywords: 'pcos test online, polycystic ovary symptoms' },
    { id: 'period', legacy: true, name: 'Period & Ovulation Tracker', short: 'Period Tracker', icon: 'fa-calendar-days', tone: 'purple', tagline: 'Know your fertile window', blurb: 'Find your next period, ovulation day and fertile window, with a phase-by-phase breakdown of your cycle.', cta: 'Track My Cycle', keywords: 'ovulation calculator, period date calculator' },
    { id: 'duedate', legacy: true, name: 'Due Date Calculator', short: 'Due Date Calculator', icon: 'fa-baby-carriage', tone: 'teal', tagline: 'Your pregnancy timeline', blurb: 'Calculate your estimated due date, current week, trimester and the milestones ahead of you.', cta: 'Calculate My EDD', keywords: 'due date calculator, pregnancy week calculator' },
    { id: 'fertility', legacy: true, name: 'Fertility Score', short: 'Fertility Score', icon: 'fa-seedling', tone: 'emerald', tagline: 'Lifestyle plus lab values', blurb: 'A comprehensive fertility wellness score combining age, cycles, lifestyle and hormone results such as AMH and FSH.', cta: 'Get My Score', keywords: 'fertility test, AMH level meaning' },
    { id: 'bmi', legacy: true, name: 'BMI & PCOS Weight Risk', short: 'BMI Calculator', icon: 'fa-weight-scale', tone: 'amber', tagline: 'Asia-Pacific BMI cut-offs', blurb: 'BMI using the Asian thresholds that actually apply to Indian women, with PCOS-specific metabolic risk scoring.', cta: 'Check My BMI', keywords: 'bmi calculator for indian women, waist circumference risk' },
    { id: 'dietplan', legacy: true, name: 'Personalised Diet Plans', short: 'Diet Plans', icon: 'fa-utensils', tone: 'orange', tagline: 'PCOS, pregnancy, postnatal, weight loss', blurb: 'Get a diet plan matched to your BMI, diabetic status and food preference, delivered on WhatsApp.', cta: 'Get My Plan', keywords: 'pcos diet chart india, pregnancy diet plan' }
]

export const CATALOGUE = [...TOOL_DEFS, ...LEGACY_TOOLS]
export const CATALOGUE_MAP = CATALOGUE.reduce((m, t) => { m[t.id] = t; return m }, {})

// Grouping for the tools page
export const TOOL_GROUPS = [
    {
        id: 'cycle', label: 'Periods & Cycle', icon: 'fa-calendar-check',
        desc: 'Bleeding, pain, PMS and everything that runs on a monthly clock.',
        ids: ['heavy-period', 'period-pain', 'pcos', 'period', 'pms', 'teen-period']
    },
    {
        id: 'pregnancy', label: 'Pregnancy & After', icon: 'fa-baby',
        desc: 'From your first missed period through to the fourth trimester.',
        ids: ['duedate', 'antenatal', 'preg-weight', 'gdm', 'postnatal-mood']
    },
    {
        id: 'prevention', label: 'Screening & Planning', icon: 'fa-shield-heart',
        desc: 'The checks that prevent problems rather than react to them.',
        ids: ['cervical', 'contraception', 'fertility', 'menopause']
    },
    {
        id: 'wellness', label: 'Body & Wellness', icon: 'fa-heart-pulse',
        desc: 'The conditions that quietly underlie fatigue, weight and cycle changes.',
        ids: ['anaemia', 'thyroid', 'bmi', 'dietplan']
    }
]
