import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(utc);
dayjs.extend(timezone);

export function transformFormSubmission(data) {
  const transformScheduleWithToParticipants = (scheduleWith) => {
    return scheduleWith.map((contact) => ({
      Email: contact.Email || null,
      name: contact.Full_Name || null,
      invited: false,
      type: "contact",
      participant: contact.id || null,
      status: "not_known",
    }));
  };

  const participantsFromScheduleWith = data.scheduleWith
    ? transformScheduleWithToParticipants(data.scheduleWith)
    : [];
  let transformedData = {
    ...data,
    Event_Title:data.title,
    Reminder_at: dayjs(data.Remind_At).tz('Australia/Adelaide').format('YYYY-MM-DDTHH:mm:ssZ'),
    Start_DateTime:dayjs(data.start).tz('Australia/Adelaide').format('YYYY-MM-DDTHH:mm:ssZ'), // Format `start` to ISO with timezone
    End_DateTime: dayjs(data.end).tz('Australia/Adelaide').format('YYYY-MM-DDTHH:mm:ssZ'), // Format `end` to ISO with timezone
    Description: data.Description, // Map `description` to `Description`
    Event_Priority: data.priority, // Map `priority` to `Event_Priority`

    // Updated `What_Id` with both name and id from `associateWith`
    What_Id: data.associateWith
      ? {
          id: data.associateWith.id || null, // Assign id from associateWith
        }
      : null,
    se_module: "Accounts",

    // Combine the manually set participants and those from `scheduleWith`
    Participants: data.scheduledWith,
    Duration_Min: data.duration.toString(),
  };
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
