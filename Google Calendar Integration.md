# Google Calendar Integration Script

This script automatically creates Google Calendar events from a Google Sheet and sends email notifications to the doctor.

```javascript
function createCalendarEvents() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Appointments");
  var startRow = 2; 
  var numRows = sheet.getLastRow() - 1; 
  
  // Guard: Exit early if there are no data rows (only headers or empty sheet)
  if (numRows < 1) {
    console.log("No appointment data found. Skipping.");
    return;
  }
  
  var dataRange = sheet.getRange(startRow, 1, numRows, 8); 
  var data = dataRange.getValues();
  var cal = CalendarApp.getDefaultCalendar();
  
  // Update this to your email receive notifications
  var DOCTOR_EMAIL = "drdipikasingh2026@gmail.com"; 

  var NAME_COL = 0; 
  var PHONE_COL = 1; 
  var EMAIL_COL = 2; 
  var DATE_COL = 3; 
  var TIME_COL = 4; 
  var REASON_COL = 5; 
  var STATUS_COL = 7; 

  for (var i = 0; i < data.length; ++i) {
    var row = data[i];
    var name = row[NAME_COL];
    var phone = row[PHONE_COL];
    var dateVal = row[DATE_COL];
    var timeSlot = row[TIME_COL];
    var status = row[STATUS_COL];

    if (status !== "Created" && name && dateVal && timeSlot) {
      
      var timeParts = parseTimeSlot(timeSlot, dateVal);
      
      if (timeParts) {
        var title = "Appointment: " + name;
        var description = "Phone: " + phone + "\nEmail: " + row[EMAIL_COL] + "\nReason: " + row[REASON_COL];
        
        try {
          // MODIFIED: Removed guests and sendInvites to prevent emailing the patient
          var event = cal.createEvent(title, timeParts.start, timeParts.end, {
            description: description
          });
          
          // --- NOTIFICATIONS ---
          event.removeAllReminders();
          event.addPopupReminder(30); // 30 min before
          event.addPopupReminder(0);  // At time of appointment
          
          // Send IMMEDIATE Email Notification to Doctor
          MailApp.sendEmail({
            to: DOCTOR_EMAIL,
            subject: "New Appointment Booked: " + name,
            body: "A new appointment has been booked.\n\n" +
                  "Name: " + name + "\n" +
                  "Date: " + dateVal + "\n" +
                  "Time: " + timeSlot + "\n" +
                  "Phone: " + phone + "\n" +
                  "Reason: " + row[REASON_COL]
          });
          
          sheet.getRange(startRow + i, STATUS_COL + 1).setValue("Created");
          console.log("Created event for: " + name);
        } catch (e) {
          console.error("Error creating event for " + name + ": " + e.toString());
          sheet.getRange(startRow + i, STATUS_COL + 1).setValue("Error: " + e.toString());
        }
      }
    }
  }
}

function parseTimeSlot(slotString, dateVal) {
  var year, month, day;
  
  // ROBUST DATE CHECK: Handle Date object vs String
  if (dateVal && typeof dateVal.getFullYear === 'function') {
    // It's a Date object (Sheet auto-converted it)
    year = dateVal.getFullYear();
    month = dateVal.getMonth();
    day = dateVal.getDate();
  } else {
    // It's a String like "2026-02-14"
    var str = String(dateVal);
    var parts = str.split("-");
    if (parts.length >= 3) {
      year = parseInt(parts[0]);
      month = parseInt(parts[1]) - 1; // Months are 0-indexed
      day = parseInt(parts[2]);
    } else {
      // Fallback: try standard date parsing
      var d = new Date(dateVal);
      if (!isNaN(d.getTime())) {
        year = d.getFullYear();
        month = d.getMonth();
        day = d.getDate();
      } else {
        console.error("Invalid date format: " + dateVal);
        return null; // Skip this event
      }
    }
  }
  
  var startHour = 9;
  var endHour = 10;
  
  if (slotString.includes("Morning")) { startHour = 9; endHour = 12; }
  else if (slotString.includes("Afternoon")) { startHour = 12; endHour = 16; }
  else if (slotString.includes("Evening")) { startHour = 16; endHour = 20; }
  
  var startDate = new Date(year, month, day, startHour, 0);
  var endDate = new Date(year, month, day, endHour, 0);
  
  return { start: startDate, end: endDate };
}
```
