import {
  CalendarNav,
  CalendarNext,
  CalendarPrev,
  CalendarToday,
  Datepicker,
  Draggable,
  Dropcontainer,
  Dropdown,
  Eventcalendar,
  Input,
  Popup,
  Segmented,
  SegmentedGroup,
  Select,
  setOptions,
  Textarea,
  Toast,
} from "@mobiscroll/react";
import PropTypes from "prop-types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "@mobiscroll/react/dist/css/mobiscroll.min.css";
import "./test.css";
import EventForm from "./formComponent/EventForm";
import { Box, Button, Checkbox, FormControl, InputLabel, ListItemText, MenuItem, Modal, OutlinedInput, TextField } from "@mui/material";
import CustomTextField from "./atom/CustomTextField";
import DrawerComponent from "./DrawerComponent";

setOptions({
  theme: "ios",
  themeVariant: "light",
});

const formatTime = (date, hour) => {
  const newDate = new Date(date); // create a copy of the date
  newDate.setHours(hour, 0, 0, 0); // set the specific hour (6 or 7 AM)
  return newDate.toISOString().slice(0, 16); // get the date in ISO format (YYYY-MM-DDTHH:mm)
};

const now = new Date();
const startTime = formatTime(now, 6); // Get 6 AM
const endTime = formatTime(now, 8); // Get 7 AM
const today = now.toISOString().slice(0, 16);
const yesterday = new Date(
  now.getFullYear(),
  now.getMonth(),
  now.getDate() - 1
);

const Appointment = (props) => {
  const [draggable, setDraggable] = useState();

  const setDragElm = useCallback((elm) => {
    setDraggable(elm);
  }, []);

  const event = props.data;
  const eventLength =
    Math.abs(new Date(event.end).getTime() - new Date(event.start).getTime()) /
    (60 * 60 * 1000);

  return (
    <div>
      {!event.hide && (
        <div
          ref={setDragElm}
          className="docs-appointment-task"
          style={{ background: event.color }}
        >
          <div>{event.title}</div>
          <div>{eventLength + " hour" + (eventLength > 1 ? "s" : "")}</div>
          <Draggable dragData={event} element={draggable} />
        </div>
      )}
    </div>
  );
};

Appointment.propTypes = {
  data: PropTypes.object.isRequired,
};

const TaskScheduler = ({myEvents,setEvents}) => {
  // const [myEvents, setEvents] = useState([
  //   {
  //     id: "job1",
  //     title: "hello 1",
  //     startTime: "2024-10-16T09:51:41.349Z",
  //     endTime: "2024-10-16T10:51:33.490Z",
  //     duration: 120,
  //     associateWith: "mark",
  //     Type_of_Activity: "room_1",
  //     resource: 12,
  //     scheduleFor: 19,
  //     scheduleWith: ["tony", "mahadi", "fahim"],
  //     location: "halishahar,ctg",
  //     priority: 'low',
  //     Remind_At: "2024-10-16T15:50",
  //     occurrence: "monthly",
  //     start: "2024-10-16T08:35:11.320Z",
  //     end: "2024-10-16T12:22:24.587Z",
  //     noEndDate: false,
  //     color: "#3498db",
  //     Banner: false,
  //     editable: false,
  //   },
  //   {
  //     id: "job2",
  //     title: "hello 2",
  //     startTime: "2024-10-16T14:33:50.110Z",
  //     endTime: "2024-10-16T15:33:07.297Z",
  //     duration: 60,
  //     associateWith: "mark",
  //     Type_of_Activity: "todo_billing",
  //     resource: 15,
  //     scheduleFor: 21,
  //     scheduleWith: ["tony", "mahadi", "fahim"],
  //     location: "uttara,dhaka",
  //     priority: 'medium',
  //     Remind_At: "2024-10-16T05:10",
  //     occurrence: "daily",
  //     start: "2024-10-16T13:43:33.144Z",
  //     end: "2024-10-16T08:11:21.703Z",
  //     noEndDate: false,
  //     color: "#8c225a",
  //     Banner: false,
  //     editable: false,
  //   },
  //   {
  //     id: "job3",
  //     title: "hello 3",
  //     startTime: "2024-10-16T17:58:01.234Z",
  //     endTime: "2024-10-16T18:58:57.743Z",
  //     duration: 30,
  //     associateWith: "mark",
  //     Type_of_Activity: "initial_consultation",
  //     resource: 7,
  //     scheduleFor: 17,
  //     scheduleWith: ["tony", "mahadi", "fahim"],
  //     location: "uttara,dhaka",
  //     priority: 'high',
  //     Remind_At: "2024-10-16T11:59",
  //     occurrence: "weekly",
  //     start: "2024-10-16T16:52:57.099Z",
  //     end: "2024-10-16T18:39:17.269Z",
  //     noEndDate: false,
  //     color: "#8c225a",
  //     Banner: false,
  //     editable: false,
  //   },
  //   {
  //     id: "job4",
  //     title: "hello 4",
  //     startTime: "2024-10-16T20:00:40.999Z",
  //     endTime: "2024-10-16T20:49:18.953Z",
  //     duration: 60,
  //     associateWith: "mark",
  //     Type_of_Activity: "meeting",
  //     resource: 1,
  //     scheduleFor: 26,
  //     scheduleWith: ["tony", "mahadi", "fahim"],
  //     location: "halishahar,ctg",
  //     priority: 'low',
  //     Remind_At: "2024-10-16T14:58",
  //     occurrence: "monthly",
  //     start: "2024-10-16T03:00:41.929Z",
  //     end: "2024-10-16T08:22:47.996Z",
  //     noEndDate: false,
  //     color: "#2ecc71",
  //     Banner: false,
  //     editable: false,
  //   },
  //   {
  //     id: "job5",
  //     title: "hello 5",
  //     startTime: "2024-10-16T08:02:52.513Z",
  //     endTime: "2024-10-16T08:26:15.556Z",
  //     duration: 30,
  //     associateWith: "mark",
  //     Type_of_Activity: "meeting",
  //     resource: 1,
  //     scheduleFor: 21,
  //     scheduleWith: ["tony", "mahadi", "fahim"],
  //     location: "agrabad,ctg",
  //     priority: 'medium',
  //     Remind_At: "2024-10-16T16:00",
  //     occurrence: "daily",
  //     start: "2024-10-16T02:51:29.625Z",
  //     end: "2024-10-16T17:27:37.238Z",
  //     noEndDate: false,
  //     color: "#3498db",
  //     Banner: false,
  //     editable: false,
  //   },
  //   {
  //     id: "job6",
  //     title: "hello 6",
  //     startTime: "2024-10-16T07:15:21.123Z",
  //     endTime: "2024-10-16T07:45:21.123Z",
  //     duration: 30,
  //     associateWith: "tony",
  //     Type_of_Activity: "mail",
  //     resource: 9,
  //     scheduleFor: 15,
  //     scheduleWith: ["tony", "mahadi", "fahim"],
  //     location: "uttara,dhaka",
  //     priority: 'high',
  //     Remind_At: "2024-10-16T07:00",
  //     occurrence: "daily",
  //     start: "2024-10-16T07:15:00.000Z",
  //     end: "2024-10-16T07:45:00.000Z",
  //     noEndDate: false,
  //     color: "#e74c3c",
  //     Banner: false,
  //     editable: false,
  //   },
  //   {
  //     id: "job7",
  //     title: "hello 7",
  //     startTime: "2024-10-16T10:05:10.321Z",
  //     endTime: "2024-10-16T10:35:10.321Z",
  //     duration: 30,
  //     associateWith: "mahadi",
  //     Type_of_Activity: "room_3",
  //     resource: 14,
  //     scheduleFor: 25,
  //     scheduleWith: ["tony", "mahadi", "fahim"],
  //     location: "halishahar,ctg",
  //     priority: 'low',
  //     Remind_At: "2024-10-16T10:00",
  //     occurrence: "weekly",
  //     start: "2024-10-16T10:05:00.000Z",
  //     end: "2024-10-16T10:35:00.000Z",
  //     noEndDate: false,
  //     color: "#f39c12",
  //     Banner: false,
  //     editable: false,
  //   },
  //   {
  //     id: "job8",
  //     title: "hello 8",
  //     startTime: "2024-10-16T11:45:22.012Z",
  //     endTime: "2024-10-16T12:15:22.012Z",
  //     duration: 30,
  //     associateWith: "fahim",
  //     Type_of_Activity: "todo",
  //     resource: 2,
  //     scheduleFor: 20,
  //     scheduleWith: ["tony", "mahadi", "fahim"],
  //     location: "uttara,dhaka",
  //     priority: 'medium',
  //     Remind_At: "2024-10-16T11:40",
  //     occurrence: "daily",
  //     start: "2024-10-16T11:45:00.000Z",
  //     end: "2024-10-16T12:15:00.000Z",
  //     noEndDate: false,
  //     color: "#16a085",
  //     Banner: false,
  //     editable: false,
  //   },
  // ]);
  const [clickedEvent, setClickedEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState();
  const [priorityFilter,setPriorityFilter] = useState([])
  const [activityTypeFilter, setActivityTypeFilter] = useState([]);
  const [appointments, setAppointments] = useState([
    {
      id: "d1",
      title: "Winfred Lesley",
      job: "Teeth whitening",
      color: "#d1891f",
      start: "2024-09-27T08:00",
      end: "2024-09-27T09:30",
      unscheduled: true,
    },
    {
      id: "d2",
      title: "Rosalin Delice",
      job: "Crown and bridge",
      color: "#1ca11a",
      start: "2024-09-27T08:00",
      end: "2024-09-27T10:00",
      unscheduled: true,
    },
    {
      id: "d3",
      title: "Macy Steven",
      job: "Root canal treatment",
      color: "#cb3939",
      start: "2024-09-27T10:00",
      end: "2024-09-27T12:30",
      unscheduled: true,
    },
    {
      id: "d4",
      title: "Lavern Cameron",
      job: "Tartar removal",
      color: "#a446b5",
      start: "2024-09-27T12:00",
      end: "2024-09-27T13:00",
      unscheduled: true,
    },
  ]);

  const [myColors, setColors] = useState([]);
  const [open, setOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isToastOpen, setToastOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [view, setView] = useState("day");
  const [filteredEvents, setFilteredEvents] = useState(myEvents);
  const [myView, setMyView] = useState({
    schedule: {
      type: "day",
      startTime: "06:00",
      endTime: "24:00",
      allDay: false,
    },
  });

 const priority= ['low','medium','high']
  // const myView = useMemo(
  //   () => ({
  //     schedule: {
  //       type: "day",
  //       startTime: "08:00",
  //       endTime: "20:00",
  //       allDay: false,
  //     },
  //   }),
  //   []
  // );

  const changeView = useCallback((event) => {
    let myView;

    switch (event.target.value) {
      case "month":
        myView = {
          calendar: { labels: true,type: 'month' },
        };
        break;
      case "week":
        myView = {
          schedule: {
            type: "week",
            allDay: false,
            startDay: 1,
            endDay: 5,
            startTime: "06:00",
            endTime: "24:00",
          },
        };
        break;
      case "day":
        myView = {
          schedule: {
            type: "day",
            allDay: false,
            startTime: "06:00",
            endTime: "24:00",
          },
        };
        break;
      default:
        myView = {
          schedule: {
            type: "day",
            startTime: "06:00",
            endTime: "24:00",
            allDay: false,
          },
        };
        break;
    }

    setView(event.target.value);
    setMyView(myView);
  }, []);

  const meetings = useMemo(
    () => [
      {
        id: 1,
        name: "Meeting",
      },
      {
        id: 2,
        name: "To-do",
      },
      {
        id: 3,
        name: "Appointment",
      },
      {
        id: 4,
        name: "Boardroom",
      },
      {
        id: 5,
        name: "Call Billing",
      },
      {
        id: 6,
        name: "Email Billing",
      },
      {
        id: 7,
        name: "Initial Consultation",
      },
      {
        id: 8,
        name: "Call",
      },
      {
        id: 9,
        name: "Mail",
      },
      {
        id: 10,
        name: "Meeting Billing",
      },
      {
        id: 11,
        name: "Personal Activity",
      },
      {
        id: 12,
        name: "Room 1",
      },
      {
        id: 13,
        name: "Room 2",
      },
      {
        id: 14,
        name: "Room 3",
      },
      {
        id: 15,
        name: "To Do Billing",
      },
      {
        id: 16,
        name: "Vacation",
      },
    ],
    []
  );

  const myInvalid = useMemo(
    () => [
      {
        start: "06:00",
        end: "08:00",
        // title: 'Lunch break',
        type: "lunch",
        recurring: {
          repeat: "daily",
          // weekDays: 'MO,TU,WE,TH,FR',
        },
      },
    ],
    []
  );

  const handleEventCreate = useCallback((args) => {
    const event = args.event;
    event.unscheduled = false;
    setColors([]);
    setOpen(true);
  }, []);

  const handleEventCreated = useCallback((args) => {
    setToastMessage(args.event.title + " added");
    setToastOpen(true);
    setEvents((prevEvents) => [...prevEvents, args.event]);
    setAppointments((prevAppointments) =>
      prevAppointments.filter((item) => item.id !== args.event.id)
    );
  }, []);

  const handleFailed = useCallback((event) => {
    if (event.start <= today) {
      setToastMessage("Can't add event in the past");
    } else {
      setToastMessage("Make sure not to double book");
    }
    setToastOpen(true);
  }, []);

  const handleEventCreateFailed = useCallback(
    (args) => {
      handleFailed(args.event);
    },
    [handleFailed]
  );

  const handleEventUpdateFailed = useCallback(
    (args) => {
      handleFailed(args.event);
    },
    [handleFailed]
  );

  const handleEventDelete = useCallback((args) => {
    setToastMessage(args.event.title + " unscheduled");
    setToastOpen(true);
    setEvents((prevEvents) =>
      prevEvents.filter((item) => item.id !== args.event.id)
    );
  }, []);

  const handleEventDragEnter = useCallback(() => {
    setColors([
      {
        background: "#f1fff24d",
        start: "08:00",
        end: "20:00",
        recurring: {
          repeat: "daily",
        },
      },
    ]);
  }, []);

  const handleEventDragLeave = useCallback(() => {
    setColors([]);
  }, []);

  const handleCloseToast = useCallback(() => {
    setToastOpen(false);
  }, []);

  // Call handleFilterEvents when priorityFilter or myEvents change
  useEffect(() => {
    let filtered = myEvents;

    if (priorityFilter.length > 0) {
      filtered = filtered.filter((event) => priorityFilter.includes(event.priority));
    }

    if (activityTypeFilter.length > 0) {
      filtered = filtered.filter((event) => activityTypeFilter.includes(event.Type_of_Activity));
    }

    setFilteredEvents(filtered);
  }, [priorityFilter, activityTypeFilter, myEvents]);
  
  
  const customWithNavButtons = useCallback(() => {
    const props = { placeholder: "Select date...", inputStyle: "box" };
    return (
      <>
        <CalendarNav className="cal-header-nav" />
        <div className="cal-header-picker">
          <SegmentedGroup value={view} onChange={changeView}>
            <Segmented value="month">Month</Segmented>
            <Segmented value="week">Week</Segmented>
            <Segmented value="day">Day</Segmented>
          </SegmentedGroup>
        </div>
        <CalendarPrev className="cal-header-prev" />
        <CalendarToday className="cal-header-today" />
        <CalendarNext className="cal-header-next" />
  
        <Datepicker
          controls={["calendar"]}
          calendarType="month"
          display="top"
          calendarScroll={"vertical"}
          pages={3}
          className="mbsc-textfield"
          inputProps={props}
          onChange={(e) => setSelectedDate(e.value)}
        />
  
        <Box display={"flex"}>
          <Button variant="contained" size="small" onClick={()=>setDrawerOpen(true)} sx={{right:8}}>Filter</Button>
        </Box>
      </>
    );
  }, [view, priorityFilter, changeView]);

  useEffect(() => {
    for (const event of myEvents) {
      event.start = event.start ? new Date(event.start) : event.start;
      event.end = event.end ? new Date(event.end) : event.end;
      event.editable = !!(event.start && today < event.start);
    }
  }, [myEvents]);

  const onClose = () => {
    setOpen(false);
  };

  const handleEventClick = (args) => {
    console.log({ args });
    setClickedEvent(args);
    setOpen(true);
  };

  console.log({ clickedEvent });

  return (
    <div className="mbsc-grid mbsc-no-padding">
      <div className="mbsc-row">
        <div className="mbsc-col-sm-12 docs-appointment-calendar">
          <Eventcalendar
            data={filteredEvents}
            view={myView}
            resources={meetings}
            invalid={myInvalid}
            // refDate={calendarRef}
            onPageChange={(e) => setSelectedDate(e.firstDay)}
            dragToMove={true}
            dragToCreate={true}
            eventOverlap={false}
            externalDrop={true}
            externalDrag={true}
            // height={"500px"}
            selectedDate={selectedDate}
            colors={myColors}
            onCellDoubleClick={() => setOpen(true)}
            onEventClick={handleEventClick}
            renderHeader={customWithNavButtons}
            onEventCreate={handleEventCreate}
            onEventCreated={handleEventCreated}
            onEventCreateFailed={handleEventCreateFailed}
            onEventUpdateFailed={handleEventUpdateFailed}
            onEventDelete={handleEventDelete}
            onEventDragEnter={handleEventDragEnter}
            onEventDragLeave={handleEventDragLeave}
          />
          <Toast
            isOpen={isToastOpen}
            message={toastMessage}
            onClose={handleCloseToast}
          />
        </div>
        <DrawerComponent open={drawerOpen} setOpen={setDrawerOpen} priorityFilter={priorityFilter} setPriorityFilter={setPriorityFilter} activityTypeFilter={activityTypeFilter} setActivityTypeFilter={setActivityTypeFilter}/>

        <Modal
          open={open}
          onClose={onClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <EventForm
            myEvents={myEvents}
            setEvents={setEvents}
            setOpen={setOpen}
            onClose={onClose}
            clickedEvent={clickedEvent}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}

          />
        </Modal>
      </div>
    </div>
  );
};

export default TaskScheduler;
