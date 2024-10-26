import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(utc);
dayjs.extend(timezone);

export function transformFormSubmission(data,individualParticipant = null) {
  const transformScheduleWithToParticipants = (scheduleWith) => {
    return scheduleWith.map((contact) => ({
      name: contact?.name || null,
      type: "contact",
      participant: contact?.participant || null,
    }));
  };

  const participantsFromScheduleWith = data.scheduleWith
    ? transformScheduleWithToParticipants(data.scheduleWith)
    : [];
    const participants = individualParticipant
    ? [
        {
          name: individualParticipant.name || null,
          type: "contact",
          participant: individualParticipant.participant || null,
        },
      ]
    : transformScheduleWithToParticipants(data.scheduledWith || []);

  let transformedData = {
    ...data,
    Event_Title:data.title,
    Remind_At: dayjs(data.Remind_At).tz('Australia/Adelaide').format('YYYY-MM-DDTHH:mm:ssZ'),
    Start_DateTime:dayjs(data.start).tz('Australia/Adelaide').format('YYYY-MM-DDTHH:mm:ssZ'), // Format `start` to ISO with timezone
    End_DateTime: dayjs(data.end).tz('Australia/Adelaide').format('YYYY-MM-DDTHH:mm:ssZ'), // Format `end` to ISO with timezone
    Description: data.Description, // Map `description` to `Description`
    Event_Priority: data.priority, // Map `priority` to `Event_Priority`
    Owner: {
      id: data.scheduleFor.id,
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
    Venue:data.location,
    Colour:data.color
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
