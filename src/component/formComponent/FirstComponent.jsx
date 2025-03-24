import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid2 as Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import React from "react";
import CustomTextField from "../atom/CustomTextField";
import { useState } from "react";
import { Datepicker } from "@mobiscroll/react";
import ContactField from "../atom/ContactField";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import AccountField from "../atom/AccountField";
import RegardingField from "../atom/RegardingField";
import { SketchPicker } from "react-color";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import CustomColorPicker from "../atom/CustomColorPicker";
import {
  DatePicker,
  DateTimePicker,
  LocalizationProvider,
} from "@mui/x-date-pickers";
import TestContactField from "../atom/TestContactField";

const FirstComponent = ({
  formData,
  handleInputChange,
  selectedDate,
  activityType,
  setActivityType,
  users,
  recentColor,
  setRecentColor,
  clickedEvent,
}) => {
  dayjs.extend(utc);
  dayjs.extend(timezone);
  const [openStartDatepicker, setOpenStartDatepicker] = useState(false);
  const [openEndDatepicker, setOpenEndDatepicker] = useState(false);
  const [displayColorPicker, setDisplayColorPicker] = useState(false);
  const [startValue, setStartValue] = useState(dayjs(formData.start));
  const [endValue, setEndValue] = useState(dayjs(formData.end));
  const [sendNotification, setSendNotification] = useState(
    formData?.Send_Invites
  );
  const [clearActivity, setClearActivity] = useState(
    formData.Event_Status === "Open" || false
  );
  const [sendReminders, setSendReminders] = useState(formData?.Send_Reminders); // Initially, reminders are enabled
  const [reminderMinutes, setReminderMinutes] = useState(15);

  const ringAlarm = [
    { name: "At time of meeting", value: 0 },
    { name: "5 minutes before", value: 5 },
    { name: "10 minutes before", value: 10 },
    { name: "15 minutes before", value: 15 },
    { name: "30 minutes before", value: 30 },
    { name: "1 hour before", value: 60 },
    { name: "2 hours before", value: 120 },
    { name: "1 day before", value: 1440 },
    { name: "2 day before", value: 2880 },
  ];
  const durations = Array.from({ length: 24 }, (_, i) => (i + 1) * 10);

  function addMinutesToDateTime(formatType, durationInMinutes) {
    const startTime = dayjs(formData.start);

    if (formatType === "duration") {
      const endTime = startTime.add(durationInMinutes, 'minute');

      const modifiedEndDate = endTime.format('YYYY-MM-DDTHH:mm');
      const modifiedStartDate = startTime.format('YYYY-MM-DDTHH:mm');

      handleInputChange("end", modifiedEndDate);
      handleInputChange("start", modifiedStartDate);
      setEndValue(dayjs(endTime));
    } else {

      const reminderTime = startTime.subtract(durationInMinutes.value, 'minute');

      console.log("startTime", reminderTime,durationInMinutes)
      const modifiedReminderDate = reminderTime.format('YYYY-MM-DDTHH:mm');

      handleInputChange("Remind_At", modifiedReminderDate);
      handleInputChange("Reminder_Text", durationInMinutes.name);
    }
  }

  const handleActivityChange = (event) => {
    const selectedType = event.target.value;
    const selectedActivity = activityType.find(
      (item) => item.type === selectedType
    );

    if (selectedActivity) {
      // Update both the activity type and the resource
      handleInputChange("Type_of_Activity", selectedActivity.type);
      handleInputChange("resource", selectedActivity.resource);
    }
  };

  const customInputComponent = (field, label, openDatepickerState) => {
    return (
      <CustomTextField
        fullWidth
        disabled={formData.Banner ? true : false}
        size="small"
        label={label}
        variant="outlined"
        value={
          formData[field] !== ""
            ? dayjs(formData[field]).format("DD/MM/YYYY h:mm A")
            : null
        }
        onClick={() => openDatepickerState(true)}
      />
    );
  };

  const formatTime = (date, hour) => {
    const newDate = new Date(date);
    newDate.setHours(hour, 0, 0, 0);
    // Manually format the date in YYYY-MM-DDTHH:mm without converting to UTC
    const year = newDate.getFullYear();
    const month = String(newDate.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const day = String(newDate.getDate()).padStart(2, "0");
    const hours = String(newDate.getHours()).padStart(2, "0");
    const minutes = String(newDate.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleBannerChecked = (e) => {
    handleInputChange("Banner", e.target.checked);
    console.log({ selectedDate });
    if (selectedDate) {
      const timeAt6AM = formatTime(selectedDate, 6);
      const timeAt7AM = formatTime(selectedDate, 7);
      // console.log("fahim", timeAt6AM, timeAt7AM);
      handleInputChange("start", timeAt6AM);
      handleInputChange("end", timeAt7AM);
      setStartValue(dayjs(timeAt6AM));
      setEndValue(dayjs(timeAt7AM));
    } else {
      const now = new Date();
      // console.log(now);
      const timeAt6AM = formatTime(now, 6);
      const timeAt7AM = formatTime(now, 7);
      // console.log("fahim", timeAt6AM, timeAt7AM);
      handleInputChange("start", timeAt6AM);
      handleInputChange("end", timeAt7AM);
      setStartValue(dayjs(timeAt6AM));
      setEndValue(dayjs(timeAt7AM));
    }
  };

  function getTimeDifference(end) {
    const startDate = new Date(formData.start);
    const endDate = new Date(end);
    const diffInMs = endDate - startDate;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    return diffInMinutes;
  }

  const handleEndDateChange = (e) => {
    handleInputChange("end", e.$d);
    console.log("end", e.value);
    const getDiffInMinutes = getTimeDifference(e.$d);
    handleInputChange("duration", getDiffInMinutes);
    console.log({ getDiffInMinutes });
    // if (formData.end ) {
    //   console.log('hello')
    // }
  };

  const handleColorChange = (e) => {
    setRecentColor((prev) => [...prev, e]);
    handleInputChange("color", e);
  };

  const handleNotificationChange = (e) => {
    handleInputChange("send_notification", e.target.checked);
  };
  // const fn =()=>{
  //   handleInputChange("Remind_At",'')
  //   handleInputChange('Reminder_Text','')
  //   return true
  // }
  const handleCheckboxChange = (field) => {
    if (field === "clear_activity") {
      const newClearActivity = !clearActivity;
      setClearActivity(newClearActivity);
      // Update the form data
      handleInputChange("Event_Status", newClearActivity ? "Closed" : "Open");
      handleInputChange("clear_activity", newClearActivity);
    }

    if (field === "send_notification") {
      const newSendNotification = !sendNotification;
      setSendNotification(newSendNotification);
      handleInputChange("send_notification", newSendNotification);
      handleInputChange("Send_Invites", newSendNotification);
    } else if (field === "Remind_Participants") {
      const newSendReminders = !sendReminders;
      setSendReminders(newSendReminders);
      handleInputChange("Send_Reminders", newSendReminders);
      console.log({ newSendReminders });

      if (newSendReminders) {
        // If reminders are enabled
        handleInputChange("Remind_Participants", [
          { period: "minutes", unit: reminderMinutes },
        ]);
        handleInputChange("Reminder_Text", `${reminderMinutes} minutes before`);
      } else {
        // If reminders are disabled
        handleInputChange("Remind_Participants", []);
        handleInputChange("Reminder_Text", "None");
        handleInputChange("Remind_At", []);
        handleInputChange("Send_Reminders", false);
      }
    }
  };

  const handleReminderChange = (value) => {
    setReminderMinutes(value);
    handleInputChange("Remind_Participants", [
      { period: "minutes", unit: value },
    ]);
    if (value === "None") {
      handleInputChange("Reminder_Text", "None");
    } else {
      handleInputChange("Reminder_Text", `${value} minutes before`);
    }
  };



  return (
    <Box>
      <Grid container columns={18} spacing={2} sx={{ mt: 2 }}>
        <Grid size={18}>
          <CustomTextField
            fullWidth
            size="small"
            label="Event_title"
            variant="outlined"
            value={formData?.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
          />
        </Grid>

        <Grid size={18}>
          <FormControl fullWidth size="small">
            <InputLabel
              id="demo-simple-select-standard-label"
              shrink
              sx={{ fontSize: "9pt" }} // ✅ Label text size
            >
              Activity type
            </InputLabel>
            <Select
              labelId="demo-simple-select-standard-label"
              id="demo-simple-select-standard"
              label="Activity type"
              fullWidth
              displayEmpty
              value={formData.Type_of_Activity}
              InputLabelProps={{ shrink: true }}
              onChange={handleActivityChange}
              MenuProps={{
                PaperProps: {
                  style: {
                    zIndex: 1300, // Increase this if necessary, depending on the z-index of your popup
                  },
                },
              }}
              sx={{
                "& .MuiSelect-select": {
                  padding: "4px 10px", // Adjust the padding to shrink the Select content
                  fontSize: "9pt", // ✅ Dropdown selected text size
                },
                "& .MuiOutlinedInput-root": {
                  padding: 0, // Ensure no extra padding
                },
                "& .MuiInputBase-input": {
                  display: "flex",
                  alignItems: "center", // Align the content vertically
                  fontSize: "9pt", // ✅ Input text size
                },
              }}
            >
              {activityType.map((item, index) => (
                <MenuItem
                  value={item.type}
                  key={index}
                  sx={{ fontSize: "9pt" }}
                >
                  {" "}
                  {/* ✅ MenuItem text size */}
                  {item.type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={7}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              label="Start Time"
              value={startValue}
              disabled={formData.Banner ? true : false}
              // slotProps={{ textField: { size: "small" } }}
              onChange={(e) => {
                const addedHour = new Date(dayjs(e.$d).add(1, "hour").toDate());
                handleInputChange("start", e.$d);
                handleInputChange("end", addedHour);
                setEndValue(dayjs(addedHour));
                handleInputChange("duration", 60);
                console.log(e.$d);
                console.log(addedHour);
              }}
              sx={{
                "& input": { py: 0 },
                width: "100%",
                "& .MuiInputBase-input": {
                  fontSize: "9pt", // ✅ Set input text size
                },
                "& .MuiInputLabel-root": {
                  fontSize: "9pt", // ✅ Set label text size
                },
              }}
              renderInput={(params) => <TextField {...params} size="small" />}
              format="DD/MM/YYYY hh:mm A" // Ensures 24-hour format for clarity
            />
          </LocalizationProvider>
        </Grid>
        <Grid size={7}>
          {/* <Datepicker
            controls={["calendar", "time"]}
            display="center"
            inputComponent={() =>
              customInputComponent("end", "End Time", setOpenEndDatepicker)
            }
            returnFormat="iso8601"
            onClose={() => setOpenEndDatepicker(false)}
            onChange={(e) => handleEndDateChange(e)}
            isOpen={openEndDatepicker}
          /> */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              label="End Time"
              value={endValue}
              disabled={formData.Banner ? true : false}
              slotProps={{ textField: { size: "small" } }}
              onChange={(e) => handleEndDateChange(e)}
              sx={{
                "& input": { py: 0 },
                width: "100%",
                "& .MuiInputBase-input": {
                  fontSize: "9pt", // ✅ Set input text size
                },
                "& .MuiInputLabel-root": {
                  fontSize: "9pt", // ✅ Set label text size
                },
              }}
              renderInput={(params) => <TextField {...params} size="small" />}
              format="DD/MM/YYYY hh:mm A" // Ensures 24-hour format for clarity
            />
          </LocalizationProvider>
        </Grid>
        <Grid size={4}>
          <FormControl fullWidth size="small">
            <InputLabel
              id="demo-simple-select-standard-label"
              sx={{ fontSize: "9pt" }}
            >
              Duration
            </InputLabel>
            <Select
              labelId="demo-simple-select-standard-label"
              id="demo-simple-select-standard"
              label="Duration"
              fullWidth
              value={formData.duration}
              disabled={formData.Banner ? true : false}
              InputLabelProps={{ shrink: true }}
              onChange={(e) => {
                handleInputChange("duration", e.target.value);
                addMinutesToDateTime("duration", e.target.value);
              }}
              sx={{
                "& .MuiSelect-select": {
                  padding: "4px 5px", // Adjust the padding to shrink the Select content
                  fontSize: "9pt", // ✅ Set dropdown text size
                },
                "& .MuiOutlinedInput-root": {
                  // height: '40px', // Set a consistent height
                  padding: "3px 0px", // Ensure no extra padding
                },
                "& .MuiInputBase-input": {
                  display: "flex",
                  alignItems: "center", // Align the content vertically
                },
                "& .MuiInputLabel-root": {
                  fontSize: "9pt", // ✅ Set label text size
                },
                "& .MuiMenuItem-root": {
                  fontSize: "9pt", // ✅ Set menu items text size
                },
              }}
            >
              {durations.map((minute, index) => (
                <MenuItem key={index} value={minute}>
                  {minute} minutes
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid
          size={9}
          alignItems={"center"}
          sx={{ display: "flex", margin: "-10px 0px" }}
        >
          <FormControlLabel
            sx={{
              height: "35px",
              "& .MuiTypography-root": { fontSize: "9pt" }, // ✅ Set checkbox label text size
            }}
            control={
              <Checkbox
                size="small"
                checked={formData.Banner}
                onChange={handleBannerChecked}
              />
            }
            label="Banner/Timeless"
          />

          <Box display="flex" alignItems="center" p={0}>
            <Typography
              variant="body1"
              sx={{ fontSize: "9pt", minWidth: "60px" }}
            >
              {" "}
              {/* ✅ Set text size */}
              Color :
            </Typography>

            <Box
              sx={{
                width: "20px",
                height: "20px",
                backgroundColor: formData.color,
                border: "1px solid #ccc",
                display: "inline-block",
                cursor: "pointer",
                marginLeft: 1,
              }}
              onClick={() => setDisplayColorPicker(!displayColorPicker)}
            >
              {displayColorPicker && (
                <Box sx={{ position: "absolute", zIndex: "2" }}>
                  <Box
                    sx={{
                      position: "fixed",
                      right: "0px",
                      bottom: "0px",
                      left: "0px",
                    }}
                    onClick={() => setDisplayColorPicker(false)}
                  >
                    <CustomColorPicker
                      recentColors={recentColor}
                      setDisplayColorPicker={setDisplayColorPicker}
                      handleColorChange={handleColorChange}
                      formData={formData}
                    />
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </Grid>

        {/* <Grid size={9} alignItems={"center"}>
          <FormControlLabel
            sx={{ height: "35px" }}
            control={
              <Checkbox
                size="small"
                value={formData.send_notification}
                checked={formData.send_notification}
                onChange={handleNotificationChange}
              />
            }
            label="Send notification"
          />
        </Grid> */}

        <Grid size={18}>
          {/* <ContactField
            value={formData?.scheduledWith} 
            handleInputChange={handleInputChange}
            formData={formData}
            clickedEvent={clickedEvent}
          /> */}
          <TestContactField
            value={formData?.scheduledWith}
            handleInputChange={handleInputChange}
            clickedEvent={clickedEvent}
          />
        </Grid>
        <Grid
          container
          spacing={2}
          alignItems="center"
          sx={{ margin: "-10px 0px" }}
        >
          <Grid item xs={3}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={sendNotification}
                  onChange={() => handleCheckboxChange("send_notification")}
                />
              }
              label="Send invites"
              sx={{ "& .MuiTypography-root": { fontSize: "9pt" } }} // Adjust font size
            />
          </Grid>

          <Grid item xs={3}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={sendReminders}
                  onChange={() => handleCheckboxChange("Remind_Participants")}
                />
              }
              label="Send reminders"
              sx={{ "& .MuiTypography-root": { fontSize: "9pt" } }}
            />
          </Grid>

          <Grid item xs={3}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.create_sperate_contact}
                  disabled={formData.id !== ""}
                  onChange={(e) => {
                    handleInputChange(
                      "create_sperate_contact",
                      e.target.checked
                    );
                    console.log(e.target.checked);
                  }}
                />
              }
              label="Create separate activity for each contact"
              sx={{ "& .MuiTypography-root": { fontSize: "9pt" } }}
            />
          </Grid>

          {/* Ensure the last column always exists, avoiding layout shifting */}
          <Grid item xs={2} sx={{ display: "flex", alignItems: "center" }}>
            {formData.id && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={clearActivity}
                    onChange={() => handleCheckboxChange("clear_activity")}
                  />
                }
                label="Clear"
                sx={{ "& .MuiTypography-root": { fontSize: "9pt" } }}
              />
            )}
          </Grid>
          <Grid item xs={2} sx={{ display: "flex", alignItems: "center" }}>
            {formData.id && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={clearActivity}
                    onChange={() => handleCheckboxChange("clear_activity")}
                  />
                }
                label="Erase"
                sx={{ "& .MuiTypography-root": { fontSize: "9pt" } }}
              />
            )}
          </Grid>
        </Grid>

        <Grid size={18}>
          <AccountField
            value={formData.associateWith} // Use formData
            handleInputChange={handleInputChange}
            clickedEvent={clickedEvent}
            formData={formData}
          />
        </Grid>
        <Grid size={18}>
          <FormControl fullWidth size="small" sx={{ mb: "3px" }}>
            <Autocomplete
              id="schedule-for-autocomplete"
              size="small"
              options={users}
              getOptionLabel={(option) =>
                option?.name || option?.full_name || ""
              }
              value={formData?.scheduleFor || ""}
              onChange={(event, newValue) => {
                handleInputChange("scheduleFor", {
                  name: newValue?.full_name || "",
                  id: newValue?.id || "",
                  email: newValue?.email || "",
                });
              }}
              renderInput={(params) => (
                <TextField
                  size="small"
                  {...params}
                  label="Schedule for ..."
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    "& .MuiTypography-root": { fontSize: "9pt" }, // ✅ Label text size
                    "& .MuiOutlinedInput-root": {
                      padding: "0px",
                      height: "31px",
                    },
                    "& .MuiInputBase-input": {
                      padding: "4px 6px",
                      display: "flex",
                      alignItems: "center",
                      fontSize: "9pt", // ✅ Input text size
                    },
                  }}
                />
              )}
              componentsProps={{
                popper: {
                  modifiers: [
                    {
                      name: "preventOverflow",
                      options: {
                        boundary: "window",
                      },
                    },
                  ],
                },
                paper: {
                  sx: {
                    fontSize: "9pt", // ✅ Dropdown container text size
                  },
                },
                popperDisablePortal: true, // ✅ Ensures styles apply correctly to popper
              }}
              sx={{
                "& .MuiAutocomplete-option": {
                  fontSize: "9pt", // ✅ Each option text size
                  padding: "4px 8px",
                },
              }}
            />
          </FormControl>
        </Grid>

        <Grid size={18}>
          <RegardingField
            formData={formData}
            handleInputChange={handleInputChange}
          />
        </Grid>

        <Grid size={4}>
          <FormControl fullWidth size="small">
            <InputLabel
              id="demo-simple-select-standard-label"
              sx={{ fontSize: "9pt" }} // ✅ Label text size
            >
              Priority
            </InputLabel>
            <Select
              labelId="demo-simple-select-standard-label"
              id="demo-simple-select-standard"
              label="Priority"
              fullWidth
              value={formData.priority}
              onChange={(e) => handleInputChange("priority", e.target.value)}
              MenuProps={{
                PaperProps: {
                  sx: {
                    fontSize: "9pt", // ✅ Dropdown menu text size
                  },
                },
              }}
              sx={{
                "& .MuiSelect-select": {
                  padding: "4px 10px", // Adjust padding for dropdown content
                  fontSize: "9pt", // ✅ Selected value text size
                },
                "& .MuiOutlinedInput-root": {
                  padding: 0, // Ensure no extra padding
                },
                "& .MuiInputBase-input": {
                  display: "flex",
                  alignItems: "center", // Align content vertically
                  fontSize: "9pt", // ✅ Input text size
                },
              }}
            >
              <MenuItem value={"low"} sx={{ fontSize: "9pt" }}>
                Low
              </MenuItem>{" "}
              {/* ✅ Menu item text size */}
              <MenuItem value={"medium"} sx={{ fontSize: "9pt" }}>
                Medium
              </MenuItem>
              <MenuItem value={"high"} sx={{ fontSize: "9pt" }}>
                High
              </MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={6}>
          <FormControl fullWidth size="small">
            <InputLabel
              id="demo-simple-select-standard-label"
              sx={{ fontSize: "9pt" }} // ✅ Label text size
            >
              Ring Alarm
            </InputLabel>
            <Select
              labelId="demo-simple-select-standard-label"
              id="demo-simple-select-standard"
              label="Ring Alarm"
              fullWidth
              disabled={!formData.Remind_Participants}
              value={formData.Reminder_Text || ""} // Use `Reminder_Text` to display selected text
              onChange={(e) => {
                // Find the selected ring object
                const selectedRing = ringAlarm.find(
                  (ring) => ring.name === e.target.value
                );

                if (selectedRing) {
                  // Update the `Remind_At` with the calculated date/time
                  addMinutesToDateTime("remindAt", selectedRing);
                  // Update the `Reminder_Text` with the selected reminder text
                  handleInputChange("Reminder_Text", selectedRing.name);
                  handleInputChange("Remind_Participants", [
                    { period: "minutes", unit: e.target.value },
                  ]);
                }
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    fontSize: "9pt", // ✅ Dropdown menu text size
                  },
                },
              }}
              sx={{
                "& .MuiSelect-select": {
                  padding: "3px 10px", // Adjust padding for dropdown content
                  fontSize: "9pt", // ✅ Selected value text size
                },
                "& .MuiOutlinedInput-root": {
                  padding: 0, // Ensure no extra padding
                },
                "& .MuiInputBase-input": {
                  display: "flex",
                  alignItems: "center", // Align content vertically
                  fontSize: "9pt", // ✅ Input text size
                },
              }}
            >
              {ringAlarm.map((ring, index) => (
                <MenuItem
                  key={index}
                  value={ring.name}
                  sx={{ fontSize: "9pt" }}
                >
                  {" "}
                  {/* ✅ Menu item text size */}
                  {ring.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={8}>
          {/* <CustomTextField
            type="color"
            label="color"
            fullWidth
            value={formData.color}
            onChange={(e) => handleInputChange("color", e.target.value)}
          /> */}
          <CustomTextField
            fullWidth
            size="small"
            label="Location"
            variant="outlined"
            value={formData.location}
            onChange={(e) => handleInputChange("location", e.target.value)}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default FirstComponent;
