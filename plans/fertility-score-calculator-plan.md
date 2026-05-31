# Fertility Score Calculator – Implementation Plan

Add a **Basic** and **Advanced** Fertility Score Calculator to the Dr. Deepika Singh website, with a blinking CTA button on the homepage, full form submission to Google Sheets, and a downloadable PDF report for the patient.

---

## User Review Required

> [!IMPORTANT]
> **Medical Disclaimer**: The calculator produces an **indicative fertility wellness score** for educational/screening purposes only, not a clinical diagnosis. A prominent disclaimer will be displayed on the page and in the PDF report, encouraging users to consult Dr. Deepika Singh for a comprehensive evaluation.

> [!IMPORTANT]
> **Google Sheet**: The form data (name, phone, all answers) will be saved to a **new sheet tab called "Fertility Score"** in the same Google Spreadsheet used by the other forms. The score result and assessment tier will also be stored so the clinic can review submissions.

> [!WARNING]
> **PDF Report**: The patient gets a downloadable PDF with their score, breakdown, recommendations, and **full clinic details** so they can contact and book an appointment. A **separate copy of all data** is also saved to Google Sheets for the clinic's records.

---

## Netlify Free Tier Compatibility

> [!IMPORTANT]
> All design choices are made to stay within Netlify free tier limits:
> - **PDF generation is 100% client-side** using `html2pdf.js` CDN — **zero serverless function calls** for PDF
> - The only serverless call is the same `/api/submit-form` endpoint already used by other forms — **1 function call per form submission**
> - `html2pdf.js` is loaded via CDN (`cdnjs.cloudflare.com`) — **no extra npm dependencies**, no increased bundle size
> - The new page is a static HTML file — **no extra build cost**
> - CSP header in `netlify.toml` already allows `cdnjs.cloudflare.com` for styles/fonts, will add it to `script-src` as well

---

## PDF Report – Full Clinic Details

The downloadable PDF report will include **Dr. Deepika Singh's complete clinic information** so patients can easily contact and book:

### PDF Layout (A4 Portrait)
```
┌──────────────────────────────────────────────┐
│  🏥 [Clinic Logo]                            │
│  Dr. Deepika Singh                           │
│  Senior Consultant Gynecologist & Obstetrician│
│  MD (AIIMS), FCLS, MCCOG                     │
│  ─────────────────────────────────────────    │
│                                              │
│  FERTILITY WELLNESS REPORT                   │
│  Patient: [Name]                             │
│  Date: [Assessment Date]                     │
│  Mode: Basic / Advanced                      │
│                                              │
│  ╔══════════════════════════════════════════╗ │
│  ║  YOUR FERTILITY SCORE: 78 / 100         ║ │
│  ║  Assessment: GOOD ●                     ║ │
│  ╚══════════════════════════════════════════╝ │
│                                              │
│  📊 PARAMETER BREAKDOWN                      │
│  ┌──────────────────┬───────┬──────────────┐ │
│  │ Parameter        │ Score │ Status       │ │
│  ├──────────────────┼───────┼──────────────┤ │
│  │ Age              │ 85    │ ● Good       │ │
│  │ Menstrual Cycle  │ 100   │ ● Excellent  │ │
│  │ BMI              │ 70    │ ● Fair       │ │
│  │ ...              │ ...   │ ...          │ │
│  └──────────────────┴───────┴──────────────┘ │
│                                              │
│  💡 PERSONALIZED RECOMMENDATIONS             │
│  • [Based on weak parameters]                │
│  • [Specific actionable advice]              │
│                                              │
│  ─────────────────────────────────────────    │
│  📋 BOOK A CONSULTATION                      │
│                                              │
│  Dr. Deepika Singh                           │
│  Senior Consultant Gynecologist              │
│  MD (Gynecology & Obstetrics) – AIIMS Delhi  │
│  FCLS | MCCOG | FOGSI | IFS | RCOG Member   │
│                                              │
│  📍 F-11, South Extension Part 1,            │
│     New Delhi – 110049                       │
│  📞 +91 85959 54095                          │
│  💬 WhatsApp: wa.me/918595954095             │
│  📧 drdipikasingh2026@gmail.com              │
│  🌐 drdeepikagyno.in                         │
│  🕐 Mon–Sat: 10 AM – 8 PM                   │
│     Sunday: 10 AM – 6 PM                     │
│                                              │
│  ─────────────────────────────────────────    │
│  ⚠️ DISCLAIMER                               │
│  This is an indicative wellness score for    │
│  educational purposes only. It is NOT a      │
│  medical diagnosis. Please consult           │
│  Dr. Deepika Singh for a comprehensive       │
│  fertility evaluation.                       │
│                                              │
│  © 2026 Dr. Deepika Singh. All rights        │
│  reserved.                                   │
└──────────────────────────────────────────────┘
```

### Clinic Details Used on PDF
Extracted from the live website at **drdeepikagyno.in**:

| Detail | Value |
|--------|-------|
| **Doctor** | Dr. Deepika Singh |
| **Title** | Senior Consultant Gynecologist & Obstetrician |
| **Qualifications** | MD (Gynecology & Obstetrics) – AIIMS New Delhi |
| **Certifications** | FCLS, MCCOG |
| **Memberships** | FOGSI, AOGD, IFS, RCOG |
| **Clinic Address** | F-11, South Extension Part 1, New Delhi – 110049 |
| **Phone** | +91 85959 54095 |
| **WhatsApp** | wa.me/918595954095 |
| **Email** | drdipikasingh2026@gmail.com |
| **Website** | drdeepikagyno.in |
| **Hours** | Mon–Sat: 10 AM – 8 PM, Sunday: 10 AM – 6 PM |
| **Logo** | `/assets/NewCroppedLogo.jpg` (embedded as base64 in PDF) |

---

## Scoring Methodology

### Basic Mode (No Lab Reports)
For users who don't have medical reports. Uses lifestyle, demographic, and symptom-based data. Scientifically weighted based on published reproductive medicine evidence.

| # | Parameter | Input Type | Weight | Scoring Logic |
|---|-----------|-----------|--------|---------------|
| 1 | **Age** | Number (18–55) | **30%** | 18–25: 100, 26–30: 95, 31–34: 85, 35–37: 65, 38–40: 45, 41–43: 25, 44+: 10 |
| 2 | **Menstrual Regularity** | Dropdown | **20%** | Regular (26–35 days): 100, Slightly irregular: 60, Very irregular/absent: 20 |
| 3 | **Period Pain Level** | Dropdown | **5%** | None/Mild: 100, Moderate: 70, Severe (needs medication): 40 |
| 4 | **BMI** (auto-calculated from height/weight) | Number | **10%** | 18.5–24.9: 100, 25–29.9: 70, 30+: 40, <18.5: 50 |
| 5 | **Diagnosed Conditions** | Multi-select checkboxes | **15%** | None: 100, PCOS/PCOD: 50, Thyroid: 60, Endometriosis: 40, Fibroids: 55, Multiple conditions: penalty stacking |
| 6 | **Lifestyle – Smoking** | Dropdown | **5%** | Never: 100, Quit >1yr ago: 80, Current: 30 |
| 7 | **Lifestyle – Stress Level** | Dropdown | **5%** | Low: 100, Moderate: 70, High: 40 |
| 8 | **Previous Pregnancies** | Dropdown | **5%** | Yes (successful): 100, Yes (with complications): 70, Trying >1yr: 30, Never tried: 80 |
| 9 | **Family History of Fertility Issues** | Yes/No | **5%** | No: 100, Yes: 50 |

**Basic Score** = Σ (parameter_score × weight) → 0–100 scale

### Advanced Mode (With Lab Reports)
Adds clinical markers on top of the basic assessment. Each lab value is **optional** — if provided, it adjusts the score with higher accuracy by dynamically redistributing weights.

| # | Additional Parameter | Input Type | Weight Boost | Scoring Logic |
|---|---------------------|-----------|--------------|---------------|
| 1 | **AMH Level** (ng/mL) | Number (optional) | **+15%** | >3.0: 100, 1.5–3.0: 80, 1.0–1.5: 55, 0.5–1.0: 30, <0.5: 10 |
| 2 | **FSH Level** (mIU/mL, Day 2–5) | Number (optional) | **+10%** | <8: 100, 8–10: 75, 10–15: 45, >15: 15 |
| 3 | **LH Level** (mIU/mL) | Number (optional) | **+5%** | Normal (2–15): 100, Elevated (>15): 50 |
| 4 | **TSH Level** (mIU/L) | Number (optional) | **+5%** | 0.5–2.5: 100, 2.5–4.5: 70, >4.5 or <0.5: 30 |
| 5 | **Prolactin** (ng/mL) | Number (optional) | **+3%** | <25: 100, 25–50: 60, >50: 20 |
| 6 | **AFC** (Antral Follicle Count) | Number (optional) | **+7%** | >15: 100, 10–15: 80, 5–10: 50, <5: 15 |
| 7 | **Vitamin D** (ng/mL) | Number (optional) | **+3%** | >30: 100, 20–30: 70, <20: 40 |
| 8 | **Hemoglobin** (g/dL) | Number (optional) | **+2%** | >12: 100, 10–12: 65, <10: 30 |

**Advanced Score** = Re-normalized weighted average including provided lab values. Weights are dynamically redistributed based on which lab values are filled in.

### Score Tiers & Result Display

| Score Range | Tier | Color | Message |
|------------|------|-------|---------|
| 85–100 | Excellent | 🟢 Green | Fertility indicators look strong. Maintain a healthy lifestyle. |
| 70–84 | Good | 🟢 Light Green | Generally favorable. Minor areas to optimize. |
| 50–69 | Moderate | 🟡 Amber | Some factors may need attention. A consultation is recommended. |
| 30–49 | Below Average | 🟠 Orange | Multiple risk factors detected. Professional evaluation strongly recommended. |
| 0–29 | Needs Attention | 🔴 Red | Significant concerns. Please schedule a consultation soon. |

---

## Proposed Changes

### 1. New Page: `fertility-score.html`

#### [NEW] `fertility-score.html`

A dedicated full-page fertility score calculator with:

- **Same nav/footer** as other pages (copied from index.html template)
- **Hero Banner**: "Know Your Fertility Score" with soft gradient background, icon, subtitle
- **Mode Toggle**: Basic ↔ Advanced toggle (pill switch UI)
- **Multi-Step Form** (wizard style with progress bar):
  - **Step 1**: Name* + Phone* (required, same validation as quick appointment)
  - **Step 2**: Basic Questions (age, menstrual cycle, height/weight for BMI, conditions, lifestyle)
  - **Step 3** (Advanced only): Lab Values (all optional, with info tooltips explaining each)
  - **Step 4**: Results page with animated score gauge, tier breakdown, parameter-by-parameter analysis, personalized recommendations
- **Download PDF Button**: Generates a branded PDF client-side with:
  - Clinic logo (embedded as base64) & doctor name
  - Full qualifications & credentials
  - Patient name + date of assessment
  - Score with tier and color
  - Parameter-by-parameter breakdown table
  - Personalized recommendations based on weak areas
  - Full clinic contact details (address, phone, WhatsApp, email, website, hours)
  - Medical disclaimer
  - "Book a Consultation" CTA
- **Book Consultation CTA**: Direct link to contact page / phone number

---

### 2. Homepage CTA Button

#### [MODIFY] `index.html`

Add a **blinking, highlighted CTA button** in the hero section (after the "Call Now" and "WhatsApp" buttons):

A custom `animate-pulse-glow` CSS animation will create a subtle, calming pulsing glow (not aggressive blinking).

Also add:
- Link in the **navigation menu** (both desktop dropdown and mobile menu)
- Link in the **footer Quick Links** section

---

### 3. CSS Animations

#### [MODIFY] `src/style.css`

Add:
- `@keyframes pulse-glow` – Subtle glowing pulse for the CTA button
- Fertility score gauge animation styles (circular progress ring)
- Step wizard progress bar styles
- Score tier color utilities

---

### 4. Fertility Calculator JavaScript

#### [NEW] `src/fertility-score.js`

A dedicated Alpine.js data component (`fertilityData`) containing:
- All form state (basic fields, advanced lab fields)
- Scoring engine with the weighted algorithm
- Dynamic weight redistribution for advanced mode
- Step navigation logic
- Form validation (name + phone required, same rules as quick appointment)
- Score calculation and tier determination
- Recommendation generation based on weak parameters
- **Client-side PDF generation** using `html2pdf.js` (loaded via CDN, zero serverless cost)
- Google Sheet submission via the existing `/api/submit-form` endpoint (1 function call)

---

### 5. Backend: Google Sheet Submission

#### [MODIFY] `netlify/functions/submit-form.js`

Add a new form type `fertility_score` with:
- Validation for name + phone (required)
- All other fields optional
- New sheet tab: **"Fertility Score"**
- Headers: `Name | Phone Number | Mode | Age | BMI | Menstrual Regularity | Period Pain | Conditions | Smoking | Stress | Pregnancy History | Family History | AMH | FSH | LH | TSH | Prolactin | AFC | Vitamin D | Hemoglobin | Score | Tier | Submitted At`

---

### 6. Vite Build Config

#### [MODIFY] `vite.config.js`

Add `fertility-score.html` to the Rollup input entries.

---

### 7. Tailwind Config

#### [MODIFY] `tailwind.config.js`

Add the `animate-pulse-glow` keyframe and animation to the theme extend.

---

### 8. Netlify Config (CSP Update)

#### [MODIFY] `netlify.toml`

Update the Content-Security-Policy `script-src` directive to allow the `html2pdf.js` CDN script from `cdnjs.cloudflare.com` (already allowed for styles/fonts, just need to add to `script-src`).

---

## File Summary

| File | Action | Description |
|------|--------|-------------|
| `fertility-score.html` | **NEW** | Full calculator page with multi-step form, results, PDF download |
| `src/fertility-score.js` | **NEW** | Alpine.js logic: scoring engine, form, PDF, sheet submission |
| `index.html` | **MODIFY** | Add blinking CTA button + nav link + footer link |
| `src/style.css` | **MODIFY** | Add pulse-glow animation + score gauge styles |
| `netlify/functions/submit-form.js` | **MODIFY** | Add `fertility_score` type + sheet handling |
| `vite.config.js` | **MODIFY** | Add new HTML entry |
| `tailwind.config.js` | **MODIFY** | Add custom animation keyframes |
| `netlify.toml` | **MODIFY** | Update CSP script-src for html2pdf.js CDN |

---

## Verification Plan

### Automated Tests
1. **Build verification**: Run `npm run build` to ensure no build errors with the new files
2. **Local dev test**: Run `npm run dev` and navigate to `/fertility-score.html`
3. **Form submission test**: Submit a test form and verify data appears in the mock response
4. **PDF download test**: Verify the PDF generates correctly with clinic details

### Manual Verification
1. **Visual check**: Verify the blinking CTA button on the homepage looks calm and premium
2. **Mobile responsiveness**: Check all form steps render correctly on mobile
3. **Score accuracy**: Test edge cases (all perfect scores = 100, all worst = low score)
4. **PDF quality**: Open downloaded PDF and verify:
   - Clinic logo renders correctly
   - All clinic contact details are present (address, phone, WhatsApp, email, website, hours)
   - Doctor credentials displayed correctly
   - Score and recommendations are accurate
   - Disclaimer is visible
5. **Google Sheet**: After deploying, verify data reaches the "Fertility Score" sheet tab
6. **Navigation**: Verify the fertility score page is accessible from nav menu, homepage CTA, and footer
7. **Netlify free tier**: Confirm no extra serverless function usage beyond the single form submission call
