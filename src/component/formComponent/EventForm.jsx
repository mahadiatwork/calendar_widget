import React, { useEffect } from "react";
import "@mobiscroll/react/dist/css/mobiscroll.min.css";
import {
  Box,
  Button,
  IconButton,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import "react-quill/dist/quill.snow.css";
import CloseIcon from "@mui/icons-material/Close";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { Input, Select, Textarea } from "@mobiscroll/react";
import ReactQuill from "react-quill";

import FirstComponent from "./FirstComponent";
import SecondComponent from "./SecondComponent";
import ThirdComponent from "./ThirdComponent";
import { transformFormSubmission } from "../handleDataFormatting";

const ZOHO = window.ZOHO;

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );
}

function addDurationToDateTime(dateString, duration) {
  // Convert the date string to a Date object
  let date = new Date(dateString);

  // Split the duration into hours and minutes
  const [hours, minutes] = duration.split(":").map(Number);

  // Add the duration to the date object
  date.setHours(date.getHours() + hours);
  date.setMinutes(date.getMinutes() + minutes);

  // Format the date back to a string (keeping the original format)
  const modifiedDate = date.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:MM"

  return modifiedDate;
}

function getLocalDateTime() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed, so add 1
  const day = String(today.getDate()).padStart(2, "0");
  const hours = String(today.getHours()).padStart(2, "0"); // Local hours
  const minutes = String(today.getMinutes()).padStart(2, "0"); // Local minutes

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

const EventForm = ({
  myEvents,
  setEvents,
  setOpen,
  onClose,
  activityType,
  setActivityType,
  selectedDate,
  setSelectedDate,
  formData,
  setFormData,
  handleInputChange,
  users,
  recentColor,
  setRecentColor,
  clickedEvent,
  setClickedEvent,
  argumentLoader,
  snackbarOpen,
  setSnackbarOpen,
  loggedInUser,
}) => {
  const [value, setValue] = useState(0);
  const [edited, setEdited] = useState(false);
  const todayDate = getLocalDateTime();

  dayjs.extend(utc);
  dayjs.extend(timezone);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  // Handlers for Next and Back buttons
  const handleNext = () => {
    if (value < 2) setValue(value + 1); // Increment to next tab
  };

  const handleBack = () => {
    if (value > 0) setValue(value - 1); // Decrement to previous tab
  };

  const handleClose = () => {
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
      Send_Reminders: false,
    });
    onClose();
    setOpen(false);
  };

  const handleSubmit = () => {
    // const transformedData = transformFormSubmission(formData);
    // Add your submit logic here (e.g., send data to the backend)
    // setEvents((prev) => [...prev, formData]);

    if (formData.id !== "") {
      const transformedData = transformFormSubmission(formData);
      var config = {
        Entity: "Events",
        APIData: transformedData,
        Trigger: ["workflow"],
      };

      formData.start = new Date(formData.start);
      formData.end = new Date(formData.end);

      ZOHO.CRM.API.updateRecord(config).then(function (data) {
        if (data.data[0].code === "SUCCESS") {
          setSnackbarOpen(true);
          setEvents((prevEvents) =>
            prevEvents.map((event) =>
              event.id === formData.id ? formData : event
            )
          );
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
            Send_Reminders: false,
          });
          setClickedEvent(null);
          setOpen(false);
        }
      });
    }
    if (formData.id === "") {
      if (formData.create_sperate_contact) {
        formData?.scheduledWith.forEach((item, index) => {
          const transformedData = transformFormSubmission(formData, item);
          console.log({ transformedData });
          ZOHO.CRM.API.insertRecord({
            Entity: "Events",
            APIData: transformedData,
            Trigger: ["workflow"],
          })
            .then((data) => {
              if (data.data[0].code === "SUCCESS") {
                console.log(data?.data);
                setSnackbarOpen(true);
                handleInputChange("id", data?.data[0]?.details?.id);
                setEvents((prev) => [
                  ...prev,
                  { ...formData, id: data?.data[0].details?.id },
                ]);
              }
            })
            .catch((error) => {
              console.error("Error submitting the form:", error);
            });
        });
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
        setOpen(false);
      } else {
        const transformedData = transformFormSubmission(formData);
        formData.start = new Date(formData.start);
        formData.end = new Date(formData.end);
        ZOHO.CRM.API.insertRecord({
          Entity: "Events",
          APIData: transformedData,
          Trigger: ["workflow"],
        })
          .then((data) => {
            if (data.data[0].code === "SUCCESS") {
              handleInputChange("id", data?.data[0]?.details?.id);
              console.log({
                key: {
                  ...formData,
                  id: data?.data[0].details?.id,
                  scheduleFor: {
                    name: formData.scheduleFor.full_name,
                    id: formData.scheduleFor.id,
                    email: formData.scheduleFor.email,
                  },
                },
              });
              setEvents((prev) => [
                ...prev,
                {
                  ...formData,
                  id: data?.data[0].details?.id,
                  scheduleFor: {
                    name: formData.scheduleFor.full_name,
                    id: formData.scheduleFor.id,
                    email: formData.scheduleFor.email,
                  },
                },
              ]);

              // console.log({myEvents})
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
                Send_Reminders: false,
              });
              setClickedEvent(null);
              setOpen(false);
              setSnackbarOpen(true);
            }
          })
          .catch((error) => {
            console.error("Error submitting the form:", error);
          });
      }
    }
  };

  useEffect(() => {
    if (formData.id !== "") {
      setEdited(true);
    }
  }, [formData]);

  const handleDelete = async (eventID) => {
    const confirmed = window.confirm("Are you sure you want to delete this event?");
    
    if (!confirmed) return;
  
    try {
      const deleteResponse = await ZOHO.CRM.API.deleteRecord({
        Entity: "Events",
        RecordID: eventID,
      });
  
      console.log("Event deleted successfully:", deleteResponse);
  
      // Update the events state to reflect the deletion
      setEvents((prevEvents) => prevEvents.filter(event => event.id !== eventID));
      handleClose()
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };
  
  

  if (argumentLoader) {
    return (
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 650,
          bgcolor: "background.paper",
          border: "2px solid #000",
          boxShadow: 24,
          p: 2,
          borderRadius: 5,
        }}
      >
        <Box height={15}>
          <Button
            variant="outlined"
            onClick={() => handleClose()}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
            }}
            startIcon={<CloseIcon />}
          >
            Cancel
          </Button>
          <IconButton aria-label="close">
            <CloseIcon />
          </IconButton>
        </Box>
        <Typography variant="h3" color="primary">
          Loading...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "90%",
        maxWidth: "750px",
        bgcolor: "background.paper",
        borderRadius: 4,
        boxShadow: 24,
        overflowY: "auto",
        maxHeight: "90vh", // Ensure the modal is scrollable if content exceeds the viewport
        zIndex: 100,
        p: "15px 30px  20px 30px",
      }}
    >
      <Box display="flex" justifyContent="space-between" sx={{ padding: 0 }}>
        {/* <Typography
          variant="subtitle1"
          sx={{ fontWeight: "bold" }}
          align="center"
        >
          Create Activity
        </Typography> */}
        <Box></Box>
        <Button
          variant="outlined"
          color="error"
          size="small"
          onClick={handleClose}
          endIcon={<CloseIcon />}
        >
          Cancel
        </Button>
      </Box>
      <Box>
        <Tabs
          value={value}
          onChange={handleChange}
          textColor="inherit"
          aria-label="simple tabs example"
          size="small"
        >
          <Tab label="General" sx={{ fontSize: "9pt" }} />
          <Tab label="Details" sx={{ fontSize: "9pt" }} />
          <Tab label="Reccurence" sx={{ fontSize: "9pt" }} F />
        </Tabs>
      </Box>
      {value === 0 && (
        <Box sx={{ p: 0, borderRadius: 1 }}>
          <FirstComponent
            formData={formData}
            handleInputChange={handleInputChange}
            selectedDate={selectedDate}
            activityType={activityType}
            setActivityType={setActivityType}
            users={users}
            recentColor={recentColor}
            setRecentColor={setRecentColor}
            clickedEvent={clickedEvent}
          />
          <Box display="flex" justifyContent="space-between" mt={2}>
           <Box>
           <Button size="small" disabled>
              Back
            </Button>{" "}
            {clickedEvent?.id && (
              <Button size="small" color="error" onClick={() => handleDelete(clickedEvent?.id)}>
                Delete
              </Button>
            )}
           </Box>
            <Box>
              <Button
                size="small"
                variant="contained"
                color="primary"
                onClick={handleNext}
                sx={{ mr: 2 }}
              >
                Next
              </Button>
              <Button
                size="small"
                disabled={
                  formData?.scheduledWith?.length > 0 || edited ? false : true
                }
                variant="contained"
                color="secondary"
                onClick={handleSubmit}
              >
                {/* {formData.id !== "" ? "Update" : "Submit"} */}
                Ok
                {/* Submit */}
              </Button>
            </Box>
          </Box>
        </Box>
      )}
      {value === 1 && (
        <Box sx={{ p: 1, borderRadius: 1 }}>
          {/* <SecondComponent /> */}
          {/* <ReactQuill
          theme="snow"
          style={{ height: 250, marginBottom: 80 }}
          value={formData.quillContent}
          onChange={(content) => handleInputChange("quillContent", content)}
        /> */}
          <TextField
            multiline
            rows={10}
            fullWidth
            defaultValue={formData.Description}
            // value={formData.Description}
            onChange={(e) => handleInputChange("Description", e.target.value)}
          />
          <Box display="flex" justifyContent="space-between" mt={2}>
            <Button
              size="small"
              variant="contained"
              color="primary"
              onClick={handleBack}
            >
              Back
            </Button>
            <Box>
              <Button
                size="small"
                variant="contained"
                color="primary"
                onClick={handleNext}
                sx={{ mr: 2 }}
              >
                Next
              </Button>
              <Button
                size="small"
                disabled={
                  formData?.scheduledWith?.length > 0 || edited ? false : true
                }
                variant="contained"
                color="secondary"
                onClick={handleSubmit}
              >
                {/* {formData.id !== "" ? "Update" : "Submit"} */}
                Ok
                {/* Submit */}
              </Button>
            </Box>
          </Box>
        </Box>
      )}
      {value === 2 && (
        <Box sx={{ p: 2, borderRadius: 1 }}>
          <ThirdComponent
            formData={formData}
            handleInputChange={handleInputChange}
          />
          <Box display="flex" justifyContent="space-between" mt={2}>
            <Button
              size="small"
              variant="contained"
              color="primary"
              onClick={handleBack}
            >
              Back
            </Button>
            <Button
              size="small"
              disabled={
                formData?.scheduledWith?.length > 0 || edited ? false : true
              }
              variant="contained"
              color="secondary"
              onClick={handleSubmit}
            >
              {/* {formData.id !== "" ? "Update" : "Ok"} */}
              Ok
              {/* Submit */}
            </Button>{" "}
            {/* Next is disabled on the last tab */}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default EventForm;
