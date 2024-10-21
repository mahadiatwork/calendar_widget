import logo from "./logo.svg";
import "./App.css";
import TaskScheduler from "./component/TaskScheduler";
import { data } from "./data/data";
import { useEffect, useState } from "react";
const ZOHO = window.ZOHO;

function App() {
  const [myEvents, setEvents] = useState([]);
  const [zohoLoaded, setZohoLoaded] = useState(false);
  const [recordId, setRecordId] = useState();
  const [moduleName, setModuleName] = useState();

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
          console.log("hello");
            const x = d?.data.map((item,index)=>{
              return {
                id:item.id,
                title: item.Event_Title,
                resource:item.resource,
                startTime: "",
                endTime: "",
                duration: item.Duration_Min,
                associateWith: item.What_Id,
                Type_of_Activity: item.Type_of_Activity,
                resource: item.resource,
                scheduleFor:'',
                scheduleWith:item.Participants,
                location: item.Venue,
                priority: item.Event_Priority,
                ringAlarm: item.Remind_At,
                occurrence: item.Recurring_Activity,
                start: item.Start_DateTime,
                end: item.End_DateTime,
                noEndDate: false,
                color: item.Colour,
                Banner:item.Banner,
                Description:item?.Description
              }
            })
            setEvents(x)
        }
        // setEvents(d?.data)
      });
    }
  }, [zohoLoaded]);

  console.log({faky:myEvents})
  return (
    <div>
      <TaskScheduler myEvents={myEvents} setEvents={setEvents}/>
      {/* <TaskScheduler /> */}
    </div>
  );
}

export default App;
