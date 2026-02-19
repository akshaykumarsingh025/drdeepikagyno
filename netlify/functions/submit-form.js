import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

// Allowed origins - restrict CORS
const ALLOWED_ORIGINS = [
    'https://drdeepikagyno.com',
    'https://www.drdeepikagyno.com',
    'http://localhost:8888',
    'http://localhost:5173',
    'http://localhost:5174',
];

function getCorsHeaders(event) {
    const origin = event.headers?.origin || '';
    const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
    return {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Headers': 'Content-Type',
    };
}

// Sanitize input to prevent Google Sheets formula injection
function sanitize(value) {
    if (typeof value !== 'string') return '';
    let trimmed = value.trim();
    // Strip leading characters that trigger formulas in spreadsheets
    if (/^[=+\-@\t\r]/.test(trimmed)) {
        trimmed = "'" + trimmed;
    }
    return trimmed;
}

// Server-side validation
function validateAppointment(data) {
    const errors = [];

    if (!data || typeof data !== 'object') {
        return ['Invalid request data.'];
    }

    // Name: required, 2-100 chars, letters/spaces/dots/hyphens/apostrophes
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
        errors.push('Name is required (minimum 2 characters).');
    } else if (data.name.trim().length > 100) {
        errors.push('Name must be under 100 characters.');
    } else if (!/^[a-zA-Z\s.'\-]+$/.test(data.name.trim())) {
        errors.push('Name contains invalid characters.');
    }

    // Phone: required, 10-12 digits
    if (!data.phone || typeof data.phone !== 'string') {
        errors.push('Phone number is required.');
    } else {
        const digits = data.phone.replace(/[\s\-\(\)\+]/g, '');
        if (!/^\d{10,12}$/.test(digits)) {
            errors.push('Enter a valid phone number (10-12 digits).');
        }
    }

    // Email: optional, but validate format if provided
    if (data.email && typeof data.email === 'string' && data.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
        errors.push('Please enter a valid email address.');
    }

    // Date: required, valid format
    if (!data.date || typeof data.date !== 'string') {
        errors.push('Date is required.');
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
        errors.push('Invalid date format.');
    }

    // Time: required
    if (!data.time || typeof data.time !== 'string' || data.time.trim().length === 0) {
        errors.push('Time slot is required.');
    }

    // Reason: optional, max 500 chars
    if (data.reason && typeof data.reason === 'string' && data.reason.trim().length > 500) {
        errors.push('Reason must be under 500 characters.');
    }

    return errors;
}

function validateContact(data) {
    const errors = [];

    if (!data || typeof data !== 'object') {
        return ['Invalid request data.'];
    }

    if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
        errors.push('Name is required (minimum 2 characters).');
    } else if (data.name.trim().length > 100) {
        errors.push('Name must be under 100 characters.');
    }

    if (!data.email || typeof data.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
        errors.push('A valid email address is required.');
    }

    if (!data.message || typeof data.message !== 'string' || data.message.trim().length < 2) {
        errors.push('Message is required.');
    } else if (data.message.trim().length > 2000) {
        errors.push('Message must be under 2000 characters.');
    }

    return errors;
}

function validateQuickAppointment(data) {
    const errors = [];

    if (!data || typeof data !== 'object') {
        return ['Invalid request data.'];
    }

    // Name: required, 2-100 chars
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
        errors.push('Name is required (minimum 2 characters).');
    } else if (data.name.trim().length > 100) {
        errors.push('Name must be under 100 characters.');
    }

    // Phone: required, 10-12 digits
    if (!data.phone || typeof data.phone !== 'string') {
        errors.push('Phone number is required.');
    } else {
        const digits = data.phone.replace(/[\s\-\(\)\+]/g, '');
        if (!/^\d{10,12}$/.test(digits)) {
            errors.push('Enter a valid phone number (10-12 digits).');
        }
    }

    // Message: optional, max 500 chars
    if (data.message && typeof data.message === 'string' && data.message.trim().length > 500) {
        errors.push('Message must be under 500 characters.');
    }

    return errors;
}

export const handler = async function (event, context) {
    const headers = getCorsHeaders(event);

    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ message: 'Method Not Allowed' }) };
    }

    try {
        const { type, data } = JSON.parse(event.body);

        // Honeypot check - if a hidden field is filled, it's a bot
        if (data && data._honey) {
            // Silently accept but don't process - bots think it worked
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ message: "Success" }),
            };
        }

        // Validate type
        if (!type || !['appointment', 'contact', 'quick_appointment'].includes(type)) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ message: 'Invalid form type.' }),
            };
        }

        // Server-side validation
        const validationErrors = type === 'appointment'
            ? validateAppointment(data)
            : type === 'contact'
                ? validateContact(data)
                : validateQuickAppointment(data);

        if (validationErrors.length > 0) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ message: validationErrors.join(' ') }),
            };
        }

        // Check availability of credentials
        if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
            console.warn("Google Sheet credentials missing. Mocking success for dev/preview.");
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ message: "Mock success: Application not yet connected to Sheets." }),
            };
        }

        // Initialize Auth - handle private key newlines
        const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');

        const serviceAccountAuth = new JWT({
            email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            key: privateKey,
            scopes: [
                'https://www.googleapis.com/auth/spreadsheets',
            ],
        });

        const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
        await doc.loadInfo();

        if (type === 'appointment') {
            let sheet = doc.sheetsByTitle['Appointments'];
            if (!sheet) {
                sheet = await doc.addSheet({ title: 'Appointments', headerValues: ['Name', 'Phone Number', 'Email', 'Date', 'Time', 'Reason', 'Submitted At'] });
            } else {
                try {
                    await sheet.loadHeaderRow();
                } catch (e) {
                    console.log('No header row found, creating one');
                }
                if (!sheet.headerValues || sheet.headerValues.length === 0) {
                    await sheet.setHeaderRow(['Name', 'Phone Number', 'Email', 'Date', 'Time', 'Reason', 'Submitted At']);
                }
            }

            await sheet.addRow({
                Name: sanitize(data.name),
                'Phone Number': sanitize(data.phone),
                Email: sanitize(data.email),
                Date: sanitize(data.date),
                Time: sanitize(data.time),
                Reason: sanitize(data.reason || ''),
                'Submitted At': new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
            });

        } else if (type === 'contact') {
            let sheet = doc.sheetsByTitle['Contacts'];
            if (!sheet) {
                sheet = await doc.addSheet({ title: 'Contacts', headerValues: ['Name', 'Email', 'Message', 'Submitted At'] });
            } else {
                try {
                    await sheet.loadHeaderRow();
                } catch (e) {
                    console.log('No header row found, creating one');
                }
                if (!sheet.headerValues || sheet.headerValues.length === 0) {
                    await sheet.setHeaderRow(['Name', 'Email', 'Message', 'Submitted At']);
                }
            }
            await sheet.addRow({
                Name: sanitize(data.name),
                Email: sanitize(data.email),
                Message: sanitize(data.message),
                'Submitted At': new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
            });
        } else if (type === 'quick_appointment') {
            // Use the same sheet as the main appointment form
            let sheet = doc.sheetsByTitle['Appointments'];

            // If the sheet doesn't exist, create it with the standard headers (same as successful appointment)
            if (!sheet) {
                sheet = await doc.addSheet({ title: 'Appointments', headerValues: ['Name', 'Phone Number', 'Email', 'Date', 'Time', 'Reason', 'Submitted At'] });
            } else {
                // Ensure headers exist
                try {
                    await sheet.loadHeaderRow();
                } catch (e) {
                    console.log('No header row found, creating one');
                }
                if (!sheet.headerValues || sheet.headerValues.length === 0) {
                    await sheet.setHeaderRow(['Name', 'Phone Number', 'Email', 'Date', 'Time', 'Reason', 'Submitted At']);
                }
            }

            // Add row with available data, marking Date/Time as Quick Request
            await sheet.addRow({
                Name: sanitize(data.name),
                'Phone Number': sanitize(data.phone),
                Email: '', // Not collected in quick form
                Date: 'Quick Request', // Placeholder
                Time: 'ASAP', // Placeholder
                Reason: sanitize(data.message || ''),
                'Submitted At': new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
            });
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: "Success" }),
        };

    } catch (error) {
        console.error("Function error:", error);
        return {
            statusCode: 500,
            headers,
            // Never leak internal error details to client
            body: JSON.stringify({ message: "Something went wrong. Please try again later." }),
        };
    }
};
