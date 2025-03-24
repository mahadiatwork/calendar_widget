import logo from "./logo.svg";
import "./App.css";
import TaskScheduler from "./component/TaskScheduler";
import { data } from "./data/data";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { radioClasses } from "@mui/material";
const ZOHO = window.ZOHO;

dayjs.extend(utc);
dayjs.extend(timezone);

function App() {
  const [myEvents, setEvents] = useState([]);
  const [zohoLoaded, setZohoLoaded] = useState(false);
  const [users, setUsers] = useState([]);
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [loader, setLoader] = useState(false);
  const [recentColor, setRecentColor] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState(null);
  // console.log({ startDateTime });
  // console.log({ endDateTime });

  async function initZoho() {
    ZOHO.embeddedApp.on("PageLoad", async function (data) {
      // console.log("faky", data);
      // setRecordId(data.EntityId[0]);
      // setModuleName(data.Entity);
    });
    ZOHO.embeddedApp.init().then(() => {
      setZohoLoaded(true);
    });
  }

  useEffect(() => {
    initZoho();
  }, []);

  useEffect(() => {
    // fetchTemplateList();
    if (zohoLoaded) {
      ZOHO.CRM.CONFIG.getCurrentUser().then(function (data) {
        setLoggedInUser(data?.users[0]);
      });

      ZOHO.CRM.API.getAllRecords({
        Entity: "Events",
        sort_order: "asc",
        per_page: 200,
        page: 1,
      }).then(function (d) {
        console.log(d);
        if (d?.data) {
          const x = d?.data.map((item, index) => {
            return {
              id: item.id,
              title: item.Event_Title,
              resource: item.resource,
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
          console.log({ x });
          setEvents(x);
        }
        // setEvents(d?.data)
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
    }
  }, [zohoLoaded]);

  const searchDataByDate = async () => {
    // console.log({ startDateTime });
    // console.log({ endDateTime });
    // return;
    setLoader(true);
    // let formattedBeginDate = dayjs(startDateTime)
    //   .startOf("day")
    //   .utcOffset(570) // Set offset to +09:30 (570 minutes)
    //   .set("hour", 0)
    //   .set("minute", 0)
    //   .set("second", 0)
    //   .format("YYYY-DD-MMTHH:mm:ssZ");
    // let formattedCloseDate = dayjs(startDateTime)
    //   .utcOffset(570)
    //   .set("hour", 23)
    //   .set("minute", 59)
    //   .set("second", 59)
    //   .format("YYYY-DD-MMTHH:mm:ssZ");

    // return;

    // let formattedBeginDate = "2024-10-16T00:00:01+10:30";
    // let formattedCloseDate = "2024-10-16T23:59:00+10:30";
    console.log({ startDateTime });
    console.log({ endDateTime });

    const req_data_meetings1 = {
      url: `https://www.zohoapis.com.au/crm/v3/Events/search?criteria=((Start_DateTime:greater_equal:${encodeURIComponent(
        startDateTime
      )})and(End_DateTime:less_equal:${encodeURIComponent(endDateTime)}))`,
      method: "GET",
      param_type: 1,
    };


    var conn_name = "zoho_crm_conn";


    const req_data_meetings2 = {
      parameters: {
        select_query: `
          SELECT 
            id, 
            Event_Title, 
            Start_DateTime, 
            End_DateTime, 
            Duration_Min, 
            What_Id, 
            Type_of_Activity, 
            resource, 
            Owner,
            Venue, 
            Event_Priority, 
            Remind_At, 
            Recurring_Activity, 
            Colour, 
            Banner, 
            Description, 
            Regarding, 
            Reminder_Text, 
            Send_Reminders, 
            Event_Status 
          FROM Events 
          WHERE 
            (Start_DateTime >= '${startDateTime}') 
            AND (End_DateTime <= '${endDateTime}')
        `,
      },
      method: "POST",
      url: "https://www.zohoapis.com.au/crm/v3/coql",
      param_type: 2,
    };
    

    // Fetching data with custom search criteria
    const data1 = await ZOHO.CRM.CONNECTION.invoke(
      "zoho_crm_conn",
      req_data_meetings1
    );
<<<<<<< Updated upstream
    console.log({ data1 });
    const eventsData = data1?.details?.statusMessage?.data || [];
    const x = eventsData.map((item, index) => {
=======

    let combinedEvents = [];

    await ZOHO.CRM.CONNECTION.invoke(conn_name, req_data_meetings2).then(function (data) {
    
      // Extract the array of events safely
      const events = data?.details?.statusMessage?.data || [];
    
      console.log("Extracted Events Array:", events);
      combinedEvents = [...events];
    });

    const eventsData = searchResp?.details?.statusMessage?.data || [];



    const allMeetings = await ZOHO.CRM.API.getAllRecords({
      Entity: "Events",
      sort_order: "asc",
      per_page: 200,
      page: 1,
    });

    const allMeetingsData = allMeetings?.data || [];

    // combinedEvents = [...eventsData, ...allMeetingsData];





    const eventsDataResult = combinedEvents.map((item, index) => {
>>>>>>> Stashed changes
      return {
        id: item.id,
        title: item.Event_Title,
        resource: item.resource,
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
        scheduledWith: item?.Participants?.length > 0 && item?.Participants.map((participant) => ({
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
    setEvents(x);
    console.log({ data1 });
    setLoader(false);
  };
  useEffect(() => {
    if (startDateTime !== "" && endDateTime !== "") {
      searchDataByDate();
    }
  }, [startDateTime, endDateTime]);

  console.log({ faky: loggedInUser });
  // console.log({ users });
  return (
    <div>
      <TaskScheduler
        myEvents={myEvents}
        setEvents={setEvents}
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
