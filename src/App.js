import "./App.css";
import TaskScheduler from "./component/TaskScheduler";
import { useEffect, useState, useCallback } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
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
        usersResponse?.users?.map((user, index) => {
          if (user.status === "active") {
            setUsers((prev) => [...prev, user]);
          }
        });
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
    const eventsDataResult = eventsData.map((item, index) => {
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
      };
    });
    console.log("searchDataByDate", eventsDataResult, {
      startDateTime,
      endDateTime,
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

  // useEffect(() => {
  //   // fetchTemplateList();
  //   if (zohoLoaded) {
  //     ZOHO.CRM.CONFIG.getCurrentUser().then(function (data) {
  //       ZOHO.CRM.API.getRecord({
  //         Entity: "users",
  //         approved: "both",
  //         RecordID: data?.users[0]?.id,
  //       }).then(function (data) {
  //         setLoggedInUser(data?.users[0]);
  //       });
  //     });

  //     ZOHO.CRM.API.getAllRecords({
  //       Entity: "Events",
  //       sort_order: "asc",
  //       per_page: 200,
  //       page: 1,
  //     }).then(function (respData) {
  //       if (respData?.data) {
  //         const resp = respData?.data.map((item, index) => {
  //           return {
  //             id: item.id,
  //             title: item.Event_Title,
  //             resource: item.resource,
  //             startTime: "",
  //             endTime: "",
  //             duration: item.Duration_Min,
  //             associateWith: {
  //               Account_Name: item?.What_Id?.name,
  //               id: item?.What_Id?.id,
  //             },
  //             Type_of_Activity: item.Type_of_Activity,
  //             resource: item.resource,
  //             scheduleFor: item.Owner,
  //             scheduledWith: item?.Participants.map((participant) => ({
  //               Full_Name: participant.name,
  //               participant: participant.participant,
  //               type: participant.type,
  //             })),
  //             location: item.Venue,
  //             priority: item.Event_Priority,
  //             Remind_At: item.Remind_At,
  //             occurrence: item.Recurring_Activity,
  //             start: item.Start_DateTime,
  //             end: item.End_DateTime,
  //             noEndDate: false,
  //             color: item.Colour,
  //             Banner: item.Banner,
  //             Description: item?.Description,
  //             Regarding: item?.Regarding,
  //             Reminder_Text: item?.Reminder_Text,
  //             send_notification: item?.$send_notification,
  //           };
  //         });
  //         console.log("myEvents when zohoLoaded", resp);
  //         setMyEvents(resp);
  //       }
  //     });

  //     ZOHO.CRM.API.getAllRecords({
  //       Entity: "users",
  //       sort_order: "asc",
  //       per_page: 100,
  //       page: 1,
  //     }).then((usersResponse) => {
  //       usersResponse?.users?.map((user, index) => {
  //         if (user.status === "active") {
  //           setUsers((prev) => [...prev, user]);
  //         }
  //       });
  //     });

  //     // Get organization variable
  //     ZOHO.CRM.API.getOrgVariable("recent_colors").then(function (data) {
  //       // Parse the string to an array and store it in the state
  //       const colorsArray = JSON.parse(data?.Success?.Content || "[]");
  //       setRecentColor(colorsArray);
  //     });
  //   }
  // }, [zohoLoaded]);

  return (
    <div>
      <TaskScheduler
        myEvents={myEvents}
        setMyEvents={setMyEvents}
        users={users}
        setStartDateTime={setStartDateTime}
        startDateTime={startDateTime}
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
