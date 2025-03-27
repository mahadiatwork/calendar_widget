import "./App.css";
import TaskScheduler from "./component/TaskScheduler";
import { useEffect, useState, useCallback } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { Box, CircularProgress } from "@mui/material";
const ZOHO = window.ZOHO;

dayjs.extend(utc);
dayjs.extend(timezone);

function App() {
  const [startDateTime, setStartDateTime] = useState(
    dayjs().startOf("month").format("YYYY-MM-DD") + "T00:00:00+10:30"
  );
  const [endDateTime, setEndDateTime] = useState(
    dayjs().endOf("month").format("YYYY-MM-DD") + "T23:59:59+10:30"
  );
  const [myEvents, setMyEvents] = useState([]);
  const [zohoLoaded, setZohoLoaded] = useState(false);
  const [users, setUsers] = useState([]);
  const [loader, setLoader] = useState(false);
  const [recentColor, setRecentColor] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState(null);

  const getUserDataAndColor = async () => {
    try {
      ZOHO.CRM.CONFIG.getCurrentUser().then(function (data) {
        ZOHO.CRM.API.getRecord({
          Entity: "users",
          approved: "both",
          RecordID: data?.users[0]?.id,
        }).then(function (data) {
          setLoggedInUser(data?.users[0]);
        });
      });

      ZOHO.CRM.API.getAllRecords({
        Entity: "users",
        sort_order: "asc",
        per_page: 100,
        page: 1,
      }).then((usersResponse) => {
        let temp = usersResponse?.users?.filter((user, index) => {
          return user.status === "active";
          // if (user.status === "active") {
          //   setUsers((prev) => [...prev, user]);
          // }
        });
        setUsers(temp);
      });

      // Get organization variable
      ZOHO.CRM.API.getOrgVariable("recent_colors").then(function (data) {
        // Parse the string to an array and store it in the state
        const colorsArray = JSON.parse(data?.Success?.Content || "[]");
        setRecentColor(colorsArray);
      });
    } catch (error) {}
  };

  const searchDataByDate = useCallback(async () => {
    setLoader(true);
    setMyEvents([]);
    const req_data_meetings1 = {
      url: `https://www.zohoapis.com.au/crm/v3/Events/search?criteria=((Start_DateTime:greater_equal:${encodeURIComponent(
        startDateTime
      )})and(End_DateTime:less_equal:${encodeURIComponent(
        endDateTime
      )}))&per_page=200`,
      method: "GET",
      param_type: 1,
    };

    // Fetching data with custom search criteria
    const searchResp = await ZOHO.CRM.CONNECTION.invoke(
      "zoho_crm_conn",
      req_data_meetings1
    );

    const eventsData = searchResp?.details?.statusMessage?.data || [];

    const allMeetings = await ZOHO.CRM.API.getAllRecords({
      Entity: "Events",
      sort_order: "desc",
      sort_by: "Modified_Time",
      per_page: 200,
      page: 1,
    });

    const allMeetingsData = allMeetings?.data || [];

    // Filter meetings within date range
    const meetingsWithinRange = allMeetingsData.filter((meeting) => {
      const meetingStart = meeting.Start_DateTime;
      return meetingStart >= startDateTime && meetingStart <= endDateTime;
    });

    // Create a Set of existing IDs for quick lookup
    const existingIds = new Set(eventsData.map((event) => event.id));

    // Combine unique meetings that don't already exist
    const uniqueNewMeetings = meetingsWithinRange.filter(
      (meeting) => !existingIds.has(meeting.id)
    );

    // Combine into a final array
    const combinedEvents = [...eventsData, ...uniqueNewMeetings];

    // const req_data_meetings2 = {
    //   parameters: {
    //     select_query: `
    //       SELECT
    //         id,
    //         Event_Title,
    //         Start_DateTime,
    //         End_DateTime,
    //         Duration_Min,
    //         What_Id,
    //         Type_of_Activity,
    //         resource,
    //         Owner,
    //         Venue,
    //         Event_Priority,
    //         Remind_At,
    //         Recurring_Activity,
    //         Colour,
    //         Banner,
    //         Description,
    //         Regarding,
    //         Reminder_Text,
    //         Send_Reminders,
    //         Participants,

    //         Event_Status
    //       FROM Events
    //       WHERE
    //         (Start_DateTime >= '${startDateTime}')
    //         AND (End_DateTime <= '${endDateTime}')
    //     `,
    //   },
    //   method: "POST",
    //   url: "https://www.zohoapis.com.au/crm/v3/coql",
    //   param_type: 2,
    // };

    // await ZOHO.CRM.CONNECTION.invoke(conn_name, req_data_meetings2).then(function (data) {

    //   // Extract the array of events safely
    //   const events = data?.details?.statusMessage?.data || [];

    //   console.log("data using coql:", events);
    //   // combinedEvents = [...events];
    // });

    const eventsDataResult = combinedEvents.map((item, index) => {
      return {
        id: item.id,
        title: item.Event_Title,
        startTime: "",
        endTime: "",
        duration: item.Duration_Min,
        associateWith: {
          Account_Name: item?.What_Id?.name,
          id: item?.What_Id?.id,
        },
        Type_of_Activity: item.Type_of_Activity,
        resource: item.resource,
        scheduleFor: item.Owner,
        scheduledWith: item?.Participants.map((participant) => ({
          Full_Name: participant.name,
          participant: participant.participant,
          type: participant.type,
        })),
        location: item.Venue,
        priority: item.Event_Priority,
        Remind_At: item.Remind_At,
        occurrence: item.Recurring_Activity,
        start: item.Start_DateTime,
        end: item.End_DateTime,
        noEndDate: false,
        color: item.Colour,
        Banner: item.Banner,
        Description: item?.Description,
        Regarding: item?.Regarding,
        Reminder_Text: item?.Reminder_Text,
        send_notification: item?.$send_notification,
        Send_Reminders: item?.Send_Reminders,
        Event_Status: item?.Event_Status,
      };
    });

    setMyEvents(eventsDataResult);
    setLoader(false);
  }, [startDateTime, endDateTime]);

  useEffect(() => {
    ZOHO.embeddedApp.on("PageLoad", async function (data) {
      // setRecordId(data.EntityId[0]);
      // setModuleName(data.Entity);
    });
    ZOHO.embeddedApp.init().then(() => {
      setZohoLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (zohoLoaded) {
      getUserDataAndColor();
      searchDataByDate();
    }
  }, [zohoLoaded, searchDataByDate]);

  if (loggedInUser === null) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress size={40} />
      </Box>
    );
  }

  return (
    <div>
      <TaskScheduler
        myEvents={myEvents}
        setMyEvents={setMyEvents}
        users={users}
        startDateTime={startDateTime}
        setStartDateTime={setStartDateTime}
        endDateTime={endDateTime}
        setEndDateTime={setEndDateTime}
        loader={loader}
        setLoader={setLoader}
        recentColor={recentColor}
        setRecentColor={setRecentColor}
        loggedInUser={loggedInUser}
      />
      {/* <TaskScheduler /> */}
    </div>
  );
}

export default App;
