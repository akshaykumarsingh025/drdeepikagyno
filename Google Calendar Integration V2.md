# Google Calendar Integration V2

This script automatically creates Google Calendar events from a Google Sheet, sends email notifications to the doctor, and sends WhatsApp confirmation messages to patients via the Meta WhatsApp Business API.

## Setup Instructions

### 1. Google Apps Script Setup
1. Open your Google Sheet → Extensions → Apps Script
2. Delete any existing code and paste the script below
3. Save the project

### 2. WhatsApp Template
Create a WhatsApp message template in your Meta Business Manager with the following:
- **Template Name:** `appointment_confirmation`
- **Category:** Utility
- **Language:** English
- **Body:**
  ```
  Hello {{1}},

  Your appointment with Dr. Deepika Singh is confirmed!

  📅 Date: {{2}}
  🕐 Time: {{3}}

  📍 Clinic Location:
  Jewar Rd, Pocket B, Sector Gamma 1, Greater Noida, Uttar Pradesh 201310
  Google Maps: https://maps.app.goo.gl/9MJEPM9CWeFE8Ub18

  📞 For any queries, call us at: {{4}}

  We look forward to seeing you, {{1}}!
  ```
- **Variable Samples:**
  - `{{1}}` → `Rahul`
  - `{{2}}` → `20 Feb 2026`
  - `{{3}}` → `Morning (9AM-12PM)`
  - `{{4}}` → `9876543210`

### 3. Generate a Permanent Access Token
1. Go to [Meta Business Settings](https://business.facebook.com/settings)
2. Navigate to System Users → Generate Token
3. Select your WhatsApp Business App and grant `whatsapp_business_messaging` permission
4. Copy the token and paste it into the `WHATSAPP_TOKEN` variable below

### 4. Set Up a Time-Based Trigger
1. In Apps Script, click the clock icon (Triggers)
2. Add trigger → `createCalendarEvents` → Time-driven → Every 5 minutes (or your preference)

---

## Complete Script

```javascript
// ============================================================
// CONFIGURATION — Update these values
// ============================================================
var CONFIG = {
  // Doctor's email for immediate notifications
  DOCTOR_EMAIL: "drdipikasingh2026@gmail.com",

  // WhatsApp Business API Credentials
  WHATSAPP_PHONE_NUMBER_ID: "951438614724586",
  WHATSAPP_BUSINESS_ACCOUNT_ID: "144195942098042",
  WHATSAPP_TOKEN: "PASTE_YOUR_PERMANENT_ACCESS_TOKEN_HERE",  // ← Replace this!

  // WhatsApp Template Details
  TEMPLATE_NAME: "appointment_confirmation",
  TEMPLATE_LANGUAGE: "en",

  // Clinic contact number for the template
  CLINIC_PHONE: "9876543210",  // ← Replace with your actual clinic number

  // Google Sheet tab name
  SHEET_NAME: "Appointments",

  // Column indices (0-based) — adjust if your sheet layout differs
  COL: {
    NAME: 0,
    PHONE: 1,
    EMAIL: 2,
    DATE: 3,
    TIME: 4,
    REASON: 5,
    STATUS: 7,        // Column H — "Created" / "Error" status
    WA_STATUS: 8      // Column I — WhatsApp status (add this column header!)
  }
};

// ============================================================
// MAIN FUNCTION — Creates calendar events + sends notifications
// ============================================================
function createCalendarEvents() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAME);
  var startRow = 2;
  var numRows = sheet.getLastRow() - 1;

  // Guard: Exit early if there are no data rows
  if (numRows < 1) {
    console.log("No appointment data found. Skipping.");
    return;
  }

  // Read enough columns to include WA_STATUS (column I = 9 columns)
  var numCols = Math.max(9, CONFIG.COL.WA_STATUS + 1);
  var dataRange = sheet.getRange(startRow, 1, numRows, numCols);
  var data = dataRange.getValues();
  var cal = CalendarApp.getDefaultCalendar();

  for (var i = 0; i < data.length; ++i) {
    var row = data[i];
    var name    = row[CONFIG.COL.NAME];
    var phone   = row[CONFIG.COL.PHONE];
    var email   = row[CONFIG.COL.EMAIL];
    var dateVal = row[CONFIG.COL.DATE];
    var timeSlot= row[CONFIG.COL.TIME];
    var reason  = row[CONFIG.COL.REASON];
    var status  = row[CONFIG.COL.STATUS];

    // Skip if already processed or missing required fields
    if (status === "Created" || !name || !dateVal || !timeSlot) {
      continue;
    }

    var timeParts = parseTimeSlot(timeSlot, dateVal);

    if (!timeParts) {
      console.error("Skipping row " + (startRow + i) + ": Could not parse date/time.");
      continue;
    }

    var title = "Appointment: " + name;
    var description = "Phone: " + phone + "\nEmail: " + email + "\nReason: " + reason;

    try {
      // ── 1. CREATE CALENDAR EVENT ──
      var event = cal.createEvent(title, timeParts.start, timeParts.end, {
        description: description
      });

      // Set reminders
      event.removeAllReminders();
      event.addPopupReminder(30);  // 30 min before
      event.addPopupReminder(0);   // At time of appointment

      // ── 2. SEND EMAIL TO DOCTOR ──
      MailApp.sendEmail({
        to: CONFIG.DOCTOR_EMAIL,
        subject: "New Appointment Booked: " + name,
        body: "A new appointment has been booked.\n\n" +
              "Name: " + name + "\n" +
              "Date: " + formatDateForDisplay(dateVal) + "\n" +
              "Time: " + timeSlot + "\n" +
              "Phone: " + phone + "\n" +
              "Email: " + (email || "Not provided") + "\n" +
              "Reason: " + reason
      });

      // Mark calendar event as created
      sheet.getRange(startRow + i, CONFIG.COL.STATUS + 1).setValue("Created");
      console.log("Created event for: " + name);

      // ── 3. SEND WHATSAPP MESSAGE TO PATIENT ──
      if (phone) {
        var waResult = sendWhatsAppConfirmation(name, phone, dateVal, timeSlot);
        sheet.getRange(startRow + i, CONFIG.COL.WA_STATUS + 1).setValue(waResult);
      } else {
        sheet.getRange(startRow + i, CONFIG.COL.WA_STATUS + 1).setValue("No phone");
      }

    } catch (e) {
      console.error("Error creating event for " + name + ": " + e.toString());
      sheet.getRange(startRow + i, CONFIG.COL.STATUS + 1).setValue("Error: " + e.toString());
    }
  }
}

// ============================================================
// WHATSAPP — Send confirmation message via Meta Cloud API
// ============================================================
function sendWhatsAppConfirmation(patientName, phoneNumber, dateVal, timeSlot) {
  // Format phone number: remove spaces, dashes; ensure country code
  var formattedPhone = formatPhoneNumber(phoneNumber);

  if (!formattedPhone) {
    console.error("Invalid phone number for " + patientName + ": " + phoneNumber);
    return "Invalid phone";
  }

  var url = "https://graph.facebook.com/v21.0/" + CONFIG.WHATSAPP_PHONE_NUMBER_ID + "/messages";

  var payload = {
    messaging_product: "whatsapp",
    to: formattedPhone,
    type: "template",
    template: {
      name: CONFIG.TEMPLATE_NAME,
      language: {
        code: CONFIG.TEMPLATE_LANGUAGE
      },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: patientName },                        // {{1}} — Name
            { type: "text", text: formatDateForDisplay(dateVal) },      // {{2}} — Date
            { type: "text", text: timeSlot },                           // {{3}} — Time slot
            { type: "text", text: CONFIG.CLINIC_PHONE }                 // {{4}} — Clinic phone
          ]
        }
      ]
    }
  };

  var options = {
    method: "post",
    contentType: "application/json",
    headers: {
      Authorization: "Bearer " + CONFIG.WHATSAPP_TOKEN
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true  // Don't throw on HTTP errors
  };

  try {
    var response = UrlFetchApp.fetch(url, options);
    var responseCode = response.getResponseCode();
    var responseBody = JSON.parse(response.getContentText());

    if (responseCode === 200) {
      var messageId = responseBody.messages && responseBody.messages[0]
                        ? responseBody.messages[0].id
                        : "sent";
      console.log("WhatsApp sent to " + patientName + " (" + formattedPhone + ") — ID: " + messageId);
      return "WA Sent ✓";
    } else {
      var errorMsg = responseBody.error ? responseBody.error.message : "Unknown error";
      console.error("WhatsApp API error for " + patientName + ": " + errorMsg);
      return "WA Error: " + errorMsg;
    }
  } catch (e) {
    console.error("WhatsApp fetch error for " + patientName + ": " + e.toString());
    return "WA Fetch Error";
  }
}

// ============================================================
// PHONE NUMBER FORMATTER
// ============================================================
function formatPhoneNumber(phone) {
  // Convert to string and strip all non-digit characters except leading +
  var cleaned = String(phone).replace(/[^\d+]/g, "");

  // Remove leading + for processing
  if (cleaned.startsWith("+")) {
    cleaned = cleaned.substring(1);
  }

  // If number starts with 0 (local Indian format), replace with 91
  if (cleaned.startsWith("0")) {
    cleaned = "91" + cleaned.substring(1);
  }

  // If 10 digits (no country code), assume India (+91)
  if (cleaned.length === 10) {
    cleaned = "91" + cleaned;
  }

  // Validate: must be 11-15 digits
  if (cleaned.length < 11 || cleaned.length > 15) {
    return null;
  }

  return cleaned;
}

// ============================================================
// DATE & TIME PARSING
// ============================================================
function parseTimeSlot(slotString, dateVal) {
  var year, month, day;

  // Handle Date object vs String
  if (dateVal && typeof dateVal.getFullYear === 'function') {
    year  = dateVal.getFullYear();
    month = dateVal.getMonth();
    day   = dateVal.getDate();
  } else {
    var str = String(dateVal);
    var parts = str.split("-");
    if (parts.length >= 3) {
      year  = parseInt(parts[0]);
      month = parseInt(parts[1]) - 1;  // Months are 0-indexed
      day   = parseInt(parts[2]);
    } else {
      var d = new Date(dateVal);
      if (!isNaN(d.getTime())) {
        year  = d.getFullYear();
        month = d.getMonth();
        day   = d.getDate();
      } else {
        console.error("Invalid date format: " + dateVal);
        return null;
      }
    }
  }

  // Map time slot to hours
  var startHour = 9, endHour = 10;

  if (slotString.includes("Morning"))        { startHour = 9;  endHour = 12; }
  else if (slotString.includes("Afternoon")) { startHour = 12; endHour = 16; }
  else if (slotString.includes("Evening"))   { startHour = 16; endHour = 20; }

  var startDate = new Date(year, month, day, startHour, 0);
  var endDate   = new Date(year, month, day, endHour, 0);

  return { start: startDate, end: endDate };
}

// Format date for display in messages
function formatDateForDisplay(dateVal) {
  var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  if (dateVal && typeof dateVal.getFullYear === 'function') {
    return dateVal.getDate() + " " + months[dateVal.getMonth()] + " " + dateVal.getFullYear();
  }

  var str = String(dateVal);
  var parts = str.split("-");
  if (parts.length >= 3) {
    var m = parseInt(parts[1]) - 1;
    return parseInt(parts[2]) + " " + months[m] + " " + parts[0];
  }

  return String(dateVal);
}

// ============================================================
// UTILITY — Test WhatsApp separately
// ============================================================
function testWhatsApp() {
  var result = sendWhatsAppConfirmation(
    "Test Patient",       // Name
    "919876543210",       // Phone (use your own number to test)
    "2026-02-20",         // Date
    "Morning (9AM-12PM)"  // Time slot
  );
  console.log("Test result: " + result);
}
```

---

## Google Sheet Layout

Your sheet should have these columns:

| Column | A | B | C | D | E | F | G | H | I |
|--------|---|---|---|---|---|---|---|---|---|
| **Header** | Name | Phone | Email | Date | Time Slot | Reason | *(unused)* | Status | WA Status |
| **Example** | Rahul Sharma | 9876543210 | rahul@email.com | 2026-02-20 | Morning (9AM-12PM) | Regular checkup | | Created | WA Sent ✓ |

> **Note:** Add a "WA Status" header in **Column I** — the script writes WhatsApp delivery status here.

---

## What This Script Does

1. **Reads appointments** from the Google Sheet
2. **Creates a Google Calendar event** with 30-min and at-time reminders
3. **Sends an email** to the doctor immediately
4. **Sends a WhatsApp message** to the patient using your approved template
5. **Logs status** in columns H (calendar) and I (WhatsApp)

---

## Important Notes

- ⚠️ **Replace `PASTE_YOUR_PERMANENT_ACCESS_TOKEN_HERE`** with your actual Meta access token
- ⚠️ **Replace `CLINIC_PHONE`** with your actual clinic contact number
- ⚠️ Your WhatsApp template must be **approved by Meta** before messages will send
- ⚠️ The test number `+1 555 175 7897` is Meta's sandbox number — real messages go to real patient numbers
- ⚠️ Patient phone numbers should include country code (e.g., `919876543210`) or be 10-digit Indian numbers (auto-prefixed with `91`)
