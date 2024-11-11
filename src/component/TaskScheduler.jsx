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
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Modal,
  OutlinedInput,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import DrawerComponent from "./DrawerComponent";

dayjs.extend(utc);
dayjs.extend(timezone);

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
const today = now.toISOString().slice(0, 16);

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

const TaskScheduler = ({
  myEvents,
  setEvents,
  users,
  setStartDateTime,
  startDateTime,
  setEndDateTime,
  loader,
  setLoader,
  recentColor,
  setRecentColor,
}) => {
  const [clickedEvent, setClickedEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState();
  const [priorityFilter, setPriorityFilter] = useState([]);
  const [activityTypeFilter, setActivityTypeFilter] = useState([]);
  const [argumentLoader, setArgumentLoader] = useState(false);
  const [activityType, setActivityType] = useState([
    { type: "Meeting", resource: 1 },
    { type: "To-Do", resource: 2 },
    { type: "Appointment", resource: 3 },
    { type: "Boardroom", resource: 4 },
    { type: "Call Billing", resource: 5 },
    { type: "Email Billing", resource: 6 },
    { type: "Initial Consultation", resource: 7 },
    { type: "Call", resource: 8 },
    { type: "Mail", resource: 9 },
    { type: "Meeting Billing", resource: 10 },
    { type: "Personal Activity", resource: 11 },
    { type: "Room 1", resource: 12 },
    { type: "Room 2", resource: 13 },
    { type: "Room 3", resource: 14 },
    { type: "To Do Billing", resource: 15 },
    { type: "Vacation", resource: 16 },
  ]);

  const [myColors, setColors] = useState([]);
  const [open, setOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isToastOpen, setToastOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [view, setView] = useState("day");
  const [filteredEvents, setFilteredEvents] = useState(myEvents);
  const [userFilter, setUserFilter] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [myView, setMyView] = useState({
    schedule: {
      type: "day",
      startTime: "06:00",
      endTime: "24:00",
      allDay: false,
    },
  });
  const newEvent = clickedEvent?.event;

  const [formData, setFormData] = useState({
    id: newEvent?.id || "",
    title: newEvent?.title || "",
    startTime: "",
    endTime: "",
    duration: parseInt(newEvent?.duration) || 0,
    associateWith: newEvent?.associateWith || null,
    Type_of_Activity: newEvent?.Type_of_Activity?.toLowerCase() || "",
    resource: newEvent?.resource || 0,
    scheduleFor: newEvent?.scheduleFor || "",
    scheduledWith: newEvent?.scheduledWith || [],
    location: newEvent?.location || "",
    priority: newEvent?.priority?.toLowerCase() || "medium",
    Remind_At: newEvent?.Remind_At || "",
    occurrence: newEvent?.occurrence || "once",
    start: newEvent?.start || "",
    end: newEvent?.end || "",
    noEndDate: false,
    color: newEvent?.color || "#d1891f",
    Banner: newEvent?.Banner || false,
    Description: newEvent?.Description || "",
    create_sperate_contact: false,
    Regarding: newEvent?.Regarding || "",
    Reminder_Text: newEvent?.Reminder_Text || "",
    send_notification: newEvent?.send_notification || true,
  });

  const changeView = useCallback((event) => {
    let myView;

    switch (event.target.value) {
      case "month":
        myView = {
          calendar: { labels: true, type: "month" },
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

  console.log({ view });

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

  ////my code
  const handleInputChange = (field, value) => {
    if (field === "resource") {
      value = parseInt(value, 10); // Convert the input to an integer
    }

    if (field === "scheduleWith") {
      setFormData((prev) => ({
        ...prev,
        [field]: Array.isArray(value) ? [...value] : value, // Spread array values for multiple selections
      }));
    }
    setFormData((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleCellDoubleClick = (args) => {
    console.log(args);
    handleInputChange("start", args.date);
    handleInputChange(
      "end",
      new Date(dayjs(args.date).add(1, "hour").toDate())
    );
    handleInputChange("duration", 60);
    const selectedActivity = activityType.find(
      (item) => item.resource === args.resource
    );

    if (selectedActivity) {
      // Update both the activity type and the resource
      handleInputChange("Type_of_Activity", selectedActivity.type);
      handleInputChange("resource", selectedActivity.resource);
      // console.log({ formData });
    }
    setOpen(true);
  };

  // Call handleFilterEvents when priorityFilter or myEvents change
  useEffect(() => {
    let filtered = myEvents;
    // console.log({ filtered });

    if (priorityFilter.length > 0) {
      filtered = filtered.filter((event) =>
        priorityFilter.includes(event.priority)
      );
    }

    if (activityTypeFilter.length > 0) {
      filtered = filtered.filter((event) =>
        activityTypeFilter.includes(event.Type_of_Activity)
      );
    }

    if (userFilter.length > 0) {
      filtered = filtered.filter((event) =>
        userFilter.includes(event.scheduleFor.name)
      );
    }

    setFilteredEvents(filtered);
  }, [priorityFilter, activityTypeFilter, userFilter, myEvents]);

  const customWithNavButtons = useCallback(() => {
    const props = { placeholder: "Select date...", inputStyle: "box" };
    const handleDates = (e) => {
      let currentDate = dayjs(e.value).format("YYYY-MM-DD");
      const beginDate =
        dayjs(currentDate).startOf("day").format("YYYY-MM-DD") +
        "T00:00:00+10:30";
      const closeDate =
        dayjs(currentDate).endOf("day").format("YYYY-MM-DD") +
        "T23:59:59+10:30";
      setSelectedDate(e.value);
      setStartDateTime(beginDate);
      setEndDateTime(closeDate);
    };
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
          onChange={handleDates}
        />

        <Box display={"flex"}>
          <Button
            variant="contained"
            size="small"
            onClick={() => setDrawerOpen(true)}
            sx={{ right: 8 }}
          >
            Filter
          </Button>
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
    setFormData({
      id: "",
      title: "",
      startTime: "",
      endTime: "",
      duration: 0,
      associateWith: null,
      Type_of_Activity: "",
      resource: 0,
      scheduleFor: "",
      scheduleWith: [],
      location: "",
      priority: "",
      Remind_At: "",
      occurrence: "once",
      start: "",
      end: "",
      noEndDate: false,
      color: "#d1891f",
      Banner: false,
      Description: "",
      send_notification: true,
    });
    setClickedEvent(null);
  };

  const handleEventClick = (args) => {
    setArgumentLoader(true);
    console.log({ args });
    setClickedEvent(args?.event);
    setFormData({
      id: args?.event?.id,
      title: args?.event?.title,
      startTime: "",
      endTime: "",
      duration: parseInt(args?.event?.duration),
      associateWith: args?.event?.associateWith,
      Type_of_Activity: args?.event?.Type_of_Activity,
      resource: args?.event?.resource,
      scheduleFor: {
        ...args?.event?.scheduleFor,
        full_name: args?.event?.scheduleFor?.name,
      },
      scheduledWith: args?.event?.scheduledWith,
      location: args?.event?.location,
      priority: args?.event?.priority?.toLowerCase(),
      Remind_At: args?.event?.Remind_At,
      occurrence: args?.event?.occurrence,
      start: dayjs(args?.event?.start).format("YYYY-MM-DDTHH:mm"),
      end: dayjs(args?.event?.end).format("YYYY-MM-DDTHH:mm"),
      noEndDate: false,
      color: args?.event?.color,
      Banner: args?.event?.Banner,
      Description: args?.event?.Description,
      Reminder_Text: args?.event?.Reminder_Text,
      send_notification: args?.event?.send_notification,
      Regarding: args?.event?.Regarding,
    });
    setOpen(true);
    setArgumentLoader(false);
  };

  const onDateChange = async (args) => {
    console.log(args);
    console.log(dayjs(args.date).format("YYYY-MM-DD"));
    let currentDate = dayjs(args.date).format("YYYY-MM-DD");
    if (view === "day") {
      const beginDate =
        dayjs(currentDate).startOf("day").format("YYYY-MM-DD") +
        "T00:00:00+10:30";
      const closeDate =
        dayjs(currentDate).endOf("day").format("YYYY-MM-DD") +
        "T23:59:59+10:30";
      setSelectedDate(beginDate);
      setStartDateTime(beginDate);
      setEndDateTime(closeDate);
    } else if (view === "week") {
      const beginDate =
        dayjs(currentDate).startOf("week").format("YYYY-MM-DD") +
        "T00:00:00+10:30";
      const closeDate =
        dayjs(currentDate).endOf("week").format("YYYY-MM-DD") +
        "T23:59:59+10:30";
      // setSelectedDate(beginDate);
      setStartDateTime(beginDate);
      setEndDateTime(closeDate);
    } else {
      const beginDate =
        dayjs(currentDate).startOf("month").format("YYYY-MM-DD") +
        "T00:00:00+10:30";
      const closeDate =
        dayjs(currentDate).endOf("month").format("YYYY-MM-DD") +
        "T23:59:59+10:30";
      // setSelectedDate(beginDate);
      setStartDateTime(beginDate);
      setEndDateTime(closeDate);
    }

    // return;
    // let currentDate = dayjs(args.date).format("YYYY-MM-DDTHH:mm:ss") + "-10:30";
    // const beginDate =
    //   dayjs(currentDate).startOf("month").format("YYYY-MM-DD") +
    //   "T00:00:00-10:30";
    // const closeDate =
    //   dayjs(currentDate).endOf("month").format("YYYY-MM-DD") +
    //   "T23:59:59-10:30";
    // console.log(beginDate);
    // console.log(closeDate);
  };

  // const handlePageChange = (e) => {
  //   console.log(e);
  //   setSelectedDate(e.firstDay);
  //   // console.log(e);
  //   setStartDateTime(e.firstDay);
  //   setEndDateTime(e.lastDay);
  // };
  // if (loader) {
  //   return <Box> Fetching data ....</Box>;
  // }

  console.log({ mahadi: filteredEvents });
  console.log(filteredEvents.length);
  return (
    <div className="mbsc-grid mbsc-no-padding">
      <div className="mbsc-row">
        <div className="mbsc-col-sm-12 docs-appointment-calendar">
          <Eventcalendar
            data={filteredEvents}
            view={myView}
            resources={meetings}
            invalid={myInvalid}
            // startDay={(e)=>{console.log('faky',e)}}
            // refDate={calendarRef}
            // onPageChange={(e) => handlePageChange(e)}
            onSelectedDateChange={onDateChange}
            dragToMove={true}
            dragToCreate={true}
            eventOverlap={false}
            externalDrop={true}
            externalDrag={true}
            selectedDate={selectedDate}
            colors={myColors}
            onCellDoubleClick={handleCellDoubleClick}
            onEventClick={handleEventClick}
            renderHeader={customWithNavButtons}
            onEventCreate={handleEventCreate}
            onEventCreated={handleEventCreated}
            onEventCreateFailed={handleEventCreateFailed}
            onEventUpdateFailed={handleEventUpdateFailed}
            onEventDelete={handleEventDelete}
            onEventDragEnter={handleEventDragEnter}
            onEventDragLeave={handleEventDragLeave}
            className="mbsc-schedule-date-header-text mbsc-schedule-resource-title"
          />
          <Toast
            isOpen={isToastOpen}
            message={toastMessage}
            onClose={handleCloseToast}
          />
        </div>
        <DrawerComponent
          open={drawerOpen}
          setOpen={setDrawerOpen}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
          activityTypeFilter={activityTypeFilter}
          setActivityTypeFilter={setActivityTypeFilter}
          users={users} // Pass users list here
          userFilter={userFilter} // Pass user filter state
          setUserFilter={setUserFilter} // Pass user filter setter
        />

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
            activityType={activityType}
            setActivityType={setActivityType}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            formData={formData}
            handleInputChange={handleInputChange}
            setFormData={setFormData}
            users={users}
            recentColor={recentColor}
            setRecentColor={setRecentColor}
            clickedEvent={clickedEvent}
            setClickedEvent={setClickedEvent}
            argumentLoader={argumentLoader}
            snackbarOpen={snackbarOpen}
            setSnackbarOpen={setSnackbarOpen}
          />
        </Modal>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={(even, reason) => {
            if (reason === "clickaway") {
              return;
            }

            setSnackbarOpen(false);
          }}
        >
          <Alert
            onClose={(even, reason) => {
              if (reason === "clickaway") {
                return;
              }

              setSnackbarOpen(false);
            }}
            severity="success"
            variant="filled"
            sx={{ width: "100%" }}
          >
            Event created successfully !
          </Alert>
        </Snackbar>
        <Modal
          open={loader}
          onClose={() => setLoader(false)}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              bgcolor: "background.paper",
              border: "2px solid #000",
              boxShadow: 24,
              p: 4,
            }}
          >
            <Typography id="modal-modal-title" variant="h6" component="h2" textAlign={'center'}>
              Fetching data ...
            </Typography>
            <Box textAlign={'center'} mt={3}>
            <CircularProgress />
            </Box>
          </Box>
        </Modal>
        {/* {loader && } */}
      </div>
    </div>
  );
};

export default TaskScheduler;
