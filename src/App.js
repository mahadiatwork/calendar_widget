import logo from './logo.svg';
import './App.css';
import TaskScheduler from './component/TaskScheduler';
import { data } from "./data/data";
import { useEffect, useState } from 'react';

function App() {
  const [myEvents,setEvents] = useState([])

  useEffect(()=>{
    const x = data.map((item,index)=>{
      return {
        id:item.id,
        title: item.Event_Title,
        startTime: "",
        endTime: "",
        duration: "",
        associateWith: "",
        Type_of_Activity: item.Type_of_Activity,
        resource: item.resource,
        scheduleFor:'',
        scheduleWith:[],
        location: item.Check_In_Address,
        priority: item.Event_Priority,
        ringAlarm: "",
        occurrence: "once",
        start: item.Start_DateTime,
        end: item.End_DateTime,
        noEndDate: false,
        color: item.Colour,
        Banner:item.Banner,
      }
    })
    setEvents(x)
  },[])

  console.log({faky:myEvents})
  return (
    <div >
      <TaskScheduler myEvents={myEvents} setEvents={setEvents}/>
    </div>
  );
}

export default App;
