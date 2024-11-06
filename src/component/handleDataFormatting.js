import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(utc);
dayjs.extend(timezone);

export function transformFormSubmission(data, individualParticipant = null) {
  const transformScheduleWithToParticipants = (scheduleWith) => {
    return scheduleWith.map((contact) => ({
      Full_Name: contact?.Full_Name || null,
      type: "contact",
      participant: contact?.participant || null,
    }));
  };
console.log({individualParticipant})
  const dayOfMonth = dayjs(data.startTime).date();
  const dayName = dayjs(data.startTime).format("dd");
  const monthNumber = dayjs(data.startTime).format("MM");
  const customEndTime =
    data.noEndDate && data.occurrence === "daily"
      ? dayjs(data.startTime).add(70, "day").format("YYYY-MM-DD")
      : data.noEndDate && data.occurrence === "weekly"
      ? dayjs(data.startTime).add(10, "month").format("YYYY-MM-DD")
      : data.noEndDate && data.occurrence === "monthly"
      ? dayjs(data.startTime).add(12, "month").format("YYYY-MM-DD")
      : data.noEndDate && data.occurrence === "yearly"
      ? dayjs(data.startTime).add(2, "year").format("YYYY-MM-DD")
      : dayjs(data.endTime).format("YYYY-MM-DD");

  const participants = individualParticipant
    ? [
        {
          Full_Name: individualParticipant.Full_Name || null,
          type: "contact",
          participant: individualParticipant.participant || null,
        },
      ]
    : transformScheduleWithToParticipants(data.scheduledWith || []);

  let transformedData = {
    ...data,
    Event_Title: data.title,
    Remind_At: dayjs(data.Remind_At)
      .tz("Australia/Adelaide")
      .format("YYYY-MM-DDTHH:mm:ssZ"),
    Start_DateTime: dayjs(data.start)
      .tz("Australia/Adelaide")
      .format("YYYY-MM-DDTHH:mm:ssZ"), // Format `start` to ISO with timezone
    End_DateTime: dayjs(data.end)
      .tz("Australia/Adelaide")
      .format("YYYY-MM-DDTHH:mm:ssZ"), // Format `end` to ISO with timezone
    Description: data.Description, // Map `description` to `Description`
    Event_Priority: data.priority, // Map `priority` to `Event_Priority`
    Owner: {
      id: data.scheduleFor.id,
    },
    Recurring_Activity: {
      RRULE: `FREQ=${data?.occurrence?.toUpperCase()};INTERVAL=1;UNTIL=${customEndTime}${
        data.occurrence === "weekly"
          ? `;BYDAY=${dayName.toUpperCase()}`
          : data.occurrence === "monthly"
          ? `;BYMONTHDAY=${dayOfMonth}`
          : data.occurrence === "yearly"
          ? `;BYMONTH=${monthNumber};BYMONTHDAY=${dayOfMonth}`
          : ""
      };DTSTART=${dayjs(data.startTime).format("YYYY-MM-DD")}`,
    },

    // Updated `What_Id` with both name and id from `associateWith`
    What_Id: data.associateWith
      ? {
          id: data.associateWith.id || null, // Assign id from associateWith
        }
      : null,
    se_module: "Accounts",

    // Combine the manually set participants and those from `scheduleWith`
    Participants: participants,
    Duration_Min: data.duration.toString(),
    Venue: data.location,
    Colour: data.color,
  };

  if (
    transformedData.Recurring_Activity.RRULE ==="FREQ=ONCE;INTERVAL=1;UNTIL=Invalid Date;DTSTART=Invalid Date") {
    delete transformedData.Recurring_Activity;
  }
  //   delete transformedData.scheduleWith;
  //   delete transformedData.scheduleFor;
  //   delete transformedData.description;

  Object.keys(transformedData).forEach((key) => {
    if (transformedData[key] === null || transformedData[key] === undefined) {
      delete transformedData[key];
    }
  });

  return transformedData;
}
