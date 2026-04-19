# SEO Master Plan - Dr. Deepika Singh Website
# Complete Implementation Guide with Exact Values

**Date:** 2026-04-19
**GA4 ID:** G-V1126Z4EPD
**Domain:** https://drdeepikagyno.com
**Clinic Address:** F-11, South Extension Part 1, New Delhi - 110049
**Phone:** +91 85959 54095
**Email:** drdipikasingh2026@gmail.com
**Coordinates:** lat 28.5781, lng 77.2228

---

## TABLE OF CONTENTS

1. [Phase 1: Critical On-Page SEO Fixes](#phase-1)
2. [Phase 2: FAQ Section + Schema](#phase-2)
3. [Phase 3: Blog System](#phase-3)
4. [Phase 4: Location Pages](#phase-4)
5. [Phase 5: Config Updates](#phase-5)

---

## EXISTING FILE INVENTORY

| File | Purpose | Lines |
|------|---------|-------|
| `index.html` | Homepage | 1215 |
| `about.html` | Doctor profile | 677 |
| `services.html` | Services list | 407 |
| `contact.html` | Booking + contact | 710 |
| `testimonials.html` | Patient reviews | 441 |
| `src/main.js` | Alpine.js app logic | 432 |
| `src/style.css` | Tailwind styles | - |
| `vite.config.js` | Build config | 21 |
| `tailwind.config.js` | Tailwind config | 22 |
| `netlify.toml` | Netlify deploy config | 73 |
| `public/sitemap.xml` | XML sitemap | 33 |
| `public/robots.txt` | Crawler rules | 10 |
| `package.json` | Dependencies | 25 |

**Tech stack:** Vite + Tailwind CSS + Alpine.js, deployed on Netlify, static HTML (multi-page, no SPA).

---

<a id="phase-1"></a>
## PHASE 1: CRITICAL ON-PAGE SEO FIXES

### 1.1 — Fix H1 Tags on All Pages

The H1 tag is the most important on-page SEO element. Currently all H1s are generic with zero keywords.

#### index.html (line 259-262)

**FIND this exact code:**
```html
<h1 id="hero-heading"
    class="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-slate-900 leading-[1.1] tracking-tight">
    Compassionate Care for <br /> <span class="text-gradient">Every Woman</span>
</h1>
```

**REPLACE with:**
```html
<h1 id="hero-heading"
    class="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-slate-900 leading-[1.1] tracking-tight">
    Best Gynecologist in South Delhi <br /> <span class="text-gradient">Dr. Deepika Singh</span>
</h1>
```

#### about.html (line 179-182)

**FIND:**
```html
<h1 id="about-heading"
    class="text-3xl sm:text-4xl md:text-6xl font-display font-bold text-slate-900 mb-6">Meet
    <span class="text-gradient">Dr. Deepika</span>
</h1>
```

**REPLACE with:**
```html
<h1 id="about-heading"
    class="text-3xl sm:text-4xl md:text-6xl font-display font-bold text-slate-900 mb-6">About
    <span class="text-gradient">Dr. Deepika Singh</span> – Top Gynecologist in South Delhi
</h1>
```

#### services.html (line 188-190)

**FIND:**
```html
<h1 id="services-heading"
    class="text-3xl sm:text-4xl md:text-6xl font-display font-bold text-slate-900 mb-6">
    Our Services</h1>
```

**REPLACE with:**
```html
<h1 id="services-heading"
    class="text-3xl sm:text-4xl md:text-6xl font-display font-bold text-slate-900 mb-6">
    Gynecology Services in South Delhi & Delhi NCR</h1>
```

#### contact.html (line 180-182)

**FIND:**
```html
<h1 id="contact-heading"
    class="text-3xl sm:text-4xl md:text-6xl font-display font-bold text-slate-900 mb-6">
    Book Your Appointment</h1>
```

**REPLACE with:**
```html
<h1 id="contact-heading"
    class="text-3xl sm:text-4xl md:text-6xl font-display font-bold text-slate-900 mb-6">
    Book Appointment – Gynecologist in South Delhi</h1>
```

#### testimonials.html (line 184-186)

**FIND:**
```html
<h1 id="testimonials-heading"
    class="text-3xl sm:text-4xl md:text-6xl font-display font-bold text-slate-900 mb-6">Real
    Experiences</h1>
```

**REPLACE with:**
```html
<h1 id="testimonials-heading"
    class="text-3xl sm:text-4xl md:text-6xl font-display font-bold text-slate-900 mb-6">Patient
    Reviews – Dr. Deepika Singh, Gynecologist South Delhi</h1>
```

---

### 1.2 — Fix Meta Titles & Descriptions on All Pages

#### index.html (lines 10-14)

**FIND:**
```html
<title>Dr. Deepika Singh | Best Gynecologist in South Delhi | MD AIIMS</title>
<meta name="description"
    content="Dr. Deepika Singh is a renowned gynecologist with 15+ years experience at AIIMS New Delhi. Specializing in women's health, laparoscopic surgery, and comprehensive gynaecological care. Book appointment today.">
<meta name="keywords"
    content="gynecologist, women's health, PCOS, laparoscopic surgery, hysteroscopic surgery, Dr. Deepika Singh, best gynecologist Delhi, AIIMS gynecologist, MD gynecology">
```

**REPLACE with:**
```html
<title>Dr. Deepika Singh | Best Gynecologist in South Delhi, Noida & Delhi NCR | MD AIIMS</title>
<meta name="description"
    content="Dr. Deepika Singh – Best Gynecologist in South Delhi (South Extension). MD AIIMS, 15+ years experience. Expert in PCOS, laparoscopic surgery, menopause care & cancer screening. Serving South Delhi, Noida, Ghaziabad & Delhi NCR. Book appointment: +91 85959 54095.">
<meta name="keywords"
    content="best gynecologist in south delhi, gynecologist near me, best gynecologist in delhi, gynecologist in noida, gynecologist in ghaziabad, gynecologist south extension, Dr. Deepika Singh, AIIMS gynecologist, PCOS treatment delhi, laparoscopic surgery south delhi, women's health delhi, gynaecologist near defence colony, gynecologist lajpat nagar, gynecologist greater kailash, MD gynecology AIIMS, best gyno doctor in delhi">
```

Also update the OG tags on index.html (lines 22-24):
```html
<meta property="og:title" content="Dr. Deepika Singh | Best Gynecologist in South Delhi & Delhi NCR">
<meta property="og:description"
    content="Best Gynecologist in South Delhi. MD AIIMS, 15+ years experience. PCOS, laparoscopic surgery, menopause care. Book: +91 85959 54095.">
```

#### about.html (lines 10-14)

**FIND:**
```html
<title>About Dr. Deepika Singh | MD Gynecologist AIIMS | 15+ Years Experience</title>
<meta name="description"
    content="Learn about Dr. Deepika Singh, MD (Gynecology & Obstetrics) from AIIMS New Delhi with 15+ years experience. Expert in high-risk pregnancy, laparoscopic surgery, infertility treatment at Sarvodaya Hospital Greater Noida.">
<meta name="keywords"
    content="Dr. Deepika Singh, gynecologist, obstetrician, MD AIIMS, high risk pregnancy, laparoscopic surgery, infertility treatment, women's health, pregnancy specialist, FOGSI member">
```

**REPLACE with:**
```html
<title>Dr. Deepika Singh | MD AIIMS Gynecologist South Delhi | 15+ Years Experience</title>
<meta name="description"
    content="Dr. Deepika Singh – MD (Gynecology) from AIIMS New Delhi, FCLS certified. 15+ years experience at AIIMS, Max, Apollo Cradle. Best gynecologist in South Delhi, South Extension. Expert in laparoscopic surgery, PCOS, infertility. Book consultation today.">
<meta name="keywords"
    content="Dr. Deepika Singh gynecologist, AIIMS gynecologist delhi, best gynaecologist south delhi, gynecologist south extension, MD gynecology AIIMS, laparoscopic surgeon delhi, FCLS certified gynecologist, women's doctor south delhi, gynecologist near me delhi">
```

#### services.html (lines 10-14)

**FIND:**
```html
<title>Our Services | Dr. Deepika Singh - Gynecologist & Obstetrician</title>
<meta name="description"
    content="Comprehensive women's healthcare services including pregnancy care, gynecological surgeries, infertility treatment, PCOS management, menopause care, and cancer screening by Dr. Deepika Singh.">
<meta name="keywords"
    content="pregnancy care, gynecological surgery, infertility treatment, PCOS, menopause, cancer screening, women's health, Dr. Deepika Singh">
```

**REPLACE with:**
```html
<title>Gynecology Services in South Delhi | PCOS, Laparoscopy, Menopause | Dr. Deepika Singh</title>
<meta name="description"
    content="Expert gynecology services in South Delhi by Dr. Deepika Singh (MD AIIMS): PCOS treatment, laparoscopic surgery, menopause care, cancer screening, infertility treatment. Clinic at South Extension Part 1. Call +91 85959 54095.">
<meta name="keywords"
    content="gynecology services south delhi, PCOS treatment delhi, laparoscopic surgery south delhi, menopause treatment delhi, cancer screening gynecologist delhi, infertility treatment south delhi, hysteroscopy delhi, women's health services delhi NCR, gynecologist services near me">
```

#### contact.html (lines 10-14)

**FIND:**
```html
<title>Contact Us | Book Appointment - Dr. Deepika Singh</title>
<meta name="description"
    content="Book an appointment with Dr. Deepika Singh for expert gynecological care. Contact us for consultations, pregnancy care, and women's health services.">
<meta name="keywords"
    content="book appointment, contact Dr. Deepika Singh, gynecologist appointment, women's health consultation">
```

**REPLACE with:**
```html
<title>Book Appointment | Dr. Deepika Singh – Gynecologist South Extension, South Delhi</title>
<meta name="description"
    content="Book appointment with Dr. Deepika Singh, best gynecologist in South Delhi. Clinic at F-11, South Extension Part 1, New Delhi. Call +91 85959 54095. Open Mon-Sun 10AM-8PM. Serving South Delhi, Noida, Ghaziabad.">
<meta name="keywords"
    content="book gynecologist appointment south delhi, gynecologist south extension, Dr. Deepika Singh contact, gynecologist appointment delhi, women's clinic south delhi, gynecologist near me appointment, gynecologist phone number delhi">
```

#### testimonials.html (lines 10-14)

**FIND:**
```html
<title>Patient Testimonials | Dr. Deepika Singh - Gynecologist & Obstetrician</title>
<meta name="description"
    content="Read real patient stories and testimonials about Dr. Deepika Singh's compassionate gynecological care. Hear from women who trusted us with their health.">
<meta name="keywords"
    content="patient testimonials, reviews, Dr. Deepika Singh, gynecologist reviews, women's health testimonials">
```

**REPLACE with:**
```html
<title>Patient Reviews | Dr. Deepika Singh – Best Gynecologist South Delhi | 4.9 Rating</title>
<meta name="description"
    content="Read real patient reviews of Dr. Deepika Singh, top-rated gynecologist in South Delhi. 4.9 Google rating, 20,000+ patients treated. See why women trust Dr. Deepika for gynecological care in Delhi NCR.">
<meta name="keywords"
    content="Dr. Deepika Singh reviews, best gynecologist south delhi reviews, patient testimonials gynecologist delhi, women's health reviews delhi, top rated gynecologist delhi, gynecologist patient feedback">
```

---

### 1.3 — Enhanced JSON-LD Schema on Homepage

#### index.html — Replace the entire JSON-LD block (lines 45-143)

**FIND the entire `<script type="application/ld+json">` block (lines 45-143) and REPLACE with:**

```html
<!-- Structured Data - JSON-LD (MedicalBusiness) -->
<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    "name": "Dr. Deepika Singh - Best Gynecologist in South Delhi",
    "description": "Dr. Deepika Singh is a renowned gynecologist with 15+ years experience at AIIMS New Delhi. Best gynecologist in South Delhi specializing in PCOS treatment, laparoscopic surgery, menopause care, and cancer screening at South Extension Part 1.",
    "url": "https://drdeepikagyno.com",
    "logo": "https://drdeepikagyno.com/assets/NewCroppedLogo.jpg",
    "image": "https://drdeepikagyno.com/assets/DrdeepikaNew.jpg",
    "telephone": "+918595954095",
    "email": "drdipikasingh2026@gmail.com",
    "address": {
        "@type": "PostalAddress",
        "streetAddress": "F-11, South Extension Part 1",
        "addressLocality": "New Delhi",
        "addressRegion": "Delhi",
        "postalCode": "110049",
        "addressCountry": "IN"
    },
    "geo": {
        "@type": "GeoCoordinates",
        "latitude": 28.5781,
        "longitude": 77.2228
    },
    "hasMap": "https://www.google.com/maps?q=28.5781,77.2228",
    "openingHoursSpecification": [
        {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            "opens": "10:00",
            "closes": "20:00"
        },
        {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": "Saturday",
            "opens": "10:00",
            "closes": "20:00"
        },
        {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": "Sunday",
            "opens": "10:00",
            "closes": "18:00"
        }
    ],
    "priceRange": "$$",
    "medicalSpecialty": ["Gynecology", "Obstetrics"],
    "areaServed": [
        { "@type": "City", "name": "New Delhi", "sameAs": "https://en.wikipedia.org/wiki/New_Delhi" },
        { "@type": "Place", "name": "South Delhi" },
        { "@type": "Place", "name": "South Extension" },
        { "@type": "Place", "name": "Greater Kailash" },
        { "@type": "Place", "name": "Defence Colony" },
        { "@type": "Place", "name": "Lajpat Nagar" },
        { "@type": "Place", "name": "Saket" },
        { "@type": "Place", "name": "Green Park" },
        { "@type": "Place", "name": "Hauz Khas" },
        { "@type": "Place", "name": "Malviya Nagar" },
        { "@type": "Place", "name": "Nehru Place" },
        { "@type": "Place", "name": "Kalkaji" },
        { "@type": "Place", "name": "CR Park" },
        { "@type": "Place", "name": "Safdarjung" },
        { "@type": "Place", "name": "Vasant Kunj" },
        { "@type": "City", "name": "Noida" },
        { "@type": "City", "name": "Greater Noida" },
        { "@type": "City", "name": "Ghaziabad" },
        { "@type": "City", "name": "Faridabad" },
        { "@type": "City", "name": "Gurugram" }
    ],
    "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "bestRating": "5",
        "ratingCount": "200",
        "reviewCount": "200"
    },
    "availableService": [
        { "@type": "MedicalProcedure", "name": "PCOS/PCOD Treatment", "description": "Comprehensive management of Polycystic Ovary Syndrome including hormonal evaluation, lifestyle counseling, and medication management." },
        { "@type": "MedicalProcedure", "name": "Laparoscopic Surgery", "description": "Minimally invasive keyhole surgery for ovarian cysts, fibroids, endometriosis, and hysterectomy." },
        { "@type": "MedicalProcedure", "name": "Hysteroscopic Surgery", "description": "Advanced hysteroscopic procedures for uterine polyps, fibroids, and septum." },
        { "@type": "MedicalProcedure", "name": "Menopause Care", "description": "Comprehensive menopause management including HRT, bone density screening, and symptom management." },
        { "@type": "MedicalProcedure", "name": "Cancer Screening", "description": "Cervical cancer screening (Pap smear, HPV test), breast examination, and mammography referral." },
        { "@type": "MedicalProcedure", "name": "Infertility Treatment", "description": "Fertility evaluation, ovulation induction, IUI, and IVF consultation." },
        { "@type": "MedicalProcedure", "name": "Pregnancy Care", "description": "Comprehensive antenatal care including high-risk pregnancy management." },
        { "@type": "MedicalProcedure", "name": "Cosmetic Gynecology", "description": "Advanced cosmetic gynecological procedures." }
    ],
    "sameAs": [
        "https://www.instagram.com/dr.deepikasinghgynecologist/",
        "https://www.facebook.com/DrDeepikasingh2/",
        "https://www.youtube.com/@DeepikaSingh1",
        "https://www.linkedin.com/in/deepika-singh-7200412bb/"
    ],
    "founder": {
        "@type": "Physician",
        "name": "Dr. Deepika Singh",
        "image": "https://drdeepikagyno.com/assets/DrdeepikaNew.jpg",
        "jobTitle": "Senior Consultant Gynecologist & Obstetrician",
        "medicalSpecialty": ["Gynecology", "Obstetrics"],
        "alumniOf": [
            { "@type": "CollegeOrUniversity", "name": "AIIMS New Delhi" },
            { "@type": "CollegeOrUniversity", "name": "BRD Medical College, Gorakhpur" }
        ],
        "hasCredential": [
            { "@type": "EducationalOccupationalCredential", "credentialCategory": "degree", "name": "MD (Gynecology & Obstetrics) - AIIMS New Delhi" },
            { "@type": "EducationalOccupationalCredential", "credentialCategory": "degree", "name": "MBBS - BRD Medical College, Gorakhpur" },
            { "@type": "EducationalOccupationalCredential", "credentialCategory": "certificate", "name": "FCLS - Fellow of International College of Laparoscopic Surgeon" },
            { "@type": "EducationalOccupationalCredential", "credentialCategory": "certificate", "name": "MCCOG - Master Course in Cosmetic Gynecology" }
        ],
        "memberOf": [
            { "@type": "Organization", "name": "FOGSI - Federation of Obstetric and Gynecological Societies of India" },
            { "@type": "Organization", "name": "AOGD - Association of Obstetricians and Gynecologists of Delhi" },
            { "@type": "Organization", "name": "IFS - Indian Fertility Society" },
            { "@type": "Organization", "name": "RCOG - Royal College of Obstetricians and Gynaecologists" }
        ],
        "knowsAbout": ["Gynecology", "PCOS Treatment", "Laparoscopic Surgery", "Menopause Care", "Cancer Screening", "Infertility Treatment", "High-Risk Pregnancy", "Cosmetic Gynecology"]
    }
}
</script>
```

---

### 1.4 — Fix NAP Inconsistency

#### contact.html (line 442)

**FIND:**
```html
<div class="font-bold text-primary text-base sm:text-lg leading-tight">
    10,000+</div>
```

**REPLACE with:**
```html
<div class="font-bold text-primary text-base sm:text-lg leading-tight">
    20,000+</div>
```

---

### 1.5 — Add Google Analytics (GA4) to ALL 5 Pages

Add the following code **immediately after the opening `<head>` tag** on each of these files:
- `index.html` (after line 4)
- `about.html` (after line 4)
- `services.html` (after line 4)
- `contact.html` (after line 4)
- `testimonials.html` (after line 4)

**INSERT this code right after `<head>`:**
```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-V1126Z4EPD"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-V1126Z4EPD');
</script>
```

**ALSO add this same GA4 code to ALL new pages created in Phases 3-4.**

---

### 1.6 — Add BreadcrumbList Schema to Inner Pages

Add a **second** `<script type="application/ld+json">` block right after the existing one in each file's `<head>`.

#### about.html — Insert after line 82 (after `</script>`):
```html
<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://drdeepikagyno.com/" },
        { "@type": "ListItem", "position": 2, "name": "About Dr. Deepika Singh", "item": "https://drdeepikagyno.com/about.html" }
    ]
}
</script>
```

#### services.html — Insert after line 91 (after `</script>`):
```html
<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://drdeepikagyno.com/" },
        { "@type": "ListItem", "position": 2, "name": "Gynecology Services", "item": "https://drdeepikagyno.com/services.html" }
    ]
}
</script>
```

#### contact.html — Insert after line 86 (after `</script>`):
```html
<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://drdeepikagyno.com/" },
        { "@type": "ListItem", "position": 2, "name": "Book Appointment", "item": "https://drdeepikagyno.com/contact.html" }
    ]
}
</script>
```

#### testimonials.html — Insert after line 87 (after `</script>`):
```html
<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://drdeepikagyno.com/" },
        { "@type": "ListItem", "position": 2, "name": "Patient Reviews", "item": "https://drdeepikagyno.com/testimonials.html" }
    ]
}
</script>
```

---

### 1.7 — Update Netlify CSP for GA4 + Google Maps

#### netlify.toml (line 73)

**FIND this entire line:**
```
Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; img-src 'self' data:; connect-src 'self' https://drdeepikagyno.com https://cloudflareinsights.com; media-src 'self'; frame-ancestors 'none'"
```

**REPLACE with:**
```
Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static.cloudflareinsights.com https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; img-src 'self' data: https://www.googletagmanager.com https://www.google-analytics.com; connect-src 'self' https://drdeepikagyno.com https://cloudflareinsights.com https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com; media-src 'self'; frame-src https://www.google.com https://maps.google.com; frame-ancestors 'none'"
```

Key changes:
- Added `https://www.googletagmanager.com https://www.google-analytics.com` to `script-src`
- Added `https://www.googletagmanager.com https://www.google-analytics.com` to `img-src`
- Added `https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com` to `connect-src`
- Added `frame-src https://www.google.com https://maps.google.com` (for Google Maps embed)

---

### 1.8 — Fix Image Loading Attributes

On ALL 5 pages, the logo in the navigation has `loading="lazy"` which delays Largest Contentful Paint (LCP). Change to `loading="eager"`.

**FIND on each page (index.html, about.html, services.html, contact.html, testimonials.html):**
```html
<img src="/assets/NewCroppedLogo.jpg" alt="Dr. Deepika Logo"
    class="w-full h-full object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
    loading="lazy">
```

**REPLACE with:**
```html
<img src="/assets/NewCroppedLogo.jpg" alt="Dr. Deepika Singh - Best Gynecologist South Delhi Logo"
    class="w-full h-full object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
    loading="eager">
```

Note: Also improved the `alt` text for SEO.

---

### 1.9 — Add Blog Link to Navigation on ALL Pages

On ALL 5 existing pages AND all new pages, add a "Blog" link to both desktop and mobile menus.

#### Desktop menu — Add after Testimonials link

**FIND (example from about.html line 121-122):**
```html
<a href="/testimonials.html" class="nav-link">Testimonials</a>
<a href="/contact.html" class="nav-link">Contact</a>
```

**REPLACE with:**
```html
<a href="/testimonials.html" class="nav-link">Testimonials</a>
<a href="/blog.html" class="nav-link">Blog</a>
<a href="/contact.html" class="nav-link">Contact</a>
```

#### Mobile menu — Add after Testimonials link

**FIND (example from about.html lines 154-157):**
```html
<a href="/testimonials.html"
    class="block px-3 py-3 rounded-lg text-base font-medium text-slate-600 hover:text-primary hover:bg-slate-50 transition-colors">Testimonials</a>
<a href="/contact.html"
    class="block px-3 py-3 rounded-lg text-base font-medium text-slate-600 hover:text-primary hover:bg-slate-50 transition-colors">Contact</a>
```

**REPLACE with:**
```html
<a href="/testimonials.html"
    class="block px-3 py-3 rounded-lg text-base font-medium text-slate-600 hover:text-primary hover:bg-slate-50 transition-colors">Testimonials</a>
<a href="/blog.html"
    class="block px-3 py-3 rounded-lg text-base font-medium text-slate-600 hover:text-primary hover:bg-slate-50 transition-colors">Blog</a>
<a href="/contact.html"
    class="block px-3 py-3 rounded-lg text-base font-medium text-slate-600 hover:text-primary hover:bg-slate-50 transition-colors">Contact</a>
```

#### index.html special case — Hamburger menu (lines 211-219)

The homepage uses a different hamburger dropdown. Find the block and add Blog link between Testimonials and Contact:

**FIND:**
```html
<a href="/testimonials.html"
    class="block px-4 py-2.5 rounded-lg text-base font-medium text-slate-600 hover:text-primary hover:bg-slate-50 transition-colors">Testimonials</a>
<a href="/contact.html"
    class="block px-4 py-2.5 rounded-lg text-base font-medium text-slate-600 hover:text-primary hover:bg-slate-50 transition-colors">Contact</a>
```

**REPLACE with:**
```html
<a href="/testimonials.html"
    class="block px-4 py-2.5 rounded-lg text-base font-medium text-slate-600 hover:text-primary hover:bg-slate-50 transition-colors">Testimonials</a>
<a href="/blog.html"
    class="block px-4 py-2.5 rounded-lg text-base font-medium text-slate-600 hover:text-primary hover:bg-slate-50 transition-colors">Blog</a>
<a href="/contact.html"
    class="block px-4 py-2.5 rounded-lg text-base font-medium text-slate-600 hover:text-primary hover:bg-slate-50 transition-colors">Contact</a>
```

#### Footer Quick Links — Add Blog to footer on ALL pages

**FIND (footer on each page):**
```html
<li><a href="/services.html" class="hover:text-primary transition-colors">Services</a></li>
<li><a href="/contact.html" class="hover:text-primary transition-colors">Contact</a></li>
```

**REPLACE with:**
```html
<li><a href="/services.html" class="hover:text-primary transition-colors">Services</a></li>
<li><a href="/blog.html" class="hover:text-primary transition-colors">Blog</a></li>
<li><a href="/contact.html" class="hover:text-primary transition-colors">Contact</a></li>
```

#### Also update src/main.js (line 10-16) navItems array:

**FIND:**
```js
navItems: [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about.html' },
    { label: 'Services', href: '/services.html' },
    { label: 'Testimonials', href: '/testimonials.html' },
    { label: 'Contact', href: '/contact.html' }
],
```

**REPLACE with:**
```js
navItems: [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about.html' },
    { label: 'Services', href: '/services.html' },
    { label: 'Testimonials', href: '/testimonials.html' },
    { label: 'Blog', href: '/blog.html' },
    { label: 'Contact', href: '/contact.html' }
],
```

---

<a id="phase-2"></a>
## PHASE 2: FAQ SECTION + SCHEMA

### 2.1 — Add FAQ Section to Homepage

#### index.html — Insert BEFORE the testimonials section (before line 960)

Find this comment:
```html
<!-- Testimonials Section (Moved to Bottom) -->
```

Insert the following FAQ section BEFORE that line:

```html
<!-- FAQ Section -->
<section class="py-12 md:py-24 bg-white relative overflow-hidden" aria-labelledby="faq-heading">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="text-center mb-8 md:mb-16">
            <span class="text-primary font-bold tracking-wider uppercase text-sm mb-2 block">Common Questions</span>
            <h2 id="faq-heading" class="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-slate-900">Frequently Asked Questions</h2>
            <p class="text-slate-600 mt-3 max-w-xl mx-auto">Everything you need to know about gynecological care at our South Delhi clinic.</p>
        </div>

        <div class="space-y-4" x-data="{ openFaq: null }">
            <!-- FAQ 1 -->
            <div class="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                <button @click="openFaq = openFaq === 1 ? null : 1" class="w-full px-6 py-5 text-left flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                    <h3 class="font-bold text-slate-900 text-base md:text-lg">Who is the best gynecologist in South Delhi?</h3>
                    <i class="fa-solid fa-chevron-down text-primary transition-transform duration-300 shrink-0" :class="{'rotate-180': openFaq === 1}"></i>
                </button>
                <div x-show="openFaq === 1" x-transition:enter="transition ease-out duration-200" x-transition:enter-start="opacity-0 -translate-y-2" x-transition:enter-end="opacity-100 translate-y-0" class="px-6 pb-5">
                    <p class="text-slate-600 leading-relaxed">Dr. Deepika Singh is widely regarded as one of the best gynecologists in South Delhi. With an MD from AIIMS New Delhi, FCLS certification in laparoscopic surgery, and over 15 years of clinical experience at prestigious institutions including AIIMS, Max Super Speciality Hospital (Saket), Apollo Cradle, and Moolchand Hospital, she provides comprehensive women's healthcare at her clinic in South Extension Part 1, New Delhi. She specializes in PCOS management, laparoscopic surgery, menopause care, cancer screening, and infertility treatment.</p>
                </div>
            </div>

            <!-- FAQ 2 -->
            <div class="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                <button @click="openFaq = openFaq === 2 ? null : 2" class="w-full px-6 py-5 text-left flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                    <h3 class="font-bold text-slate-900 text-base md:text-lg">Where is Dr. Deepika Singh's clinic located?</h3>
                    <i class="fa-solid fa-chevron-down text-primary transition-transform duration-300 shrink-0" :class="{'rotate-180': openFaq === 2}"></i>
                </button>
                <div x-show="openFaq === 2" x-transition:enter="transition ease-out duration-200" x-transition:enter-start="opacity-0 -translate-y-2" x-transition:enter-end="opacity-100 translate-y-0" class="px-6 pb-5">
                    <p class="text-slate-600 leading-relaxed">Dr. Deepika Singh's clinic is located at <strong>F-11, South Extension Part 1, New Delhi - 110049</strong>. It is easily accessible from nearby areas including Defence Colony, Greater Kailash (GK 1 & GK 2), Lajpat Nagar, Saket, Green Park, Hauz Khas, Malviya Nagar, Nehru Place, Kalkaji, and CR Park. The clinic is open Monday to Saturday (10:00 AM - 8:00 PM) and Sunday (10:00 AM - 6:00 PM). You can book an appointment by calling <a href="tel:+918595954095" class="text-primary font-semibold hover:underline">+91 85959 54095</a> or via <a href="https://wa.me/918595954095" target="_blank" rel="noopener noreferrer" class="text-green-600 font-semibold hover:underline">WhatsApp</a>.</p>
                </div>
            </div>

            <!-- FAQ 3 -->
            <div class="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                <button @click="openFaq = openFaq === 3 ? null : 3" class="w-full px-6 py-5 text-left flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                    <h3 class="font-bold text-slate-900 text-base md:text-lg">What services does Dr. Deepika Singh offer?</h3>
                    <i class="fa-solid fa-chevron-down text-primary transition-transform duration-300 shrink-0" :class="{'rotate-180': openFaq === 3}"></i>
                </button>
                <div x-show="openFaq === 3" x-transition:enter="transition ease-out duration-200" x-transition:enter-start="opacity-0 -translate-y-2" x-transition:enter-end="opacity-100 translate-y-0" class="px-6 pb-5">
                    <p class="text-slate-600 leading-relaxed">Dr. Deepika Singh offers a comprehensive range of gynecological services at her South Extension clinic:</p>
                    <ul class="text-slate-600 mt-2 space-y-1 ml-4 list-disc">
                        <li><strong>PCOS/PCOD Management</strong> – Hormonal evaluation, lifestyle counseling, and treatment</li>
                        <li><strong>Laparoscopic Surgery</strong> – Minimally invasive surgery for cysts, fibroids, endometriosis</li>
                        <li><strong>Hysteroscopic Surgery</strong> – Uterine polyp and fibroid removal</li>
                        <li><strong>Menopause Care</strong> – HRT, symptom management, and long-term health planning</li>
                        <li><strong>Cancer Screening</strong> – Pap smear, HPV test, breast examination, mammography</li>
                        <li><strong>Infertility Treatment</strong> – Fertility evaluation, IUI support, IVF consultation</li>
                        <li><strong>Pregnancy Care</strong> – Antenatal care including high-risk pregnancy management</li>
                        <li><strong>Cosmetic Gynecology</strong> – Advanced cosmetic procedures (MCCOG certified)</li>
                    </ul>
                </div>
            </div>

            <!-- FAQ 4 -->
            <div class="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                <button @click="openFaq = openFaq === 4 ? null : 4" class="w-full px-6 py-5 text-left flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                    <h3 class="font-bold text-slate-900 text-base md:text-lg">Does Dr. Deepika Singh treat patients from Noida and Ghaziabad?</h3>
                    <i class="fa-solid fa-chevron-down text-primary transition-transform duration-300 shrink-0" :class="{'rotate-180': openFaq === 4}"></i>
                </button>
                <div x-show="openFaq === 4" x-transition:enter="transition ease-out duration-200" x-transition:enter-start="opacity-0 -translate-y-2" x-transition:enter-end="opacity-100 translate-y-0" class="px-6 pb-5">
                    <p class="text-slate-600 leading-relaxed">Yes, Dr. Deepika Singh regularly treats patients from Noida, Greater Noida, Ghaziabad, Faridabad, and the entire Delhi NCR region. Her clinic at South Extension Part 1 is well-connected via DND Flyway (from Noida), NH-24 (from Ghaziabad), and Ring Road. Many patients from these areas choose Dr. Deepika for her AIIMS training, advanced laparoscopic expertise, and compassionate approach to women's healthcare. You can book a consultation by calling +91 85959 54095.</p>
                </div>
            </div>

            <!-- FAQ 5 -->
            <div class="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                <button @click="openFaq = openFaq === 5 ? null : 5" class="w-full px-6 py-5 text-left flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                    <h3 class="font-bold text-slate-900 text-base md:text-lg">How can I book an appointment with Dr. Deepika Singh?</h3>
                    <i class="fa-solid fa-chevron-down text-primary transition-transform duration-300 shrink-0" :class="{'rotate-180': openFaq === 5}"></i>
                </button>
                <div x-show="openFaq === 5" x-transition:enter="transition ease-out duration-200" x-transition:enter-start="opacity-0 -translate-y-2" x-transition:enter-end="opacity-100 translate-y-0" class="px-6 pb-5">
                    <p class="text-slate-600 leading-relaxed">You can book an appointment through multiple channels:</p>
                    <ul class="text-slate-600 mt-2 space-y-1 ml-4 list-disc">
                        <li><strong>Phone:</strong> Call <a href="tel:+918595954095" class="text-primary font-semibold hover:underline">+91 85959 54095</a></li>
                        <li><strong>WhatsApp:</strong> Message on <a href="https://wa.me/918595954095" target="_blank" rel="noopener noreferrer" class="text-green-600 font-semibold hover:underline">WhatsApp</a></li>
                        <li><strong>Online:</strong> Fill the booking form on this website (above)</li>
                        <li><strong>Walk-in:</strong> Visit F-11, South Extension Part 1, New Delhi during clinic hours</li>
                    </ul>
                    <p class="text-slate-600 mt-2">Clinic is open Mon-Sat: 10 AM - 8 PM, Sunday: 10 AM - 6 PM.</p>
                </div>
            </div>

            <!-- FAQ 6 -->
            <div class="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                <button @click="openFaq = openFaq === 6 ? null : 6" class="w-full px-6 py-5 text-left flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                    <h3 class="font-bold text-slate-900 text-base md:text-lg">What is PCOS and how is it treated?</h3>
                    <i class="fa-solid fa-chevron-down text-primary transition-transform duration-300 shrink-0" :class="{'rotate-180': openFaq === 6}"></i>
                </button>
                <div x-show="openFaq === 6" x-transition:enter="transition ease-out duration-200" x-transition:enter-start="opacity-0 -translate-y-2" x-transition:enter-end="opacity-100 translate-y-0" class="px-6 pb-5">
                    <p class="text-slate-600 leading-relaxed">PCOS (Polycystic Ovary Syndrome) is a common hormonal disorder affecting women of reproductive age. Symptoms include irregular periods, excess hair growth (hirsutism), acne, weight gain, and difficulty conceiving. Dr. Deepika Singh provides comprehensive PCOS management at her South Delhi clinic, including hormonal evaluation (blood tests for LH, FSH, AMH, testosterone, thyroid), ultrasound assessment, lifestyle modification counseling, medication management (metformin, oral contraceptives, anti-androgens), and fertility support. Early diagnosis and proper treatment can prevent long-term complications like type 2 diabetes, heart disease, and endometrial cancer.</p>
                </div>
            </div>

            <!-- FAQ 7 -->
            <div class="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                <button @click="openFaq = openFaq === 7 ? null : 7" class="w-full px-6 py-5 text-left flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                    <h3 class="font-bold text-slate-900 text-base md:text-lg">What are the benefits of laparoscopic surgery over traditional surgery?</h3>
                    <i class="fa-solid fa-chevron-down text-primary transition-transform duration-300 shrink-0" :class="{'rotate-180': openFaq === 7}"></i>
                </button>
                <div x-show="openFaq === 7" x-transition:enter="transition ease-out duration-200" x-transition:enter-start="opacity-0 -translate-y-2" x-transition:enter-end="opacity-100 translate-y-0" class="px-6 pb-5">
                    <p class="text-slate-600 leading-relaxed">Laparoscopic surgery (keyhole surgery) is a minimally invasive surgical technique that Dr. Deepika Singh specializes in as an FCLS-certified surgeon. Key benefits over traditional open surgery include:</p>
                    <ul class="text-slate-600 mt-2 space-y-1 ml-4 list-disc">
                        <li>Smaller incisions (0.5-1 cm vs 10-15 cm)</li>
                        <li>Less post-operative pain</li>
                        <li>Faster recovery (2-3 days vs 6-8 weeks)</li>
                        <li>Shorter hospital stay (usually same-day or 1 day)</li>
                        <li>Minimal scarring</li>
                        <li>Lower risk of infection and blood loss</li>
                    </ul>
                    <p class="text-slate-600 mt-2">Common gynecological laparoscopic procedures include ovarian cyst removal, myomectomy (fibroid removal), hysterectomy, endometriosis treatment, and tubal ligation.</p>
                </div>
            </div>

            <!-- FAQ 8 -->
            <div class="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                <button @click="openFaq = openFaq === 8 ? null : 8" class="w-full px-6 py-5 text-left flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                    <h3 class="font-bold text-slate-900 text-base md:text-lg">When should I visit a gynecologist?</h3>
                    <i class="fa-solid fa-chevron-down text-primary transition-transform duration-300 shrink-0" :class="{'rotate-180': openFaq === 8}"></i>
                </button>
                <div x-show="openFaq === 8" x-transition:enter="transition ease-out duration-200" x-transition:enter-start="opacity-0 -translate-y-2" x-transition:enter-end="opacity-100 translate-y-0" class="px-6 pb-5">
                    <p class="text-slate-600 leading-relaxed">You should visit a gynecologist if you experience any of these symptoms:</p>
                    <ul class="text-slate-600 mt-2 space-y-1 ml-4 list-disc">
                        <li>Irregular, heavy, or very painful periods</li>
                        <li>Unusual vaginal discharge or odor</li>
                        <li>Pelvic pain or lower abdominal discomfort</li>
                        <li>Difficulty getting pregnant (after 1 year of trying)</li>
                        <li>Menopausal symptoms (hot flashes, mood changes, vaginal dryness)</li>
                        <li>Abnormal bleeding between periods or after menopause</li>
                        <li>Breast lumps or changes</li>
                    </ul>
                    <p class="text-slate-600 mt-2">Dr. Deepika Singh recommends that all women above 21 years should have <strong>annual gynecological check-ups</strong> including Pap smear screening. Regular preventive care can detect issues like cervical cancer, ovarian cysts, and fibroids early when they are most treatable.</p>
                </div>
            </div>
        </div>
    </div>
</section>
```

### 2.2 — Add FAQPage Schema to Homepage Head

#### index.html — Add a SECOND `<script type="application/ld+json">` block in `<head>`, right after the MedicalBusiness schema block

```html
<!-- Structured Data - FAQPage -->
<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "Who is the best gynecologist in South Delhi?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Dr. Deepika Singh is widely regarded as one of the best gynecologists in South Delhi. With an MD from AIIMS New Delhi, FCLS certification in laparoscopic surgery, and over 15 years of clinical experience at AIIMS, Max Saket, and Apollo Cradle, she provides comprehensive women's healthcare at her clinic in South Extension Part 1, New Delhi."
            }
        },
        {
            "@type": "Question",
            "name": "Where is Dr. Deepika Singh's clinic located?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Dr. Deepika Singh's clinic is located at F-11, South Extension Part 1, New Delhi - 110049. It is easily accessible from Defence Colony, Greater Kailash (GK), Lajpat Nagar, Saket, Green Park, Hauz Khas, and other South Delhi areas. Open Mon-Sat 10AM-8PM, Sunday 10AM-6PM."
            }
        },
        {
            "@type": "Question",
            "name": "What services does Dr. Deepika Singh offer?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Dr. Deepika Singh offers PCOS/PCOD management, laparoscopic and hysteroscopic surgeries, menopause care, cervical and breast cancer screening (Pap smear, mammography), infertility evaluation and treatment, high-risk pregnancy management, cosmetic gynecology, and routine women's health check-ups at her South Extension clinic."
            }
        },
        {
            "@type": "Question",
            "name": "Does Dr. Deepika Singh treat patients from Noida and Ghaziabad?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, Dr. Deepika Singh regularly treats patients from Noida, Greater Noida, Ghaziabad, Faridabad, and the entire Delhi NCR region. Her clinic at South Extension Part 1 is well-connected via DND Flyway and NH-24."
            }
        },
        {
            "@type": "Question",
            "name": "How can I book an appointment with Dr. Deepika Singh?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "You can book by calling +91 85959 54095, messaging on WhatsApp, filling the online booking form on drdeepikagyno.com, or visiting the clinic at F-11, South Extension Part 1, New Delhi. Walk-in appointments are welcome during clinic hours."
            }
        },
        {
            "@type": "Question",
            "name": "What is PCOS and how is it treated?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "PCOS (Polycystic Ovary Syndrome) is a common hormonal disorder causing irregular periods, excess hair growth, acne, weight gain, and infertility. Dr. Deepika provides comprehensive PCOS management including hormonal evaluation, lifestyle counseling, medication management, and fertility support."
            }
        },
        {
            "@type": "Question",
            "name": "What are the benefits of laparoscopic surgery over traditional surgery?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Laparoscopic surgery offers smaller incisions, less pain, faster recovery (2-3 days vs 6-8 weeks), shorter hospital stay, minimal scarring, and lower infection risk. Dr. Deepika is FCLS-certified and performs ovarian cyst removal, myomectomy, hysterectomy, and endometriosis treatment laparoscopically."
            }
        },
        {
            "@type": "Question",
            "name": "When should I visit a gynecologist?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Visit a gynecologist for irregular or painful periods, unusual discharge, pelvic pain, difficulty conceiving, menopausal symptoms, abnormal bleeding, or breast changes. Women above 21 should have annual gynecological check-ups including Pap smear screening."
            }
        }
    ]
}
</script>
```

---

<a id="phase-3"></a>
## PHASE 3: BLOG SYSTEM

### 3.1 — Create blog.html (Blog Listing Page)

Create a new file at project root: `blog.html`

This page must include:
- GA4 tracking code (same as Phase 1.5)
- Full SEO head with these meta values:
  - `<title>Women's Health Blog | Expert Gynecology Insights | Dr. Deepika Singh South Delhi</title>`
  - `<meta name="description" content="Read expert articles on women's health, PCOS, laparoscopic surgery, menopause, pregnancy care, and gynecology by Dr. Deepika Singh – best gynecologist in South Delhi. Evidence-based health information.">`
  - `<meta name="keywords" content="women's health blog, gynecology blog, PCOS articles, menopause information, laparoscopic surgery guide, pregnancy care tips, gynecologist south delhi blog, Dr. Deepika Singh articles">`
  - `<link rel="canonical" href="https://drdeepikagyno.com/blog.html">`
  - OG tags with same title/description
  - Twitter cards
- JSON-LD schemas:
  - `Blog` type schema
  - `BreadcrumbList` schema: Home > Blog
- Same navigation as other pages (with Blog link active)
- Hero section with H1: "Women's Health Blog – Expert Insights from Dr. Deepika Singh"
- Grid of 8 blog post cards, each with:
  - Title (linked to the individual blog post)
  - Short excerpt (2-3 lines)
  - "Read More" link
  - Date published
  - Category tag (e.g., "PCOS", "Surgery", "Menopause", "Local Guide")
- Same footer as other pages
- Floating call/WhatsApp buttons

### 3.2 — Create 8 Blog Post HTML Files

Create directory: `blog/`

Each blog post HTML file must include:
- GA4 tracking code
- Full SEO head with unique title, description, keywords, canonical, OG, Twitter
- `BlogPosting` JSON-LD schema with:
  - `headline`, `description`, `datePublished` (2026-04-19), `dateModified`
  - `author`: `{ "@type": "Person", "name": "Dr. Deepika Singh", "url": "https://drdeepikagyno.com/about.html" }`
  - `publisher`: `{ "@type": "Organization", "name": "Dr. Deepika Singh Clinic", "logo": { "@type": "ImageObject", "url": "https://drdeepikagyno.com/assets/NewCroppedLogo.jpg" } }`
  - `mainEntityOfPage`: canonical URL
- `BreadcrumbList` schema: Home > Blog > [Post Title]
- Same navigation (with Blog link active)
- Article content with proper heading hierarchy (H1 > H2 > H3)
- Author bio box at bottom
- Related posts section (3 related blog links)
- CTA section to book appointment
- Same footer

#### Blog Post 1: `blog/best-gynecologist-south-delhi.html`

**SEO Values:**
- Title: `Best Gynecologist in South Delhi – Why Patients Choose Dr. Deepika Singh`
- Description: `Looking for the best gynecologist in South Delhi? Dr. Deepika Singh (MD AIIMS, FCLS) offers expert care at South Extension. 15+ years experience. PCOS, laparoscopy, menopause care. Book now.`
- Keywords: `best gynecologist in south delhi, top gynaecologist south delhi, gynecologist near south extension, best gyno doctor south delhi, lady doctor south delhi, women's specialist south delhi`
- Canonical: `https://drdeepikagyno.com/blog/best-gynecologist-south-delhi.html`
- H1: `Best Gynecologist in South Delhi – Why Thousands of Women Trust Dr. Deepika Singh`
- Word count: ~1200-1500 words

**Content outline:**
1. Introduction – Why choosing the right gynecologist matters
2. H2: What Makes a Great Gynecologist? (qualifications, experience, empathy, technology)
3. H2: Dr. Deepika Singh – Credentials & Experience
   - MD from AIIMS New Delhi (2012-2015)
   - FCLS certification (laparoscopic surgery)
   - MCCOG (cosmetic gynecology)
   - 15+ years at AIIMS, Max Saket, Apollo Cradle, Moolchand
   - FOGSI, AOGD, IFS, RCOG member
4. H2: Services Available at Our South Delhi Clinic
   - List all 8 services with brief description
5. H2: Why Patients from Across Delhi NCR Choose Us
   - Location advantage (South Extension, central Delhi)
   - Patient testimonials/quotes
   - 20,000+ happy patients
6. H2: How to Reach Our Clinic
   - Address: F-11, South Extension Part 1, New Delhi - 110049
   - Nearest Metro: South Extension (upcoming), INA Metro
   - By car from GK, Defence Colony, Saket, Lajpat Nagar
   - Phone: +91 85959 54095
7. H2: Book Your Appointment Today (CTA)

#### Blog Post 2: `blog/pcos-treatment-delhi.html`

**SEO Values:**
- Title: `PCOS Treatment in Delhi – Symptoms, Causes & Expert Care | Dr. Deepika Singh`
- Description: `Expert PCOS/PCOD treatment in South Delhi by Dr. Deepika Singh (MD AIIMS). Comprehensive diagnosis, hormonal management & lifestyle guidance. Book your PCOS consultation at South Extension.`
- Keywords: `PCOS treatment delhi, PCOD treatment south delhi, PCOS specialist near me, polycystic ovary syndrome treatment, PCOS doctor delhi, PCOD cure delhi, PCOS symptoms treatment, best doctor for PCOS in delhi`
- Canonical: `https://drdeepikagyno.com/blog/pcos-treatment-delhi.html`
- H1: `PCOS Treatment in Delhi – Comprehensive Guide by Dr. Deepika Singh`
- Word count: ~1200-1500 words

**Content outline:**
1. Introduction – PCOS prevalence in India (1 in 5 women)
2. H2: What is PCOS / PCOD?
   - Clinical definition
   - Difference between PCOS and PCOD
3. H2: Symptoms of PCOS
   - Irregular periods, acne, hirsutism, weight gain, hair thinning, dark patches, mood changes, infertility
4. H2: Causes and Risk Factors
   - Insulin resistance, genetics, inflammation, lifestyle
5. H2: How is PCOS Diagnosed?
   - Rotterdam criteria
   - Blood tests (LH, FSH, AMH, testosterone, thyroid, insulin)
   - Ultrasound
6. H2: PCOS Treatment Options at Our South Delhi Clinic
   - Lifestyle modifications (diet, exercise, weight management)
   - Medications (metformin, OCP, anti-androgens, ovulation induction)
   - When surgery is needed (laparoscopic ovarian drilling)
   - Fertility support
7. H2: Why Choose Dr. Deepika for PCOS Treatment?
   - AIIMS training, research publications, personalized approach
8. H2: Book Your PCOS Consultation (CTA with phone number)

#### Blog Post 3: `blog/laparoscopic-surgery-delhi.html`

**SEO Values:**
- Title: `Laparoscopic Surgery in Delhi – Benefits, Procedure & Recovery | Dr. Deepika Singh`
- Description: `Expert laparoscopic (keyhole) surgery in South Delhi by Dr. Deepika Singh, FCLS certified. Ovarian cyst removal, fibroid surgery, hysterectomy. Faster recovery, less pain. Book consultation.`
- Keywords: `laparoscopic surgery delhi, keyhole surgery south delhi, laparoscopic gynecologist delhi, laparoscopic hysterectomy delhi, ovarian cyst surgery delhi, fibroid removal surgery delhi, minimally invasive surgery gynecology`
- Canonical: `https://drdeepikagyno.com/blog/laparoscopic-surgery-delhi.html`
- H1: `Laparoscopic Surgery in Delhi – Everything You Need to Know`
- Word count: ~1200 words

**Content outline:**
1. Introduction – What is laparoscopic surgery
2. H2: Types of Gynecological Laparoscopic Procedures
3. H2: Benefits of Laparoscopy vs Open Surgery (comparison table)
4. H2: What to Expect – Before, During, and After Surgery
5. H2: Recovery Timeline
6. H2: Who Needs Laparoscopic Surgery?
7. H2: Dr. Deepika Singh – FCLS Certified Laparoscopic Surgeon
8. H2: Book Your Consultation (CTA)

#### Blog Post 4: `blog/gynecologist-near-defence-colony-gk.html`

**SEO Values:**
- Title: `Best Gynecologist Near Defence Colony, GK & Lajpat Nagar | Dr. Deepika Singh`
- Description: `Looking for a gynecologist near Defence Colony, Greater Kailash, or Lajpat Nagar? Dr. Deepika Singh's clinic at South Extension is just minutes away. MD AIIMS, 15+ years experience. Book now.`
- Keywords: `gynecologist near defence colony, gynecologist greater kailash, gynecologist lajpat nagar, gynecologist near GK 1, gynecologist near GK 2, women's doctor near defence colony, lady doctor near lajpat nagar, gynecologist near saket`
- Canonical: `https://drdeepikagyno.com/blog/gynecologist-near-defence-colony-gk.html`
- H1: `Best Gynecologist Near Defence Colony, Greater Kailash & Lajpat Nagar`
- Word count: ~1000 words

**Content outline:**
1. Introduction – Finding a trusted gynecologist near you
2. H2: Dr. Deepika Singh's Clinic – Just Minutes from Your Area
   - Distance/time from Defence Colony (~5 min)
   - Distance from GK 1/GK 2 (~8 min)
   - Distance from Lajpat Nagar (~5 min)
   - Distance from Saket (~10 min)
3. H2: Services Available
4. H2: Why Patients from These Areas Choose Us
5. H2: Directions to Our Clinic
   - Google Maps link
   - By Metro, by car from each area
6. H2: Book Your Visit (CTA)

#### Blog Post 5: `blog/menopause-symptoms-treatment.html`

**SEO Values:**
- Title: `Menopause Symptoms & Treatment – Expert Guide | Dr. Deepika Singh, Gynecologist Delhi`
- Description: `Understanding menopause symptoms and treatment options. Expert menopause care in South Delhi by Dr. Deepika Singh (MD AIIMS). Hot flashes, mood changes, HRT, and natural remedies.`
- Keywords: `menopause treatment delhi, menopause symptoms, menopause doctor near me, HRT treatment delhi, menopause specialist south delhi, perimenopause symptoms, menopause care gynecologist`
- Canonical: `https://drdeepikagyno.com/blog/menopause-symptoms-treatment.html`
- H1: `Menopause Symptoms & Treatment – A Complete Guide for Women`
- Word count: ~1200 words

**Content outline:**
1. Introduction – What is menopause, average age
2. H2: Common Menopause Symptoms
3. H2: Perimenopause vs Menopause vs Post-menopause
4. H2: Treatment Options (HRT, non-hormonal, lifestyle, supplements)
5. H2: When to See a Doctor
6. H2: Menopause Care at Our South Delhi Clinic
7. H2: Book Consultation (CTA)

#### Blog Post 6: `blog/when-to-visit-gynecologist.html`

**SEO Values:**
- Title: `When to Visit a Gynecologist – 10 Signs You Should Not Ignore`
- Description: `10 warning signs that mean you should see a gynecologist immediately. Expert advice from Dr. Deepika Singh, best gynecologist in South Delhi. Don't delay – early detection saves lives.`
- Keywords: `when to visit gynecologist, signs to see gynaecologist, women's health check up, gynecologist consultation, when to go to gynecologist, regular gynecological check up age`
- Canonical: `https://drdeepikagyno.com/blog/when-to-visit-gynecologist.html`
- H1: `When to Visit a Gynecologist – 10 Warning Signs You Should Not Ignore`
- Word count: ~1200 words

**Content outline:**
1. Introduction
2. H2: Sign 1 – Irregular Periods
3. H2: Sign 2 – Extremely Painful Periods (Dysmenorrhea)
4. H2: Sign 3 – Unusual Vaginal Discharge
5. H2: Sign 4 – Pelvic Pain
6. H2: Sign 5 – Difficulty Getting Pregnant
7. H2: Sign 6 – Abnormal Bleeding (Between Periods or Post-Menopause)
8. H2: Sign 7 – Breast Lumps or Changes
9. H2: Sign 8 – Menopausal Symptoms
10. H2: Sign 9 – Urinary Issues (Incontinence, UTIs)
11. H2: Sign 10 – You Haven't Had a Check-up in Over a Year
12. H2: How Often Should You See a Gynecologist? (Age-based guide)
13. H2: Book Your Check-up (CTA)

#### Blog Post 7: `blog/cervical-cancer-screening-delhi.html`

**SEO Values:**
- Title: `Cervical Cancer Screening in Delhi – Pap Smear & HPV Test Guide`
- Description: `Cervical cancer screening saves lives. Get Pap smear and HPV testing in South Delhi with Dr. Deepika Singh. Learn who needs screening, when to start, and what to expect.`
- Keywords: `cervical cancer screening delhi, pap smear test delhi, HPV test south delhi, cervical cancer prevention, pap smear cost delhi, cervical cancer symptoms`
- Canonical: `https://drdeepikagyno.com/blog/cervical-cancer-screening-delhi.html`
- H1: `Cervical Cancer Screening in Delhi – Why Every Woman Needs It`
- Word count: ~1000 words

**Content outline:**
1. Introduction – Cervical cancer statistics in India
2. H2: What is Cervical Cancer?
3. H2: Screening Methods (Pap Smear, HPV Test, VIA)
4. H2: Who Should Get Screened and How Often?
5. H2: What to Expect During a Pap Smear
6. H2: HPV Vaccination
7. H2: Screening Available at Our South Delhi Clinic
8. H2: Book Your Screening (CTA)

#### Blog Post 8: `blog/gynecologist-noida-ghaziabad.html`

**SEO Values:**
- Title: `Best Gynecologist for Noida & Ghaziabad Patients | Dr. Deepika Singh`
- Description: `Patients from Noida, Greater Noida & Ghaziabad trust Dr. Deepika Singh for expert gynecological care. AIIMS trained, FCLS certified. Easy connectivity via DND/NH-24. Book appointment.`
- Keywords: `best gynecologist noida, gynecologist ghaziabad, women's doctor noida, gynecologist greater noida, gynecologist near noida sector 18, lady doctor noida, gynaecologist ghaziabad to delhi`
- Canonical: `https://drdeepikagyno.com/blog/gynecologist-noida-ghaziabad.html`
- H1: `Best Gynecologist for Noida & Ghaziabad – Dr. Deepika Singh`
- Word count: ~1000 words

**Content outline:**
1. Introduction – Why NCR patients travel for quality care
2. H2: Dr. Deepika Singh – Credentials
3. H2: Why Noida/Ghaziabad Patients Choose Us
4. H2: How to Reach from Noida (DND route, metro)
5. H2: How to Reach from Ghaziabad (NH-24/Delhi-Meerut Expressway)
6. H2: Services for NCR Patients
7. H2: Patient Testimonials
8. H2: Book Appointment (CTA)

---

<a id="phase-4"></a>
## PHASE 4: LOCATION PAGES

### 4.1 — Create `gynecologist-south-delhi.html`

**SEO Values:**
- Title: `Best Gynecologist in South Delhi | Dr. Deepika Singh – South Extension`
- Description: `Dr. Deepika Singh – Best gynecologist in South Delhi. MD AIIMS, 15+ years experience. Clinic at South Extension Part 1. PCOS, laparoscopic surgery, menopause care. Serving GK, Defence Colony, Saket, Lajpat Nagar. Call +91 85959 54095.`
- Keywords: `best gynecologist south delhi, gynecologist south extension, top gynecologist south delhi, lady doctor south delhi, gynecologist near GK, gynecologist defence colony, gynecologist saket, gynecologist lajpat nagar, best gyno south delhi`
- Canonical: `https://drdeepikagyno.com/gynecologist-south-delhi.html`
- H1: `Best Gynecologist in South Delhi – Dr. Deepika Singh`

**JSON-LD Schemas:**
1. `MedicalBusiness` (same as homepage but with `@type: "Physician"`)
2. `BreadcrumbList`: Home > Gynecologist in South Delhi
3. `FAQPage` with 4-5 local questions

**Content sections (~1500 words):**
1. Hero with doctor image + CTA
2. H2: Why Dr. Deepika Singh is South Delhi's Trusted Gynecologist
3. H2: Services at Our South Extension Clinic (all 8 services)
4. H2: Areas We Serve in South Delhi
   - Table/grid: South Extension, Defence Colony, Greater Kailash, Lajpat Nagar, Saket, Green Park, Hauz Khas, Malviya Nagar, Nehru Place, Kalkaji, CR Park, Safdarjung, Vasant Kunj, Vasant Vihar
5. H2: How to Reach Our Clinic
   - Google Maps embed
   - Directions from metro (INA, South Extension upcoming)
   - By car from each major area
6. H2: Patient Reviews
7. H2: FAQ (South Delhi specific)
8. H2: Book Appointment CTA

### 4.2 — Create `gynecologist-noida-greater-noida.html`

**SEO Values:**
- Title: `Best Gynecologist for Noida & Greater Noida | Dr. Deepika Singh Delhi`
- Description: `Noida & Greater Noida patients: Consult Dr. Deepika Singh, best gynecologist in Delhi. MD AIIMS, FCLS certified. Easy access via DND Flyway. PCOS, laparoscopy, menopause care. Book: +91 85959 54095.`
- Keywords: `best gynecologist noida, gynecologist greater noida, gynecologist near noida, women's doctor noida, gynecologist noida to delhi, lady doctor noida, gynaecologist noida sector 18, gynecologist near sector 62 noida`
- Canonical: `https://drdeepikagyno.com/gynecologist-noida-greater-noida.html`
- H1: `Best Gynecologist for Noida & Greater Noida Patients`

**Content (~1200 words):**
1. Hero + CTA
2. H2: Why Noida Patients Choose Dr. Deepika Singh
3. H2: Easy Connectivity from Noida (DND Flyway route, approx travel time)
4. H2: Services Available
5. H2: Areas Served (Sector 18, 62, 15, 137, Knowledge Park, Pari Chowk)
6. H2: Book Appointment CTA

### 4.3 — Create `gynecologist-ghaziabad.html`

**SEO Values:**
- Title: `Best Gynecologist for Ghaziabad Patients | Dr. Deepika Singh – Delhi`
- Description: `Ghaziabad patients: Get expert gynecological care from Dr. Deepika Singh, MD AIIMS. Clinic at South Extension, Delhi. Easy access via NH-24/DME. PCOS, surgery, menopause care. Call +91 85959 54095.`
- Keywords: `best gynecologist ghaziabad, gynecologist ghaziabad, lady doctor ghaziabad, women's doctor ghaziabad, gynecologist vaishali ghaziabad, gynecologist indirapuram, best gynaecologist ghaziabad`
- Canonical: `https://drdeepikagyno.com/gynecologist-ghaziabad.html`
- H1: `Top Gynecologist for Ghaziabad – Dr. Deepika Singh`

**Content (~1000 words):**
1. Hero + CTA
2. H2: Why Ghaziabad Patients Trust Dr. Deepika Singh
3. H2: How to Reach from Ghaziabad (NH-24/Delhi-Meerut Expressway, Anand Vihar route)
4. H2: Services Available
5. H2: Areas Served (Vaishali, Indirapuram, Kaushambi, Raj Nagar, Vasundhara, Crossing Republik)
6. H2: Book Appointment CTA

### 4.4 — Add Google Maps Embed to Contact Page

#### contact.html — Insert after the clinic hours card section

Find the "Need Urgent Help?" card section ending. After the closing `</div>` of the grid containing clinic hours + urgent help cards (around the `<!-- Row 2 -->` section), add:

```html
<!-- Google Maps -->
<div class="rounded-2xl overflow-hidden shadow-xl border border-slate-200">
    <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3504.7!2d77.2228!3d28.5781!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sF-11+South+Extension+Part+1+New+Delhi!5e0!3m2!1sen!2sin!4v1"
        width="100%" height="350" style="border:0;" allowfullscreen="" loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
        title="Dr. Deepika Singh Clinic Location - South Extension Part 1, New Delhi">
    </iframe>
</div>
```

**NOTE:** The exact Google Maps embed URL should ideally be generated from Google Maps for the specific clinic. Use coordinates lat=28.5781, lng=77.2228. If the Google Business Profile has a CID, use that for a more precise embed URL.

---

<a id="phase-5"></a>
## PHASE 5: CONFIG UPDATES

### 5.1 — Update vite.config.js

**REPLACE entire file with:**
```js
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                about: resolve(__dirname, 'about.html'),
                services: resolve(__dirname, 'services.html'),
                contact: resolve(__dirname, 'contact.html'),
                testimonials: resolve(__dirname, 'testimonials.html'),
                blog: resolve(__dirname, 'blog.html'),
                'blog-best-gynecologist-south-delhi': resolve(__dirname, 'blog/best-gynecologist-south-delhi.html'),
                'blog-pcos-treatment-delhi': resolve(__dirname, 'blog/pcos-treatment-delhi.html'),
                'blog-laparoscopic-surgery-delhi': resolve(__dirname, 'blog/laparoscopic-surgery-delhi.html'),
                'blog-gynecologist-near-defence-colony-gk': resolve(__dirname, 'blog/gynecologist-near-defence-colony-gk.html'),
                'blog-menopause-symptoms-treatment': resolve(__dirname, 'blog/menopause-symptoms-treatment.html'),
                'blog-when-to-visit-gynecologist': resolve(__dirname, 'blog/when-to-visit-gynecologist.html'),
                'blog-cervical-cancer-screening-delhi': resolve(__dirname, 'blog/cervical-cancer-screening-delhi.html'),
                'blog-gynecologist-noida-ghaziabad': resolve(__dirname, 'blog/gynecologist-noida-ghaziabad.html'),
                'gynecologist-south-delhi': resolve(__dirname, 'gynecologist-south-delhi.html'),
                'gynecologist-noida-greater-noida': resolve(__dirname, 'gynecologist-noida-greater-noida.html'),
                'gynecologist-ghaziabad': resolve(__dirname, 'gynecologist-ghaziabad.html'),
            },
        },
        cssCodeSplit: false,
        minify: 'esbuild',
    },
    css: {
        devSourcemap: true,
    },
})
```

### 5.2 — Update tailwind.config.js

**REPLACE content array (lines 3-6) with:**
```js
content: [
    "./*.html",
    "./blog/**/*.html",
    "./src/**/*.{js,ts,jsx,tsx,html}",
],
```

### 5.3 — Replace public/sitemap.xml

**REPLACE entire file with:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <!-- Main Pages -->
    <url>
        <loc>https://drdeepikagyno.com/</loc>
        <lastmod>2026-04-19</lastmod>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>https://drdeepikagyno.com/about.html</loc>
        <lastmod>2026-04-19</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>
    <url>
        <loc>https://drdeepikagyno.com/services.html</loc>
        <lastmod>2026-04-19</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>
    <url>
        <loc>https://drdeepikagyno.com/testimonials.html</loc>
        <lastmod>2026-04-19</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
    </url>
    <url>
        <loc>https://drdeepikagyno.com/contact.html</loc>
        <lastmod>2026-04-19</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.9</priority>
    </url>

    <!-- Location Pages -->
    <url>
        <loc>https://drdeepikagyno.com/gynecologist-south-delhi.html</loc>
        <lastmod>2026-04-19</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.9</priority>
    </url>
    <url>
        <loc>https://drdeepikagyno.com/gynecologist-noida-greater-noida.html</loc>
        <lastmod>2026-04-19</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>
    <url>
        <loc>https://drdeepikagyno.com/gynecologist-ghaziabad.html</loc>
        <lastmod>2026-04-19</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>

    <!-- Blog -->
    <url>
        <loc>https://drdeepikagyno.com/blog.html</loc>
        <lastmod>2026-04-19</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>
    <url>
        <loc>https://drdeepikagyno.com/blog/best-gynecologist-south-delhi.html</loc>
        <lastmod>2026-04-19</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
    </url>
    <url>
        <loc>https://drdeepikagyno.com/blog/pcos-treatment-delhi.html</loc>
        <lastmod>2026-04-19</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
    </url>
    <url>
        <loc>https://drdeepikagyno.com/blog/laparoscopic-surgery-delhi.html</loc>
        <lastmod>2026-04-19</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
    </url>
    <url>
        <loc>https://drdeepikagyno.com/blog/gynecologist-near-defence-colony-gk.html</loc>
        <lastmod>2026-04-19</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
    </url>
    <url>
        <loc>https://drdeepikagyno.com/blog/menopause-symptoms-treatment.html</loc>
        <lastmod>2026-04-19</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
    </url>
    <url>
        <loc>https://drdeepikagyno.com/blog/when-to-visit-gynecologist.html</loc>
        <lastmod>2026-04-19</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
    </url>
    <url>
        <loc>https://drdeepikagyno.com/blog/cervical-cancer-screening-delhi.html</loc>
        <lastmod>2026-04-19</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
    </url>
    <url>
        <loc>https://drdeepikagyno.com/blog/gynecologist-noida-ghaziabad.html</loc>
        <lastmod>2026-04-19</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
    </url>
</urlset>
```

### 5.4 — robots.txt (no changes needed)

Current robots.txt is correct. No changes needed.

---

## FILES SUMMARY

### New Files to CREATE (14 files):

| # | File Path | Type |
|---|-----------|------|
| 1 | `blog.html` | Blog listing page |
| 2 | `blog/best-gynecologist-south-delhi.html` | Blog post |
| 3 | `blog/pcos-treatment-delhi.html` | Blog post |
| 4 | `blog/laparoscopic-surgery-delhi.html` | Blog post |
| 5 | `blog/gynecologist-near-defence-colony-gk.html` | Blog post |
| 6 | `blog/menopause-symptoms-treatment.html` | Blog post |
| 7 | `blog/when-to-visit-gynecologist.html` | Blog post |
| 8 | `blog/cervical-cancer-screening-delhi.html` | Blog post |
| 9 | `blog/gynecologist-noida-ghaziabad.html` | Blog post |
| 10 | `gynecologist-south-delhi.html` | Location page |
| 11 | `gynecologist-noida-greater-noida.html` | Location page |
| 12 | `gynecologist-ghaziabad.html` | Location page |

### Existing Files to MODIFY (10 files):

| # | File | Changes |
|---|------|---------|
| 1 | `index.html` | GA4, H1, meta tags, schema (MedicalBusiness + FAQPage), FAQ section HTML, nav update (blog link), footer update |
| 2 | `about.html` | GA4, H1, meta tags, breadcrumb schema, nav update, footer update, logo loading fix |
| 3 | `services.html` | GA4, H1, meta tags, breadcrumb schema, nav update, footer update, logo loading fix |
| 4 | `contact.html` | GA4, H1, meta tags, breadcrumb schema, nav update, footer update, logo loading fix, NAP fix (10k→20k), Google Maps embed |
| 5 | `testimonials.html` | GA4, H1, meta tags, breadcrumb schema, nav update, footer update, logo loading fix |
| 6 | `vite.config.js` | Add all new page entries to rollupOptions.input |
| 7 | `tailwind.config.js` | Add `./blog/**/*.html` to content array |
| 8 | `public/sitemap.xml` | Replace with complete sitemap including all new URLs |
| 9 | `netlify.toml` | Update CSP to allow GA4 + Google Maps domains |
| 10 | `src/main.js` | Add Blog to navItems array |

---

## TEMPLATE FOR ALL NEW PAGES

Every new page (blog posts, location pages, blog listing) must follow this HTML skeleton. Copy from any existing page (e.g., `about.html`) and modify. Key elements:

```html
<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
    <!-- GA4 - MUST be first -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-V1126Z4EPD"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-V1126Z4EPD');
    </script>

    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/assets/favicon.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <!-- SEO Meta Tags - UNIQUE PER PAGE -->
    <title>[UNIQUE TITLE - max 60 chars]</title>
    <meta name="description" content="[UNIQUE DESCRIPTION - max 160 chars]">
    <meta name="keywords" content="[UNIQUE KEYWORDS]">
    <meta name="author" content="Dr. Deepika Singh">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="https://drdeepikagyno.com/[PAGE-URL]">

    <!-- Open Graph -->
    <meta property="og:type" content="[website or article]">
    <meta property="og:url" content="https://drdeepikagyno.com/[PAGE-URL]">
    <meta property="og:title" content="[SAME AS TITLE]">
    <meta property="og:description" content="[SAME AS DESCRIPTION]">
    <meta property="og:image" content="https://drdeepikagyno.com/assets/og-image.jpg">

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="https://drdeepikagyno.com/[PAGE-URL]">
    <meta name="twitter:title" content="[SAME AS TITLE]">
    <meta name="twitter:description" content="[SAME AS DESCRIPTION]">
    <meta name="twitter:image" content="https://drdeepikagyno.com/assets/og-image.jpg">

    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet">

    <!-- FontAwesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" />

    <!-- JSON-LD Schema 1 - Page specific -->
    <script type="application/ld+json">
    {
        [PAGE-SPECIFIC SCHEMA]
    }
    </script>

    <!-- JSON-LD Schema 2 - Breadcrumbs -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://drdeepikagyno.com/" },
            { "@type": "ListItem", "position": 2, "name": "[PARENT PAGE]", "item": "https://drdeepikagyno.com/[PARENT].html" },
            { "@type": "ListItem", "position": 3, "name": "[THIS PAGE]", "item": "https://drdeepikagyno.com/[THIS-URL]" }
        ]
    }
    </script>
</head>

<body class="font-sans text-slate-800 bg-slate-50 antialiased" x-data="appData">
    <!-- COPY NAV from about.html but change active link -->
    <!-- Use same nav structure with Blog link added -->

    <main id="main-content" class="pt-20">
        <!-- PAGE CONTENT HERE -->
    </main>

    <!-- COPY floating buttons from about.html -->
    <!-- COPY footer from about.html (with Blog in Quick Links) -->

    <script type="module" src="/src/main.js"></script>
    <!-- Cloudflare Web Analytics -->
    <script defer src='https://static.cloudflareinsights.com/beacon.min.js'
        data-cf-beacon='{"token": "7f7fd67afcde4273818aa68e565f4f61"}'></script>
</body>
</html>
```

### BlogPosting Schema Template (for blog posts):

```json
{
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "[BLOG POST TITLE]",
    "description": "[BLOG POST DESCRIPTION]",
    "image": "https://drdeepikagyno.com/assets/og-image.jpg",
    "datePublished": "2026-04-19",
    "dateModified": "2026-04-19",
    "author": {
        "@type": "Person",
        "name": "Dr. Deepika Singh",
        "url": "https://drdeepikagyno.com/about.html",
        "jobTitle": "Senior Consultant Gynecologist",
        "image": "https://drdeepikagyno.com/assets/DrdeepikaNew.jpg"
    },
    "publisher": {
        "@type": "Organization",
        "name": "Dr. Deepika Singh Clinic",
        "logo": {
            "@type": "ImageObject",
            "url": "https://drdeepikagyno.com/assets/NewCroppedLogo.jpg"
        }
    },
    "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "https://drdeepikagyno.com/blog/[SLUG].html"
    },
    "keywords": "[COMMA-SEPARATED KEYWORDS]"
}
```

---

## IMPLEMENTATION ORDER (Recommended)

1. Phase 1 first (all existing file edits)
2. Phase 2 (FAQ section on homepage)
3. Phase 5 (config updates - vite, sitemap, tailwind, netlify)
4. Phase 3 (blog system - create all files)
5. Phase 4 (location pages)
6. Test build: `npm run build`
7. Verify all pages render correctly with `npm run preview`

---

## POST-IMPLEMENTATION CHECKLIST

After implementing all changes:

- [ ] Run `npm run build` and verify no errors
- [ ] Test all pages load correctly with `npm run preview`
- [ ] Validate JSON-LD schemas at https://validator.schema.org/
- [ ] Test meta tags with https://metatags.io/
- [ ] Check mobile responsiveness of new pages
- [ ] Submit updated sitemap to Google Search Console
- [ ] Verify GA4 is receiving data in Google Analytics dashboard
- [ ] Test all internal links work (no 404s)
- [ ] Verify all blog posts have unique titles, descriptions, and canonical URLs
- [ ] Check page load speed with Google PageSpeed Insights

---

## END OF PLAN
