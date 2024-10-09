import {
  Button,
  CalendarNav,
  CalendarNext,
  CalendarPrev,
  CalendarToday,
  Datepicker,
  Draggable,
  Dropcontainer,
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
import { useCallback, useEffect, useMemo, useState } from "react";
import "@mobiscroll/react/dist/css/mobiscroll.min.css";
import "./test.css";
import EventForm from "./formComponent/EventForm";
import { Modal } from "@mui/material";

setOptions({
  theme: "ios",
  themeVariant: "light",
});

const now = new Date();
const today = new Date(now.setMinutes(59));
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

const TaskScheduler = () => {
  const [myEvents, setEvents] = useState([
    {
      id: 'job1',
      start: '2024-10-07T14:00',
      end: '2024-10-07T16:00',
      resource: 1,
      title: 'Myla Bennett',
      job: 'Wisdom tooth removal',
      color: '#334ab9',
    },
    {
      id: 'job2',
      start: '2024-10-07T17:00',
      end: '2024-10-07T18:30',
      resource: 1,
      title: 'Beatrix Foley',
      job: 'Braces',
      color: '#177e70',
    },
    {
      id: 'job3',
      start: '2024-10-07T08:00',
      end: '2024-10-07T09:30',
      resource: 3,
      title: 'Frank Watson',
      job: 'Teeth whitening',
      color: '#d1891f',
    },
    {
      id: 'job4',
      start: '2024-10-07T10:00',
      end: '2024-10-07T12:30',
      resource: 3,
      title: 'Jaime Joyce',
      job: 'Root canal treatment',
      color: '#cb3939',
    },
    {
      id: 'job5',
      start: '2024-10-07T13:00',
      end: '2024-10-07T14:00',
      resource: 3,
      title: 'Corey Shepard',
      job: 'Tooth extraction',
      color: '#aba343',
    },
    {
      id: 'job6',
      start: '2024-10-07T14:00',
      end: '2024-10-07T16:00',
      resource: 4,
      title: 'Callie Leonard',
      job: 'Crown and bridge',
      color: '#1ca11a',
    },
    {
      id: 'job7',
      start: '2024-10-07T17:00',
      end: '2024-10-07T18:00',
      resource: 4,
      title: 'Harley Thomson',
      job: 'Tartar removal',
      color: '#a446b5',
    },
    {
      id: 'job8',
      start: '2024-10-07T09:00',
      end: '2024-10-07T11:00',
      resource: 6,
      title: 'Ricky Welch',
      job: 'Wisdom tooth removal',
      color: '#334ab9',
    },
  ]);
  const [clickedEvent,setClickedEvent] = useState(null)

  console.log({ myEvents });

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
  const [open, setOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState("");
  const [isToastOpen, setToastOpen] = useState(false);
  const [view, setView] = useState("day");
  const [myView, setMyView] = useState({
    schedule: {
      type: "day",
      startTime: "08:00",
      endTime: "24:00",
      allDay: false,
    },
  });
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
          calendar: { labels: true },
        };
        break;
      case "week":
        myView = {
          schedule: {
            type: "week",
            allDay: false,
            startDay: 1,
            endDay: 5,
            startTime: "08:00",
            endTime: "24:00",
          },
        };
        break;
      case "day":
        myView = {
          schedule: {
            type: "day",
            allDay: false,
            startTime: "08:00",
            endTime: "24:00",
          },
        };
        break;
      default:
        myView = {
          schedule: {
            type: "day",
            startTime: "08:00",
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
        recurring: {
          repeat: "daily",
          until: yesterday,
        },
      },
      {
        start: yesterday,
        end: today,
      },
    ],
    []
  );

  // const setDropElm = useCallback((elm) => {
  //   setDropCont(elm);
  // }, []);

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

  const customWithNavButtons = useCallback(() => {
    const props = { placeholder: "Select date...",inputStyle:'box' };
    // const show = () => {
    //   setOpenPicker(true);
    // };
    // const handleClose = () => {
    //   setOpenPicker(false);
    // };
    return (
      <>
        <CalendarNav className="cal-header-nav" />
        <div className="cal-header-picker">
          <SegmentedGroup value={view} onChange={changeView}>
            <Segmented value="month">Month</Segmented>
            <Segmented value="week">Week</Segmented>
            <Segmented value="day">day</Segmented>
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
            // maxHeight={"400px"}
            // maxWidth={"1000px"}
            // isOpen={true}
            // showOnFocus={false}
            // showOnClick={false}
          />
      </>
    );
  }, [changeView, view]);

  useEffect(() => {
    for (const event of myEvents) {
      // convert dates to date objects
      event.start = event.start ? new Date(event.start) : event.start;
      event.end = event.end ? new Date(event.end) : event.end;
      // mark past events as fixed by setting the event.editable property to false
      event.editable = !!(event.start && today < event.start);
    }
  }, [myEvents]);

  const onClose = () => {
    setOpen(false);
  };

  const handleEventClick = (args) =>{
    console.log({args})
    setClickedEvent(args)
    setOpen(true)
  }

  return (
    <div className="mbsc-grid mbsc-no-padding">
      <div className="mbsc-row">
        <div className="mbsc-col-sm-12 docs-appointment-calendar">
          <Eventcalendar
            data={myEvents}
            view={myView}
            resources={meetings}
            // invalid={myInvalid}
            dragToMove={true}
            dragToCreate={true}
            eventOverlap={false}
            externalDrop={true}
            externalDrag={true}
            // height={"500px"}
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
          />
        </Modal>
        {/* <Popup
          display="center"
          width={400}
          contentPadding={false}
          touchUi={false}
          headerText="Assign task"
          buttons={['ok']}
          // anchor={anchor}
          isOpen={open}
          onClose={onClose}
        >
          <EventForm />
        </Popup> */}
        {/* <div className="mbsc-form-group">
            <Input label="Task" defaultValue={'title'} readOnly></Input>
            <Textarea label="Details" defaultValue={'details'} placeholder="Add description..."></Textarea>
            <Select
              // data={myData}
              value={"technician"}
              // onChange={changeSelected}
              display="anchored"
              touchUi={false}
              label="Technician"
              placeholder="Please select..."
            />
          </div> */}
      </div>
    </div>
  );
};

export default TaskScheduler;
