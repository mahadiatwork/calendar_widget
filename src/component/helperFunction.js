// Function to check if a date falls within a specific range
export const isDateInRange = (date, rangeType) => {
    const today = new Date();
    const targetDate = new Date(date);
    let startDate, endDate;

    switch (rangeType) {
        case "Current Week":
            startDate = new Date(today);
            startDate.setDate(today.getDate() - today.getDay()); // Start of the week (Sunday)
            endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6); // End of the week (Saturday)
            break;
        case "Current Month":
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            break;
        case "Last 7 Days":
            startDate = new Date();
            startDate.setDate(today.getDate() - 7);
            endDate = today;
            break;
        case "Last 30 Days":
            startDate = new Date();
            startDate.setDate(today.getDate() - 30);
            endDate = today;
            break;
        case "Last 90 Days":
            startDate = new Date();
            startDate.setDate(today.getDate() - 90);
            endDate = today;
            break;
        case "Next Week":
            startDate = new Date();
            startDate.setDate(today.getDate() + (7 - today.getDay())); // Start of next week
            endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6); // End of next week
            break;
        case "Default":
        default:
            startDate = new Date();
            startDate.setDate(today.getDate() - 14); // Last 14 days
            endDate = null;
            break;
    }

    return targetDate >= startDate && targetDate <= endDate;
};



export const typeOptions = [
  "Call Attempted",
  "Call Completed",
  "Call Left Message",
  "Call Received",
  "Meeting Held",
  "Meeting Not Held",
  "To-do Done",
  "To-do Not Done",
  "Appointment Completed",
  "Appointment Not Completed",
  "Boardroom - Completed",
  "Boardroom - Not Completed",
  "Call Billing - Completed",
  "Initial Consultation - Completed",
  "Initial Consultation - Not Completed",
  "Mail - Completed",
  "Mail - Not Completed",
  "Meeting Billing - Completed",
  "Meeting Billing - Not Completed",
  "Personal Activity - Completed",
  "Personal Activity - Not Completed",
  "Note",
  "Mail Received",
  "Mail Sent",
  "Email Received",
  "Courier Sent",
  "Email Sent",
  "Payment Received",
  "Room 1 - Completed",
  "Room 1 - Not Completed",
  "Room 2 - Completed",
  "Room 2 - Not Completed",
  "Room 3 - Completed",
  "Room 3 - Not Completed",
  "To Do Billing - Completed",
  "To Do Billing - Not Completed",
  "Vacation - Completed",
  "Vacation - Not Completed",
  "Vacation Cancelled",
  "Attachment",
  "E-mail Attachment",
];


export const getResultBasedOnActivityType = (activityType) => {
switch (activityType) {
  case "Meeting":
    return "Meeting Held";
  case "To-Do":
    return "To-do Done";
  case "Appointment":
    return "Appointment Completed";
  case "Boardroom":
    return "Boardroom - Completed";
  case "Call Billing":
    return "Call Billing - Completed";
  case "Email Billing":
    return "Email Billing - Completed";
  case "Initial Consultation":
    return "Initial Consultation - Completed";
  case "Call":
    return "Call Attempted";
  case "Mail":
    return "Mail - Completed";
  case "Meeting Billing":
    return "Meeting Billing - Completed";
  case "Personal Activity":
    return "Personal Activity - Completed";
  case "Room 1":
    return "Room 1 - Completed";
  case "Room 2":
    return "Room 2 - Completed";
  case "Room 3":
    return "Room 3 - Completed";
  case "To Do Billing":
    return "To Do Billing - Completed";
  case "Vacation":
    return "Vacation - Completed";
  default:
    return "Note"; // Default result if no specific type is matched
}
};  

export const activityResultMapping = {
  "Call": ["Call Attempted", "Call Completed", "Call Left Message", "Call Received"],
  "Meeting": ["Meeting Held", "Meeting Not Held"],
  "To-Do": ["To-do Done", "To-do Not Done"],
  "Appointment": ["Appointment Completed", "Appointment Not Completed"],
  "Boardroom": ["Boardroom - Completed", "Boardroom - Not Completed"],
  "Call Billing": ["Call Billing - Completed", "Call Billing - Not Completed"],
  "Email Billing": ["Email Billing - Completed", "Email Billing - Not Completed"],
  "Initial Consultation": ["Initial Consultation - Completed", "Initial Consultation - Not Completed"],
  "Mail": ["Mail - Completed", "Mail - Not Completed"],
  "Meeting Billing": ["Meeting Billing - Completed", "Meeting Billing - Not Completed"],
  "Personal Activity": [
    "Personal Activity - Completed", "Personal Activity - Not Completed",
    "Note", "Mail Received", "Mail Sent", "Email Received", "Courier Sent", "Email Sent", "Payment Received"
  ],
  "Room 1": ["Room 1 - Completed", "Room 1 - Not Completed"],
  "Room 2": ["Room 2 - Completed", "Room 2 - Not Completed"],
  "Room 3": ["Room 3 - Completed", "Room 3 - Not Completed"],
  "To Do Billing": ["To Do Billing - Completed", "To Do Billing - Not Completed"],
  "Vacation": ["Vacation - Completed", "Vacation - Not Completed", "Vacation Cancelled"],
  "Other": ["Attachment", "E-mail Attachment", "E-mail Auto Attached", "E-mail Sent"]
};

export const getResultBasedOnActivityType2 = (activityType) => {
  return activityResultMapping[activityType] || ["Note"]; // Default to "Note" if no match
};


export const getRegardingOptions = (type, existingValue) => {
  const options = {
    Call: [
      "2nd Followup", "3rd Followup", "4th Followup", "5th Followup",
      "Cold call", "Confirm appointment", "Discuss legal points", "Follow up",
      "New Client", "Nomination and Visa Lodgement", "Payment Made?",
      "Returning call", "Schedule a meeting"
    ],
    Meeting: [
      "Hourly Consult $220", "Initial Consultation Fee $165.00",
      "No appointments today (check with Mark)", "No Appointments Tonight",
      "No clients or appointments 4.00-5.00pm"
    ],
    "To-Do": [
      "Assemble catalogs", "DEADLINE REMINDER", "Deadline to lodge app",
      "Deadline to provide additional docu", "Deadline to respond",
      "DEADLINE TODAY - Email received", "Make travel arrangements",
      "Send contract", "Send follow-up letter", "Send literature",
      "Send proposal", "Send quote", "Send SMS reminder"
    ],
    Appointment: [
      "Appointment", "Call", "Dentist Appointment", "Doctor Appointment",
      "Eye Doctor Appointment", "Make Appointment", "Meeting",
      "Parent-Teacher Conference", "Shopping", "Time Off", "Workout"
    ]
  };

  let predefinedOptions = options[type] || ["General"];

  // Only add existingValue if it's not empty and not already in the options
  if (existingValue && existingValue.trim() !== "" && !predefinedOptions.includes(existingValue)) {
    predefinedOptions = [existingValue, ...predefinedOptions];
  }

  return predefinedOptions;
};


export const reminderMapping = {
  "120 minutes before": 120,
  "60 minutes before": 60,
  "30 minutes before": 30,
  "5 minutes before": 5,
  "None": 0,
};