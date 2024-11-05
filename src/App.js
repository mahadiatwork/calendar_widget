import logo from "./logo.svg";
import "./App.css";
import TaskScheduler from "./component/TaskScheduler";
import { data } from "./data/data";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
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
  const [recentColor,setRecentColor] = useState([])
  console.log({ startDateTime });
  console.log({ endDateTime });

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
              associateWith: item.What_Id,
              Type_of_Activity: item.Type_of_Activity,
              resource: item.resource,
              scheduleFor: item.Owner,
              scheduleWith: [...item.Participants],
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
              $send_notification:item?.$send_notification
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
       ZOHO.CRM.API.getOrgVariable("recent_colors").then(function (
        data
      ) {
        // Parse the string to an array and store it in the state
        const colorsArray = JSON.parse(data?.Success?.Content || "[]");
        console.log({colorsArray})
        setRecentColor(colorsArray);
      });
    }
  }, [zohoLoaded]);

  const searchDataByDate = async () => {
    setLoader(true);
    const formattedBeginDate = dayjs(startDateTime)
      .tz("Australia/Adelaide")
      .format("YYYY-MM-DDTHH:mm:ssZ");
    const formattedCloseDate = dayjs(endDateTime)
      .tz("Australia/Adelaide")
      .format("YYYY-MM-DDTHH:mm:ssZ");

    const req_data_meetings1 = {
      url: `https://www.zohoapis.com.au/crm/v3/Events/search?criteria=((Start_DateTime:greater_equal:${encodeURIComponent(
        formattedBeginDate
      )})and(End_DateTime:less_equal:${encodeURIComponent(
        formattedCloseDate
      )}))`,
      method: "GET",
      param_type: 1,
    };

    // Fetching data with custom search criteria
    const data1 = await ZOHO.CRM.CONNECTION.invoke(
      "zoho_crm_conn",
      req_data_meetings1
    );
    const eventsData = data1?.details?.statusMessage?.data || [];
    const x = eventsData.map((item, index) => {
      return {
        id: item.id,
        title: item.Event_Title,
        resource: item.resource,
        startTime: "",
        endTime: "",
        duration: item.Duration_Min,
        associateWith: item.What_Id,
        Type_of_Activity: item.Type_of_Activity,
        resource: item.resource,
        scheduleFor: item.Owner,
        scheduleWith: [...item.Participants],
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
        $send_notification:item?.$send_notification
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

  console.log({ faky: myEvents });
  return (
    <div>
      <TaskScheduler
        myEvents={myEvents}
        setEvents={setEvents}
        users={users}
        setStartDateTime={setStartDateTime}
        setEndDateTime={setEndDateTime}
        loader={loader}
        recentColor= {recentColor}
        setRecentColor={setRecentColor}
      />
      {/* <TaskScheduler /> */}
    </div>
  );
}

export default App;
