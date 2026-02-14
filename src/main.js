import './style.css'
import Alpine from 'alpinejs'

window.Alpine = Alpine

document.addEventListener('alpine:init', () => {
    Alpine.data('appData', () => ({
        mobileMenuOpen: false,

        navItems: [
            { label: 'Home', href: '/' },
            { label: 'About', href: '/about.html' },
            { label: 'Services', href: '/services.html' },
            { label: 'Testimonials', href: '/testimonials.html' },
            { label: 'Contact', href: '/contact.html' }
        ],

        services: [
            {
                title: 'Pregnancy Care',
                description: 'Comprehensive antenatal care for a healthy journey from conception to delivery, including high-risk pregnancy management.',
                icon: 'fa-solid fa-baby-carriage'
            },
            {
                title: 'Gynaecological Surgeries',
                description: 'Advanced surgical solutions including laparoscopic and hysteroscopic procedures with minimal recovery time.',
                icon: 'fa-solid fa-hospital-user'
            },
            {
                title: 'Infertility Treatment',
                description: 'Expert evaluation and treatment options to help you start your family, including IVF consultation and support.',
                icon: 'fa-solid fa-seedling'
            },
            {
                title: 'PCOS/PCOD Management',
                description: 'Comprehensive management of PCOS, thyroid disorders, and other hormonal imbalances affecting women\'s health.',
                icon: 'fa-solid fa-venus'
            },
            {
                title: 'Menopause Clinic',
                description: 'Support and treatment for a smooth transition through menopause, addressing symptoms and long-term health.',
                icon: 'fa-solid fa-person-dress'
            },
            {
                title: 'Cancer Screening',
                description: 'Pap smears, mammograms, and preventive screenings for early detection and prevention of women\'s cancers.',
                icon: 'fa-solid fa-ribbon'
            }
        ],

        testimonials: [
            {
                name: 'Priya Sharma',
                text: 'Dr. Deepika is an angel. She guided me through my high-risk pregnancy with so much care and patience. I am forever grateful for her expertise and compassion.',
                image: '/assets/patient.jpg'
            },
            {
                name: 'Anjali Verma',
                text: 'The best gynecologist in town. She listens to your problems and gives the best advice. Highly recommended for anyone seeking quality women\'s healthcare!',
                image: '/assets/HappySatisfiedPatients_IMG_1437.jpg'
            },
            {
                name: 'Meera Singh',
                text: 'Very professional and kind. The clinic environment is so positive and clean. My laparoscopic surgery went perfectly, and the recovery was quick.',
                image: '/assets/HappySatisfiedPatients_IMG_0643.jpg'
            },
            {
                name: 'Kavita Patel',
                text: 'Dr. Deepika helped me manage my PCOS effectively. Her personalized approach and follow-up care made all the difference in my treatment journey.',
                image: '/assets/HappySatisfiedPatients_IMG_1013.JPG.jpg'
            }
        ],

        // Appointment Booking
        appointmentForm: {
            name: '',
            phone: '',
            email: '',
            date: '',
            time: '',
            reason: '',
            _honey: ''
        },
        appointmentErrors: {
            name: '',
            phone: '',
            email: '',
            date: '',
            time: '',
            reason: ''
        },
        appointmentTouched: {
            name: false,
            phone: false,
            email: false,
            date: false,
            time: false,
            reason: false
        },
        appointmentStatus: {
            loading: false,
            message: '',
            type: '' // 'error' or 'success'
        },

        validateField(field) {
            const value = this.appointmentForm[field];
            let error = '';

            switch (field) {
                case 'name':
                    if (!value || !value.trim()) {
                        error = 'Full name is required.';
                    } else if (value.trim().length < 2) {
                        error = 'Name must be at least 2 characters.';
                    } else if (!/^[a-zA-Z\s.'-]+$/.test(value.trim())) {
                        error = 'Name can only contain letters, spaces, dots, hyphens, and apostrophes.';
                    }
                    break;

                case 'phone':
                    if (!value || !value.trim()) {
                        error = 'Phone number is required.';
                    } else {
                        const digits = value.replace(/[\s\-\(\)\+]/g, '');
                        if (!/^\d{10,12}$/.test(digits)) {
                            error = 'Enter a valid 10-digit phone number.';
                        } else if (digits.length === 10 && !/^[6-9]/.test(digits)) {
                            error = 'Indian phone numbers must start with 6-9.';
                        }
                    }
                    break;

                case 'email':
                    if (!value || !value.trim()) {
                        error = 'Email is required.';
                    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
                        error = 'Please enter a valid email address.';
                    }
                    break;

                case 'date':
                    if (!value) {
                        error = 'Please select an appointment date.';
                    } else {
                        const selected = new Date(value + 'T00:00:00');
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        if (selected < today) {
                            error = 'Date cannot be in the past.';
                        } else if (selected.getDay() === 0) {
                            error = 'Clinic is closed on Sundays. Please pick another day.';
                        }
                    }
                    break;

                case 'time':
                    if (!value) {
                        error = 'Please select a preferred time slot.';
                    }
                    break;

                case 'reason':
                    // Optional field, but validate length if provided
                    if (value && value.trim().length > 500) {
                        error = 'Please keep your message under 500 characters.';
                    }
                    break;
            }

            this.appointmentErrors[field] = error;
            return !error;
        },

        touchField(field) {
            this.appointmentTouched[field] = true;
            this.validateField(field);
        },

        onFieldInput(field) {
            if (this.appointmentTouched[field]) {
                this.validateField(field);
            }
        },

        validateAllFields() {
            const fields = ['name', 'phone', 'email', 'date', 'time'];
            let allValid = true;
            fields.forEach(field => {
                this.appointmentTouched[field] = true;
                if (!this.validateField(field)) {
                    allValid = false;
                }
            });
            // Also validate reason (optional but check length)
            this.validateField('reason');
            if (this.appointmentErrors.reason) allValid = false;
            return allValid;
        },

        async submitAppointment() {
            if (!this.validateAllFields()) {
                this.appointmentStatus.type = 'error';
                this.appointmentStatus.message = 'Please fix the errors above before submitting.';
                return;
            }

            this.appointmentStatus.loading = true;
            this.appointmentStatus.message = '';

            try {
                const response = await fetch('/api/submit-form', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'appointment',
                        data: this.appointmentForm
                    })
                });

                // Safely parse JSON (Vite dev server returns HTML 404, not JSON)
                const contentType = response.headers.get('content-type') || '';
                let result;
                if (contentType.includes('application/json')) {
                    result = await response.json();
                } else {
                    const text = await response.text();
                    throw new Error(response.ok ? 'Unexpected server response.' : 'Server is not available. Please try again later.');
                }

                if (!response.ok) {
                    throw new Error(result.message || 'Failed to book appointment');
                }

                this.appointmentStatus.type = 'success';
                this.appointmentStatus.message = 'Appointment booked successfully! We will call you to confirm.';
                // Reset form and validation state
                this.appointmentForm = {
                    name: '',
                    phone: '',
                    email: '',
                    date: '',
                    time: '',
                    reason: '',
                    _honey: ''
                };
                this.appointmentErrors = { name: '', phone: '', email: '', date: '', time: '', reason: '' };
                this.appointmentTouched = { name: false, phone: false, email: false, date: false, time: false, reason: false };
                setTimeout(() => this.appointmentStatus.message = '', 5000);

            } catch (error) {
                this.appointmentStatus.type = 'error';
                this.appointmentStatus.message = error.message || 'Something went wrong. Please try again.';
            } finally {
                this.appointmentStatus.loading = false;
            }
        },

        // Contact Form
        contactForm: {
            name: '',
            email: '',
            message: ''
        },
        contactStatus: {
            loading: false,
            message: '',
            type: ''
        },
        async submitContact() {
            this.contactStatus.loading = true;
            this.contactStatus.message = '';

            try {
                // Send to Google Sheet via Backend
                const response = await fetch('/api/submit-form', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'contact',
                        data: this.contactForm
                    })
                });

                // Safely parse JSON
                const contentType = response.headers.get('content-type') || '';
                let result;
                if (contentType.includes('application/json')) {
                    result = await response.json();
                } else {
                    const text = await response.text();
                    throw new Error(response.ok ? 'Unexpected server response.' : 'Server is not available. Please try again later.');
                }

                if (!response.ok) {
                    throw new Error(result.message || 'Failed to send message');
                }

                this.contactStatus.type = 'success';
                this.contactStatus.message = 'Message sent successfully! We will get back to you soon.';
                this.contactForm = { name: '', email: '', message: '' };
                setTimeout(() => this.contactStatus.message = '', 5000);

            } catch (error) {
                console.error(error);
                this.contactStatus.type = 'error';
                this.contactStatus.message = 'Something went wrong. Please try again.';
            } finally {
                this.contactStatus.loading = false;
            }
        },

        // Initialize scroll listener for navbar
        init() {
            // Close mobile menu on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.mobileMenuOpen) {
                    this.mobileMenuOpen = false;
                }
            });

            // Set minimum date for appointment to today
            const dateInput = document.getElementById('appointment-date');
            if (dateInput) {
                const today = new Date().toISOString().split('T')[0];
                dateInput.setAttribute('min', today);
            }
        }
    }))
})

Alpine.start()
