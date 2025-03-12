import {
  CalendarNav,
  CalendarNext,
  CalendarPrev,
  CalendarToday,
  Datepicker,
  Eventcalendar,
  Popup,
  Segmented,
  SegmentedGroup,
  setOptions,
  Toast,
} from "@mobiscroll/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "@mobiscroll/react/dist/css/mobiscroll.min.css";
import "./test.css";
import EventForm from "./formComponent/EventForm";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  Modal,
  Snackbar,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import DrawerComponent from "./DrawerComponent";

dayjs.extend(utc);
dayjs.extend(timezone);

const SUPER_ADMIN = "Super Admin";
const ADMIN = "Admin";
const GENERIC = "Generic";

setOptions({
  theme: "ios",
  themeVariant: "light",
});

const now = new Date();
const today = now.toISOString().slice(0, 16);

const TaskScheduler = ({
  myEvents,
  setMyEvents,
  users,
  setStartDateTime,
  setEndDateTime,
  loader,
  setLoader,
  recentColor,
  setRecentColor,
  loggedInUser,
}) => {
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
  const [selectedDate, setSelectedDate] = useState(
    dayjs().format("YYYY-MM-DD")
  );
  const [myView, setMyView] = useState({
    calendar: { labels: true, type: "month" },
  });
  const [view, setView] = useState("month");
  const [priorityFilter, setPriorityFilter] = useState([]);
  const [activityTypeFilter, setActivityTypeFilter] = useState([]);
  const [userFilter, setUserFilter] = useState([]);
  const [clickedEvent, setClickedEvent] = useState(null);
  const [argumentLoader, setArgumentLoader] = useState(false);
  const [types, setTypes] = useState();
  const [myColors, setColors] = useState([]);
  const [open, setOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isToastOpen, setToastOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filteredEvents, setFilteredEvents] = useState(myEvents);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [isTooltipOpen, setTooltipOpen] = useState(false);
  const [tooltipAnchor, setTooltipAnchor] = useState(null);
  const [hoverInEvents, setHoverInEvents] = useState();
  const newEvent = clickedEvent?.event;
  const [formData, setFormData] = useState({
    id: newEvent?.id || "",
    title: newEvent?.title || "New Meeting",
    startTime: "",
    endTime: "",
    duration: parseInt(newEvent?.duration) || 0,
    associateWith: newEvent?.associateWith || null,
    Type_of_Activity: newEvent?.Type_of_Activity?.toLowerCase() || "",
    resource: newEvent?.resource || 0,
    scheduleFor: loggedInUser || "",
    scheduledWith: [],
    location: newEvent?.location || "",
    priority: newEvent?.priority?.toLowerCase() || "medium",
    Remind_At: newEvent?.Remind_At || null,
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
    send_notification: newEvent?.send_notification || false,
    Send_Reminders: newEvent?.Send_Reminders || false,
  });
  const timer = useRef(null);

  const usertype = loggedInUser?.User_Type;
  useEffect(() => {
    if (usertype !== undefined) {
      if (usertype === SUPER_ADMIN) {
        setTypes(SUPER_ADMIN);
      } else if (usertype === ADMIN) {
        setTypes(ADMIN);
      } else {
        setTypes(GENERIC);
      }
    }
  }, [usertype]);

  useEffect(() => {
    let filtered = myEvents;

    if (priorityFilter.length > 0) {
      filtered = filtered.filter((obj) => {
        return priorityFilter.includes(obj.priority);
      });
    }

    if (activityTypeFilter.length > 0) {
      filtered = filtered.filter((obj) => {
        return activityTypeFilter.includes(obj.Type_of_Activity);
      });
    }

    if (userFilter.length > 0) {
      filtered = filtered.filter((obj) => {
        return userFilter.includes(obj.scheduleFor.name);
      });
    }

    setFilteredEvents(filtered);
  }, [priorityFilter, activityTypeFilter, userFilter, myEvents]);

  useEffect(() => {
    for (const event of myEvents) {
      event.start = event.start ? new Date(event.start) : event.start;
      event.end = event.end ? new Date(event.end) : event.end;
      event.editable = !!(event.start && today < event.start);
    }
  }, [myEvents]);

  const changeView = useCallback((event) => {
    let myView;

    switch (event.target.value) {
      case "month":
        // setStartDateTime(
        //   dayjs().startOf("month").format("YYYY-MM-DD") + "T00:00:00+10:30"
        // );
        // setEndDateTime(
        //   dayjs().endOf("month").format("YYYY-MM-DD") + "T23:59:59+10:30"
        // );
        myView = {
          // schedule: {
          //   type: "month",
          // },
          calendar: { type: "month", labels: true },
          // agenda: { type: "month" },
        };

        break;
      case "week":
        // setStartDateTime(
        //   dayjs().day(1).startOf("week").format("YYYY-MM-DD") +
        //     "T00:00:00+10:30"
        // );
        // setEndDateTime(
        //   dayjs().day(1).startOf("week").endOf("week").format("YYYY-MM-DD") +
        //     "T23:59:59+10:30"
        // );
        myView = {
          schedule: {
            type: "week",
            allDay: false,
            startTime: "06:00",
            endTime: "24:00",
            startDay: 1,
            endDay: 5,
          },
          // calendar: { type: "week" },
          // calendar: { type: "week", labels: true },
          // calendar: { labels: true, type: "week", size: 1 },
          // agenda: { type: "week" },
        };

        break;
      case "day":
        // setStartDateTime(dayjs().format("YYYY-MM-DD") + "T00:00:00+10:30");
        // setEndDateTime(dayjs().format("YYYY-MM-DD") + "T23:59:59+10:30");
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
            allDay: false,
            startTime: "06:00",
            endTime: "24:00",
          },
        };
        break;
    }

    setView(event.target.value);
    setMyView(myView);
  }, []);

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

  const handleEventCreated = useCallback(
    (args) => {
      setToastMessage(args.event.title + " added");
      setToastOpen(true);
      setMyEvents((prevEvents) => [...prevEvents, args.event]);
    },
    [setMyEvents]
  );

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

  const handleEventDelete = useCallback(
    (args) => {
      setToastMessage(args.event.title + " unscheduled");
      setToastOpen(true);
      setMyEvents((prevEvents) =>
        prevEvents.filter((item) => item.id !== args.event.id)
      );
    },
    [setMyEvents]
  );

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
    handleInputChange("title", "new meeting");
    handleInputChange(
      "end",
      new Date(dayjs(args.date).add(1, "hour").toDate())
    );
    // setInitialMinutesToDateTime({
    //   name: "5 minutes before",
    //   value: 5,
    // });
    handleInputChange("duration", 60);
    handleInputChange("scheduleFor", loggedInUser);
    handleInputChange("priority", "medium");
    let date = new Date(args.date);

    date.setMinutes(date.getMinutes() - parseInt(5, 10));

    const localDate = new Date(
      date.getTime() - date.getTimezoneOffset() * 60000
    );

    const modifiedDate = localDate.toISOString().slice(0, 16);
    console.log({ modifiedDate });

    handleInputChange("Remind_At", modifiedDate);
    handleInputChange("Reminder_Text", "");
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

  const meetings = [
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
  ];

  const adminMeetings = [
    "Meeting",
    "Appointment",
    "Boardroom",
    "Room 1",
    "Room 2",
    "Room 3",
    "Vacation",
  ];

  const genericMeetings = ["Meeting"];

  // Filtered meetings based on the types state
  const filteredMeetings = (types) => {
    if (types === SUPER_ADMIN) {
      return meetings; // Show all meetings
    }

    if (types === ADMIN) {
      const filteredMeetings = meetings.filter((meeting) =>
        adminMeetings.includes(meeting.name)
      );
      return filteredMeetings;
    }

    if (types === GENERIC) {
      // Add specific logic for Generic view if needed

      // const filteredMeetings = meetings.filter((meeting) =>
      //   adminMeetings.includes(meeting.name)
      // );

      // Generic will see all meeting type without header.
      return meetings?.map((el) => ({ id: el.id }));
    }

    return [
      {
        id: 1,
        name: "Meeting",
      },
    ]; // Default fallback
  };

  const resources = filteredMeetings(types);

  const customWithNavButtons = useCallback(() => {
    const props = { placeholder: "Select date...", inputStyle: "box" };
    const handleDatepickerDates = (e) => {
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
      setView("day");
      setMyView({
        schedule: {
          type: "day",
          allDay: false,
          startTime: "06:00",
          endTime: "24:00",
        },
      });
    };

    return (
      <span
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
        }}
      >
        <span
          style={{
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
          }}
        >
          <CalendarNav className="cal-header-nav" />

          <SegmentedGroup value={view} onChange={changeView}>
            <Segmented value="month">Month</Segmented>
            <Segmented value="week">Week</Segmented>
            <Segmented value="day">Day</Segmented>
          </SegmentedGroup>
          <CalendarPrev className="cal-header-prev" />
          <CalendarToday className="cal-header-today" />
          <CalendarNext className="cal-header-next" />
        </span>

        <span
          style={{
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
          }}
        >
          <Datepicker
            controls={["calendar"]}
            calendarType="month"
            dateFormat="DD/MM/YYYY"
            display="top"
            calendarScroll={"vertical"}
            pages={3}
            className="mbsc-textfield"
            inputProps={props}
            onChange={handleDatepickerDates}
            value={selectedDate}
          />

          <Button
            variant="contained"
            size="small"
            onClick={() => {
              setDrawerOpen(true);
            }}
            sx={{ right: 8 }}
          >
            Filter
          </Button>
        </span>
      </span>
    );
  }, [view, changeView, selectedDate, setEndDateTime, setStartDateTime]);

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
      send_notification: false,
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
      Send_Invites: args?.event?.send_notification,
      Regarding: args?.event?.Regarding,
    });
    setOpen(true);
    setArgumentLoader(false);
  };

  const onDateChange = async (args) => {
    let currentDate = dayjs(args.date).format("YYYY-MM-DD");
    setSelectedDate(currentDate);
    // return;
    if (view === "day") {
      const beginDate =
        dayjs(currentDate).startOf("day").format("YYYY-MM-DD") +
        "T00:00:00+10:30";
      const closeDate =
        dayjs(currentDate).endOf("day").format("YYYY-MM-DD") +
        "T23:59:59+10:30";
      setStartDateTime(beginDate);
      setEndDateTime(closeDate);
    }

    if (view === "week") {
      const beginDate =
        dayjs(currentDate).startOf("week").format("YYYY-MM-DD") +
        "T00:00:00+10:30";
      const closeDate =
        dayjs(currentDate).endOf("week").format("YYYY-MM-DD") +
        "T23:59:59+10:30";
      setStartDateTime(beginDate);
      setEndDateTime(closeDate);
    }

    if (view === "month") {
      const beginDate =
        dayjs(currentDate).startOf("month").format("YYYY-MM-DD") +
        "T00:00:00+10:30";
      const closeDate =
        dayjs(currentDate).endOf("month").format("YYYY-MM-DD") +
        "T23:59:59+10:30";
      setStartDateTime(beginDate);
      setEndDateTime(closeDate);
    }
  };

  const onPageChange = async (e) => {
    let newStartDate = dayjs(e.month).format("YYYY-MM-DD");
    setSelectedDate(newStartDate);

    if (view === "day") {
      const beginDate =
        dayjs(newStartDate).startOf("day").format("YYYY-MM-DD") +
        "T00:00:00+10:30";
      const closeDate =
        dayjs(newStartDate).endOf("day").format("YYYY-MM-DD") +
        "T23:59:59+10:30";
      setStartDateTime(beginDate);
      setEndDateTime(closeDate);
    }

    if (view === "week") {
      const beginDate =
        dayjs(newStartDate).startOf("day").format("YYYY-MM-DD") +
        "T00:00:00+10:30";
      const closeDate =
        dayjs(newStartDate).add(4, "day").format("YYYY-MM-DD") +
        "T23:59:59+10:30";
      setStartDateTime(beginDate);
      setEndDateTime(closeDate);
    }

    if (view === "month") {
      const beginDate =
        dayjs(newStartDate).startOf("day").format("YYYY-MM-DD") +
        "T00:00:00+10:30";
      const closeDate =
        dayjs(newStartDate).endOf("month").format("YYYY-MM-DD") +
        "T23:59:59+10:30";
      setStartDateTime(beginDate);
      setEndDateTime(closeDate);
    }
  };

  const openTooltip = useCallback((args) => {
    const event = args.event;

    const doctor = args.resourceObj;
    // const time = formatDate('hh:mm A', new Date(event.start)) + ' - ' + formatDate('hh:mm A', new Date(event.end));

    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }

    // if (event.confirmed) {
    //   setAppointmentStatus('Confirmed');
    //   setButtonText('Cancel appointment');
    //   setButtonType('warning');
    // } else {
    //   setAppointmentStatus('Canceled');
    //   setButtonText('Confirm appointment');
    //   setButtonType('success');
    // }

    // setAppointment(event);
    setHoverInEvents(event);
    // setAppointmentInfo(event.title + ', Age: ' + event.age);
    // setAppointmentLocation(event.location);
    // setAppointmentTime(time);
    // setAppointmentReason(event.reason);
    // setTooltipColor(doctor.color);
    setTooltipAnchor(args.domEvent.target.closest(".mbsc-schedule-event"));
    setTooltipOpen(true);
  }, []);

  const handleTooltipClose = useCallback(() => {
    setTooltipOpen(false);
  }, []);

  const handleEventHoverIn = useCallback(
    (args) => {
      // setHoverInEvents(args.event)
      openTooltip(args);
    },
    [openTooltip]
  );

  const handleEventHoverOut = useCallback(() => {
    if (!timer.current) {
      timer.current = setTimeout(() => {
        setTooltipOpen(false);
      }, 200);
    }
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    timer.current = setTimeout(() => {
      setTooltipOpen(false);
    }, 200);
  }, []);

  // if (loader) {
  //   return <Box> Fetching data ....</Box>;
  // }

  if (!usertype) {
    return <>...</>;
  }

  return (
    <div style={{ padding: "1em" }}>
      <div
        // className="mbsc-grid mbsc-no-padding"
        style={{
          borderTop: "1px solid #ccc",
          borderLeft: "1px solid #ccc",
          borderRight: "1px solid #ccc",
          borderRadius: "6px",
          overflow: "hidden",
        }}
      >
        <div className="mbsc-row">
          <div className="mbsc-col-sm-12 docs-appointment-calendar">
            {/* {console.log({ filteredEvents, myView, resources, myInvalid })} */}
            <Eventcalendar
              data={filteredEvents}
              view={myView}
              resources={resources}
              renderHeader={customWithNavButtons}
              invalid={myInvalid}
              // startDay={(e)=>{console.log('faky',e)}}
              // refDate={calendarRef}
              // onPageChange={(e) => {
              //   setSelectedDate(e.firstDay);
              //   setStartDateTime(e.firstDay);
              //   setEndDateTime(e.lastDay);
              // }}
              // onSelectedDateChange={onDateChange}
              onPageChange={onPageChange}
              dragToMove={true}
              dragToCreate={true}
              eventOverlap={false}
              externalDrop={true}
              externalDrag={true}
              selectedDate={selectedDate}
              colors={myColors}
              onCellDoubleClick={handleCellDoubleClick}
              onEventClick={handleEventClick}
              onEventCreate={handleEventCreate}
              onEventCreated={handleEventCreated}
              onEventCreateFailed={handleEventCreateFailed}
              onEventUpdateFailed={handleEventUpdateFailed}
              onEventDelete={handleEventDelete}
              onEventDragEnter={handleEventDragEnter}
              onEventDragLeave={handleEventDragLeave}
              onEventHoverIn={handleEventHoverIn}
              onEventHoverOut={handleEventHoverOut}
              className="mbsc-schedule-date-header-text mbsc-schedule-resource-title"
            />
            <Popup
              anchor={tooltipAnchor}
              contentPadding={false}
              display="anchored"
              isOpen={isTooltipOpen}
              scrollLock={false}
              showOverlay={false}
              touchUi={false}
              width={350}
              onClose={handleTooltipClose}
            >
              <div
                className="mds-tooltip"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <Box
                  display={"flex"}
                  justifyContent={"space-between"}
                  alignItems={"center"}
                  mb={2}
                  px={1.5}
                  mt={1.5}
                >
                  <Typography
                    variant="p"
                    sx={{
                      fontSize: "medium",
                      fontWeight: "bolder",
                      textAlign: "left",
                    }}
                    display={"inline-block"}
                    minWidth={"120px"}
                  >
                    Title
                  </Typography>
                  <Typography variant="p">{hoverInEvents?.title}</Typography>
                </Box>
                <Box
                  display={"flex"}
                  justifyContent={"space-between"}
                  alignItems={"center"}
                  mb={2}
                  px={1.5}
                >
                  <Typography
                    variant="p"
                    sx={{
                      fontSize: "medium",
                      fontWeight: "bolder",
                      textAlign: "left",
                    }}
                    display={"inline-block"}
                    maxWidth={"120px"}
                  >
                    Priority
                  </Typography>
                  <Typography variant="p">{hoverInEvents?.priority}</Typography>
                </Box>
                <Box
                  display={"flex"}
                  justifyContent={"space-between"}
                  alignItems={"center"}
                  mb={2}
                  px={1.5}
                >
                  <Typography
                    variant="p"
                    sx={{
                      fontSize: "medium",
                      fontWeight: "bolder",
                      textAlign: "left",
                    }}
                    display={"inline-block"}
                    maxWidth={"120px"}
                  >
                    Start time
                  </Typography>
                  <Typography variant="p">
                    {dayjs(hoverInEvents?.start).format("DD/MM/YYYY hh:mm A")}
                  </Typography>
                </Box>
                <Box
                  display={"flex"}
                  justifyContent={"space-between"}
                  alignItems={"center"}
                  mb={2}
                  px={1.5}
                >
                  <Typography
                    variant="p"
                    sx={{
                      fontSize: "medium",
                      fontWeight: "bolder",
                      textAlign: "left",
                    }}
                    display={"inline-block"}
                    maxWidth={"120px"}
                  >
                    End time
                  </Typography>
                  <Typography variant="p">
                    {dayjs(hoverInEvents?.end).format("DD/MM/YYYY hh:mm A")}
                  </Typography>
                </Box>
                <Box
                  display={"flex"}
                  justifyContent={"space-between"}
                  alignItems={"center"}
                  mb={2}
                  px={1.5}
                >
                  <Typography
                    variant="p"
                    sx={{
                      fontSize: "medium",
                      fontWeight: "bolder",
                      textAlign: "left",
                    }}
                    display={"inline-block"}
                    maxWidth={"120px"}
                  >
                    Description
                  </Typography>
                  <Typography
                    variant="p"
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: "8",
                      WebkitBoxOrient: "vertical",
                      ml: 2,
                      textAlign: "right",
                    }}
                  >
                    {hoverInEvents?.Description}
                  </Typography>
                </Box>
                <Box
                  display={"flex"}
                  justifyContent={"space-between"}
                  alignItems={"center"}
                  mb={2}
                  px={1.5}
                >
                  <Typography
                    variant="p"
                    sx={{
                      fontSize: "medium",
                      fontWeight: "bolder",
                      textAlign: "left",
                    }}
                    display={"inline-block"}
                    minWidth={"120px"}
                  >
                    Regarding
                  </Typography>
                  <Typography variant="p">
                    {hoverInEvents?.Regarding}
                  </Typography>
                </Box>
                <Box
                  display={"flex"}
                  justifyContent={"space-between"}
                  alignItems={"center"}
                  mb={2}
                  px={1.5}
                >
                  <Typography
                    variant="p"
                    sx={{
                      fontSize: "medium",
                      fontWeight: "bolder",
                      textAlign: "left",
                    }}
                    display={"inline-block"}
                    minWidth={"120px"}
                  >
                    Scheduled With
                  </Typography>
                  <ul style={{ width: "100%" }}>
                    {hoverInEvents?.scheduledWith.length > 0 &&
                      hoverInEvents?.scheduledWith.map((item, index) => (
                        <li>{item?.Full_Name}</li>
                      ))}
                  </ul>
                </Box>
              </div>
            </Popup>
            <Toast
              isOpen={isToastOpen}
              message={toastMessage}
              onClose={handleCloseToast}
            />
          </div>
          <DrawerComponent
            open={drawerOpen}
            setOpen={setDrawerOpen}
            users={users} // Pass users list here
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
            activityTypeFilter={activityTypeFilter}
            setActivityTypeFilter={setActivityTypeFilter}
            userFilter={userFilter} // Pass user filter state
            setUserFilter={setUserFilter} // Pass user filter setter
          />

          <Dialog
            open={open}
            onClose={onClose}
            fullWidth // ✅ Makes it responsive
            maxWidth="md" // ✅ Adjust max width (options: 'xs', 'sm', 'md', 'lg', 'xl')
          >
            <DialogContent sx={{ padding: 0 }}>
              <EventForm
                myEvents={myEvents}
                setEvents={setMyEvents}
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
                loggedInUser={loggedInUser}
              />
            </DialogContent>
          </Dialog>
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
              <Typography
                id="modal-modal-title"
                variant="h6"
                component="h2"
                textAlign={"center"}
              >
                Fetching data ...
              </Typography>
              <Box textAlign={"center"} mt={3}>
                <CircularProgress />
              </Box>
            </Box>
          </Modal>
          {/* {loader && } */}
        </div>
      </div>
    </div>
  );
};

export default TaskScheduler;
