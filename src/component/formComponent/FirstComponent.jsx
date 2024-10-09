import {
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
} from "@mui/material";
import React from "react";
import CustomTextField from "../atom/CustomTextField";
import { useState } from "react";
import { Datepicker } from "@mobiscroll/react";

const FirstComponent = ({ formData, handleInputChange }) => {
  const [openStartDatepicker, setOpenStartDatepicker] = useState(false);
  const [openEndDatepicker, setOpenEndDatepicker] = useState(false);
  const [activityType, setActivityType] = useState([
    { type: "meeting", resource: 1 },
    { type: "todo", resource: 2 },
    { type: "appointment", resource: 3 },
    { type: "boardroom", resource: 4 },
    { type: "call_billing", resource: 5 },
    { type: "email_billing", resource: 6 },
    { type: "initial_consultation", resource: 7 },
    { type: "call", resource: 8 },
    { type: "mail", resource: 9 },
    { type: "meeting_billing", resource: 10 },
    { type: "personal_activity", resource: 11 },
    { type: "room_1", resource: 12 },
    { type: "room_2", resource: 13 },
    { type: "room_3", resource: 14 },
    { type: "todo_billing", resource: 15 },
    { type: "vacation", resource: 16 },
  ]);
  const [associateWith, setAssociateWith] = useState([
    "mark",
    "tony",
    "mahadi",
    "fahim",
  ]);
  const [openDatepicker, setOpenDatepicker] = useState(false);

  const handleActivityChange = (event) => {
    const selectedType = event.target.value;
    const selectedActivity = activityType.find(
      (item) => item.type === selectedType
    );

    if (selectedActivity) {
      // Update both the activity type and the resource
      handleInputChange("title", selectedActivity.type);
      handleInputChange("resource", selectedActivity.resource);
    }
  };

  const customInputComponent = (field, placeholder, openDatepickerState) => {
    return (
      <CustomTextField
        fullWidth
        size="small"
        placeholder={placeholder}
        variant="outlined"
        value={formData[field]}
        onClick={() => openDatepickerState(true)}
      />
    );
  };

  return (
    <Box>
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid size={12}>
          <CustomTextField
            fullWidth
            size="small"
            placeholder="Event_title"
            variant="outlined"
            value={formData.Event_title}
            onChange={(e) => handleInputChange("Event_title", e.target.value)}
          />
        </Grid>

        <Grid size={12}>
          <FormControl fullWidth size="small">
            <InputLabel
              id="demo-simple-select-standard-label"
              sx={{ top: "-5px" }}
            >
              Activity type
            </InputLabel>
            <Select
              labelId="demo-simple-select-standard-label"
              id="demo-simple-select-standard"
              label="Activity type"
              fullWidth
              value={formData.title}
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

        <Grid size={4}>
          
        <Datepicker
            controls={["calendar","time"]}
            display="center"
            inputComponent={() =>
              customInputComponent("start", "Start Time", setOpenStartDatepicker)
            }
            onClose={() => setOpenStartDatepicker(false)}
            onChange={(e) => handleInputChange("start", e.value)}
            isOpen={openStartDatepicker}
          />
        </Grid>
        <Grid size={4}>
          
        <Datepicker
            controls={["calendar","time"]}
            display="center"
            inputComponent={() =>
              customInputComponent("end", "End Time", setOpenEndDatepicker)
            }
            onClose={() => setOpenEndDatepicker(false)}
            onChange={(e) => handleInputChange("end", e.value)}
            isOpen={openEndDatepicker}
          />
        </Grid>
        <Grid size={4}>
          <FormControl fullWidth size="small">
            <InputLabel
              id="demo-simple-select-standard-label"
              sx={{ top: "-5px" }}
            >
              Duration
            </InputLabel>
            <Select
              labelId="demo-simple-select-standard-label"
              id="demo-simple-select-standard"
              label="Duration"
              fullWidth
              value={formData.duration}
              onChange={(e) => handleInputChange("duration", e.target.value)}
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
              <MenuItem value={10}>5 minutes</MenuItem>
              <MenuItem value={20}>10 minutes</MenuItem>
              <MenuItem value={30}>15 minutes</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid size={12}>
          <FormControl fullWidth size="small">
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
          </FormControl>
          {/* <CustomTextField
            fullWidth
            size="small"
            placeholder="Associate with"
            variant="outlined"
            value={formData.associateWith}
            onChange={(e) => handleInputChange("associateWith", e.target.value)}
          /> */}
        </Grid>

        <Grid size={12}>
          <FormControl fullWidth size="small">
            <InputLabel
              id="demo-simple-select-standard-label"
              sx={{ top: "-5px" }}
            >
              Schedule with
            </InputLabel>
            <Select
              labelId="demo-simple-select-standard-label"
              id="demo-simple-select-standard"
              label="Schedule with"
              fullWidth
              multiple
              value={formData.scheduleWith} // Use formData.scheduleWith, which is an array
              onChange={
                (e) => handleInputChange("scheduleWith", e.target.value) // Ensure this updates as an array
              }
              MenuProps={{
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
          </FormControl>
        </Grid>

        <Grid size={6}>
          <FormControl fullWidth size="small" sx={{ minHeight: "20px" }}>
            <InputLabel
              id="demo-simple-select-standard-label"
              sx={{ top: "-5px" }}
            >
              Schedule for ...
            </InputLabel>
            <Select
              labelId="demo-simple-select-standard-label"
              id="demo-simple-select-standard"
              label="Schedule for"
              fullWidth
              value={formData.scheduleFor}
              onChange={(e) => handleInputChange("scheduleFor", e.target.value)}
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
              <MenuItem value={10}>Low</MenuItem>
              <MenuItem value={20}>Medium</MenuItem>
              <MenuItem value={30}>High</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={6}>
          <CustomTextField
            fullWidth
            size="small"
            placeholder="Location"
            variant="outlined"
            value={formData.location}
            onChange={(e) => handleInputChange("location", e.target.value)}
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
              <MenuItem value={10}>Low</MenuItem>
              <MenuItem value={20}>Medium</MenuItem>
              <MenuItem value={30}>High</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={4}>
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
              value={formData.ringAlarm}
              onChange={(e) => handleInputChange("ringAlarm", e.target.value)}
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
              <MenuItem value={10}>5 minutes</MenuItem>
              <MenuItem value={20}>10 minutes</MenuItem>
              <MenuItem value={30}>15 minutes</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={4}>
          <CustomTextField
            type="color"
            label="color"
            fullWidth
            value={formData.color}
            onChange={(e) => handleInputChange("color", e.target.value)}
          />
        </Grid>
      </Grid>

      <FormControlLabel
        control={<Checkbox />}
        label="Create separate activity for each contact"
      />
    </Box>
  );
};

export default FirstComponent;
