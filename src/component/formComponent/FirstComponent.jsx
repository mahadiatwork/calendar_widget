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

const FirstComponent = ({
  formData,
  handleInputChange,
  selectedDate,
  activityType,
  setActivityType,
  users,
  recentColor,
  setRecentColor,
}) => {
  dayjs.extend(utc);
  dayjs.extend(timezone);
  const [openStartDatepicker, setOpenStartDatepicker] = useState(false);
  const [openEndDatepicker, setOpenEndDatepicker] = useState(false);
  const [displayColorPicker, setDisplayColorPicker] = useState(false);
  const [startValue, setStartValue] = useState(dayjs(formData.start));
  const [endValue, setEndValue] = useState(dayjs(formData.end));

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
    // // Create a new Date object using the start time from formData
    // console.log(formatType,durationInMinutes)
    if (formatType === "duration") {
      let date = new Date(formData.start);

      date.setMinutes(date.getMinutes() + parseInt(durationInMinutes, 10));
      const localDate = new Date(
        date.getTime() - date.getTimezoneOffset() * 60000
      );

      const modifiedDate = localDate.toISOString().slice(0, 16);

      handleInputChange("end", modifiedDate);
      setEndValue(dayjs(modifiedDate));
    } else {
      let date = new Date(formData.start);

      date.setMinutes(
        date.getMinutes() - parseInt(durationInMinutes.value, 10)
      );

      const localDate = new Date(
        date.getTime() - date.getTimezoneOffset() * 60000
      );

      const modifiedDate = localDate.toISOString().slice(0, 16);

      handleInputChange("Remind_At", modifiedDate);
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
    console.log("fahim", e.$d);
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

  const handleNotificationChange = (e)=>{
    handleInputChange("$send_notification", e.target.checked) 
  }

  return (
    <Box>
      <Grid container columns={18} spacing={2} sx={{ mt: 2 }}>
        <Grid size={18}>
          <CustomTextField
            fullWidth
            size="small"
            label="Event_title"
            variant="outlined"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
          />
        </Grid>

        <Grid size={18}>
          <FormControl fullWidth size="small">
            <InputLabel id="demo-simple-select-standard-label">
              Activity type
            </InputLabel>
            <Select
              labelId="demo-simple-select-standard-label"
              id="demo-simple-select-standard"
              label="Activity type"
              fullWidth
              value={formData.Type_of_Activity}
              InputLabelProps={{ shrink: true }}
              onChange={handleActivityChange}
              MenuProps={{
                //   disablePortal: true,  // This ensures the dropdown is not restricted to the modal's container
                PaperProps: {
                  style: {
                    zIndex: 1300, // Increase this if necessary, depending on the z-index of your popup
                  },
                },
              }}
              sx={{
                "& .MuiSelect-select": {
                  padding: "4px 10px", // Adjust the padding to shrink the Select content
                },
                "& .MuiOutlinedInput-root": {
                  // height: '40px', // Set a consistent height
                  padding: 0, // Ensure no extra padding
                },
                "& .MuiInputBase-input": {
                  display: "flex",
                  alignItems: "center", // Align the content vertically
                },
              }}
            >
              {activityType.map((item, index) => (
                <MenuItem value={item.type} key={index}>
                  {item.type}
                </MenuItem>
              ))}
              {/* <MenuItem value="">
                <em>None</em>
              </MenuItem>
              
              <MenuItem value={20}>Twenty</MenuItem>
              <MenuItem value={30}>Thirty</MenuItem> */}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={7}>
          {/* <Datepicker
            controls={["calendar", "time"]}
            display="center"
            inputComponent={() =>
              customInputComponent(
                "start",
                "Start Time",
                setOpenStartDatepicker
              )
            }
            returnFormat="iso8601"
            onClose={() => setOpenStartDatepicker(false)}
            onChange={(e) => handleInputChange("start", e.value)}
            isOpen={openStartDatepicker}
          /> */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              label="Start Time"
              value={startValue}
              disabled={formData.Banner ? true : false}
              slotProps={{ textField: { size: "small" } }}
              onChange={(e) => {
                const addedHour = new Date(dayjs(e.$d).add(1, "hour").toDate());
                handleInputChange("start", e.$d);
                handleInputChange("end", addedHour);
                setEndValue(dayjs(addedHour));
                console.log(e.$d);
                console.log(addedHour);
              }}
              sx={{ "& input": { py: 0 } }}
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
              sx={{ "& input": { py: 0 } }}
              renderInput={(params) => <TextField {...params} size="small" />}
              format="DD/MM/YYYY hh:mm A" // Ensures 24-hour format for clarity
            />
          </LocalizationProvider>
        </Grid>
        <Grid size={4}>
          <FormControl fullWidth size="small">
            <InputLabel
              id="demo-simple-select-standard-label"
              // sx={{ top: "-5px" }}
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
                },
                "& .MuiOutlinedInput-root": {
                  // height: '40px', // Set a consistent height
                  padding: "3px 0px", // Ensure no extra padding
                },
                "& .MuiInputBase-input": {
                  display: "flex",
                  alignItems: "center", // Align the content vertically
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

        <Grid size={9} alignItems={"center"}>
          <FormControlLabel
            sx={{ height: "35px" }}
            control={
              <Checkbox
                size="small"
                checked={formData.Banner}
                onChange={handleBannerChecked}
              />
            }
            label="Banner/Timeless"
          />
        </Grid>
        <Grid size={9} alignItems={"center"}>
          <FormControlLabel
            sx={{ height: "35px" }}
            control={
              <Checkbox
                size="small"
                checked={formData.$send_notification}
                onChange={handleNotificationChange}
              />
            }
            label="Send notification"
          />
        </Grid>

        <Grid size={18}>
          {/* <FormControl fullWidth size="small">
            <InputLabel
              id="demo-simple-select-standard-label"
              sx={{ top: "-5px" }}
            >
              Associate with
            </InputLabel>
            <Select
              labelId="demo-simple-select-standard-label"
              id="demo-simple-select-standard"
              label="Associate with"
              fullWidth
              value={formData.associateWith}
              onChange={(e) =>
                handleInputChange("associateWith", e.target.value)
              }
              MenuProps={{
                //   disablePortal: true,  // This ensures the dropdown is not restricted to the modal's container
                PaperProps: {
                  style: {
                    zIndex: 1300, // Increase this if necessary, depending on the z-index of your popup
                  },
                },
              }}
              sx={{
                "& .MuiSelect-select": {
                  padding: "3px 10px", // Adjust the padding to shrink the Select content
                },
                "& .MuiOutlinedInput-root": {
                  // height: '40px', // Set a consistent height
                  padding: 0, // Ensure no extra padding
                },
                "& .MuiInputBase-input": {
                  display: "flex",
                  alignItems: "center", // Align the content vertically
                },
              }}
            >
              {associateWith.map((item, index) => (
                <MenuItem value={item} key={index}>
                  {item}
                </MenuItem>
              ))}
            </Select>
          </FormControl> */}
          <AccountField
            value={formData.associateWith} // Use formData
            handleInputChange={handleInputChange}
          />
        </Grid>

        <Grid size={18}>
          <ContactField
            value={formData.scheduleWith} // Use formData
            handleInputChange={handleInputChange}
            formData={formData}
          />
        </Grid>

        <Grid size={18}>
          <FormControl fullWidth size="small" sx={{ minHeight: "20px" }}>
            <Autocomplete
              id="schedule-for-autocomplete"
              size="small"
              options={users}
              getOptionLabel={(option) => option.full_name || ""}
              value={formData.scheduleFor || ""} // Use formData
              onChange={(event, newValue) => {
                handleInputChange("scheduleFor", newValue || "");
              }}
              renderInput={(params) => (
                <TextField
                  size="small"
                  {...params}
                  label="Schedule for ..."
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      padding: "0px", // Remove padding around the input
                      minHeight: "28px", // Set a minimum height for the input field
                      height: "28px", // Set the desired height
                    },
                    "& .MuiInputBase-input": {
                      padding: "1px 6px", // Adjust padding inside the input
                      minHeight: "30px", // Match the input's height
                      display: "flex",
                      alignItems: "center",
                      fontSize: "14px", // Optionally reduce the font size for more compact design
                    },
                  }}
                />
              )}
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
          <FormControl fullWidth size="small" sx={{ minHeight: "20px" }}>
            <InputLabel
              id="demo-simple-select-standard-label"
              sx={{ top: "-5px" }}
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
              sx={{
                "& .MuiSelect-select": {
                  padding: "3px 10px", // Adjust the padding to shrink the Select content
                },
                "& .MuiOutlinedInput-root": {
                  // height: '40px', // Set a consistent height
                  padding: 0, // Ensure no extra padding
                },
                "& .MuiInputBase-input": {
                  display: "flex",
                  alignItems: "center", // Align the content vertically
                },
              }}
            >
              <MenuItem value={"low"}>Low</MenuItem>
              <MenuItem value={"medium"}>Medium</MenuItem>
              <MenuItem value={"high"}>High</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={6}>
          <FormControl fullWidth size="small">
            <InputLabel
              id="demo-simple-select-standard-label"
              sx={{ top: "-5px" }}
            >
              Ring Alarm
            </InputLabel>
            <Select
              labelId="demo-simple-select-standard-label"
              id="demo-simple-select-standard"
              label="Ring Alarm"
              fullWidth
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
                }
              }}
              sx={{
                "& .MuiSelect-select": {
                  padding: "3px 10px", // Adjust the padding to shrink the Select content
                },
                "& .MuiOutlinedInput-root": {
                  padding: 0, // Ensure no extra padding
                },
                "& .MuiInputBase-input": {
                  display: "flex",
                  alignItems: "center", // Align the content vertically
                },
              }}
            >
              {ringAlarm.map((ring, index) => (
                <MenuItem key={index} value={ring.name}>
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

        <Grid size={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.create_sperate_contact}
                disabled={formData.id !== "" ? true : false}
                onChange={(e) =>
                  handleInputChange("create_sperate_contact", e.target.value)
                }
              />
            }
            label="Create separate activity for each contact"
          />
        </Grid>

        <Grid size={6} sx={{ display: "flex", alignItems: "center" }}>
          <Box display="flex" alignItems="center" p={0}>
            <Typography variant="body1" sx={{ minWidth: "60px" }}>
              Color
            </Typography>
            {/* <input
              type="color"
              name="color"
              value={formData.color}
              onChange={(e) => handleInputChange("color", e.target.value)}
            /> */}
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
                <Box
                  sx={{
                    position: "absolute",
                    zIndex: "2",
                  }}
                >
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
      </Grid>
    </Box>
  );
};

export default FirstComponent;
