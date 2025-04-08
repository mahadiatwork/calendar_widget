import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(utc);
dayjs.extend(timezone);


const activityType = [
  { type: "Meeting", resource: 1 },
  { type: "To-Do", resource: 2 },
  { type: "Appointment", resource: 3 },
  { type: "Boardroom", resource: 4 },
  { type: "Call Billing", resource: 5 },
  { type: "Email Billing", resource: 6 },
  { type: "Initial Consultation", resource: 7 },
  { type: "Call", resource: 8 },
  { type: "Mail", resource: 9 },
  { type: "Meeting Billing", resource: 10 },
  { type: "Personal Activity", resource: 11 },
  { type: "Room 1", resource: 12 },
  { type: "Room 2", resource: 13 },
  { type: "Room 3", resource: 14 },
  { type: "To Do Billing", resource: 15 },
  { type: "Vacation", resource: 16 },
];

function getResourceByType(type) {
  const match = activityType.find(item => item.type === type);
  return match ? match.resource : null;
}

export function transformFormSubmission(data, individualParticipant = null) {


  const transformScheduleWithToParticipants = (scheduleWith) => {
    return scheduleWith.map((contact) => ({
      Full_Name: contact?.Full_Name || null,
      type: "contact",
      participant: contact?.participant ?? contact?.id ?? null,
    }));
  };


  const dayOfMonth = dayjs(data?.startTime).date();
  const dayName = dayjs(data?.startTime).format("dd");
  const monthNumber = dayjs(data?.startTime).format("MM");
  const customEndTime =
    data.noEndDate && data.occurrence === "daily"
      ? dayjs(data?.startTime).add(70, "day").format("YYYY-MM-DD")
      : data?.noEndDate && data?.occurrence === "weekly"
        ? dayjs(data?.startTime).add(10, "month").format("YYYY-MM-DD")
        : data?.noEndDate && data?.occurrence === "monthly"
          ? dayjs(data?.startTime).add(12, "month").format("YYYY-MM-DD")
          : data?.noEndDate && data?.occurrence === "yearly"
            ? dayjs(data?.startTime).add(2, "year").format("YYYY-MM-DD")
            : dayjs(data?.endTime).format("YYYY-MM-DD");

  const participants = individualParticipant
    ? [
      {
        Full_Name: individualParticipant?.Full_Name || null,
        type: "contact",
        participant: individualParticipant?.participant || null,
      },
    ]
    : transformScheduleWithToParticipants(data?.scheduledWith || []);


  // Initialize transformedData
  let transformedData = {
    ...data,
    Event_Title: data?.title,
    Start_DateTime: dayjs(data?.start)
      .tz("Australia/Adelaide")
      .format("YYYY-MM-DDTHH:mm:ssZ"), // Format `start` to ISO with timezone
    End_DateTime: dayjs(data?.end)
      .tz("Australia/Adelaide")
      .format("YYYY-MM-DDTHH:mm:ssZ"), // Format `end` to ISO with timezone
    Description: data?.Description, // Map `description` to `Description`
    Event_Priority: data?.priority, // Map `priority` to `Event_Priority`
    Owner: {
      id: data.scheduleFor?.id,
    },
    $send_notification: data?.send_notification,

    se_module: "Accounts",

    Participants: participants,
    Duration_Min: data.duration.toString(),
    Venue: data.location,
    Colour: data.color,
    Send_Reminders: data.Send_Reminders
  };

  // Add What_Id only if id exists
  if (data.associateWith?.id) {
    transformedData.What_Id = {
      id: data.associateWith.id,
    };
  }

  const resourceValue = getResourceByType(data.Type_of_Activity);

  transformedData.resource = resourceValue;


  if (data.Send_Reminders) {
    const startTime = dayjs(data.start);

    let modifiedReminderDate = null;

    if (data.Reminder_Text === "At time of meeting") {
      modifiedReminderDate = startTime.tz("Australia/Adelaide")
        .format("YYYY-MM-DDTHH:mm:ssZ");
    } else {
      const reminderTime = startTime.subtract(parseInt(data?.Reminder_Text.split(" ")[0]), 'minute');
      modifiedReminderDate = reminderTime.tz("Australia/Adelaide")
        .format("YYYY-MM-DDTHH:mm:ssZ");
      transformedData.Remind_At = modifiedReminderDate;
      // transformedData.Participant_Reminder = modifiedReminderDate;
      transformedData.User_Reminder = modifiedReminderDate;
    }
    transformedData.Send_Reminders = true;
  }

  if(data.Send_Invites){
    const startTime = dayjs(data.start);

    let modifiedReminderDate = null;

    if (data.Reminder_Text === "At time of meeting") {
      modifiedReminderDate = startTime.tz("Australia/Adelaide")
        .format("YYYY-MM-DDTHH:mm:ssZ");
    } else {
      const reminderTime = startTime.subtract(parseInt(data?.Reminder_Text.split(" ")[0]), 'minute');
      modifiedReminderDate = reminderTime.tz("Australia/Adelaide")
        .format("YYYY-MM-DDTHH:mm:ssZ");
      transformedData.Remind_At = modifiedReminderDate;
      transformedData.User_Reminder = modifiedReminderDate;
    }
    transformedData.send_notification = true;
  }

  // Validate and Add Recurring_Activity
  const validOccurrences = ["daily", "weekly", "monthly", "yearly"]; // Define valid occurrences
  if (
    typeof data?.occurrence === "string" &&
    validOccurrences.includes(data?.occurrence.toLowerCase())
  ) {
    transformedData.Recurring_Activity = {
      RRULE: `FREQ=${data.occurrence.toUpperCase()};INTERVAL=1;UNTIL=${customEndTime}${data.occurrence === "weekly"
        ? `;BYDAY=${dayName.toUpperCase()}`
        : data.occurrence === "monthly"
          ? `;BYMONTHDAY=${dayOfMonth}`
          : data.occurrence === "yearly"
            ? `;BYMONTH=${monthNumber};BYMONTHDAY=${dayOfMonth}`
            : ""
        };DTSTART=${dayjs(data.startTime).format("YYYY-MM-DD")}`,
    };
  }

  if (
    transformedData.Remind_At == null ||
    transformedData.Remind_At == "Invalid Date" ||
    transformedData.Remind_At == "" ||
    transformedData.Reminder_Text == ""
  ) {
    delete transformedData.Remind_At;
    delete transformedData.Reminder_Text;
  }

  // Remove null or undefined keys
  Object.keys(transformedData).forEach((key) => {
    if (transformedData[key] === null || transformedData[key] === undefined) {
      delete transformedData[key];
    }
  });

  return transformedData;
}


