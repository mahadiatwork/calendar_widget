import React, { useEffect } from "react";
import "@mobiscroll/react/dist/css/mobiscroll.min.css";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormGroup,
  IconButton,
  InputLabel,
  Link,
  MenuItem,
  Tab,
  Tabs,
  TextField,
  Tooltip,
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
import {
  getResultBasedOnActivityType,
  getResultBasedOnActivityType2,
} from "../helperFunction";

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

  const logResponse = async ({
    name,
    payload,
    response,
    result,
    trigger,
    meetingType,
    Widget_Source,
  }) => {
    const timeOccurred = dayjs()
      .tz("Australia/Adelaide")
      .format("YYYY-MM-DDTHH:mm:ssZ");

    await ZOHO.CRM.API.insertRecord({
      Entity: "Log_Module",
      APIData: {
        Name: name,
        Payload_2: JSON.stringify(payload),
        Response: JSON.stringify(response),
        Result: result,
        Trigger: trigger,
        Time_Occured: timeOccurred,
        Meeting_Type: meetingType,
        Widget_Source: Widget_Source,
      },
    });
  };

  const handleSubmit = () => {
    if (formData.id !== "") {
      const transformedData = transformFormSubmission(formData);
      const config = {
        Entity: "Events",
        APIData: transformedData,
        Trigger: ["workflow"],
      };

      formData.start = new Date(formData.start);
      formData.end = new Date(formData.end);

      ZOHO.CRM.API.updateRecord(config).then(async (data) => {
        const wasSuccessful = data.data[0].code === "SUCCESS";

        await logResponse({
          name: `Update Event: ${formData.title || formData.id}`,
          Payload_2: transformedData,
          response: data,
          result: wasSuccessful ? "Success" : "Error",
          trigger: "Record Update",
          meetingType: formData.Type_of_Activity || "",
          Widget_Source: "Calendar Widget",
        });

        if (wasSuccessful) {
          setSnackbarOpen(true);
          setEvents((prevEvents) =>
            prevEvents.map((event) =>
              event.id === formData.id ? formData : event
            )
          );
          resetFormState();
        }
      });
    }

    if (formData.id === "") {
      if (formData.create_sperate_contact) {
        formData?.scheduledWith.forEach(async (item) => {
          const transformedData = transformFormSubmission(formData, item);
          try {
            const data = await ZOHO.CRM.API.insertRecord({
              Entity: "Events",
              APIData: transformedData,
              Trigger: ["workflow"],
            });

            const wasSuccessful = data.data[0].code === "SUCCESS";

            await logResponse({
              name: `Create Event for ${item.name}`,
              Payload_2: transformedData,
              response: data,
              result: wasSuccessful ? "Success" : "Error",
              trigger: "Record Create",
              meetingType: formData.Type_of_Activity || "",
              Widget_Source: "Calendar Widget",
            });

            if (wasSuccessful) {
              setSnackbarOpen(true);
              handleInputChange("id", data?.data[0]?.details?.id);
              setEvents((prev) => [
                ...prev,
                { ...formData, id: data?.data[0].details?.id },
              ]);
            }
          } catch (error) {
            await logResponse({
              name: `Create Event for ${item.name}`,
              Payload_2: transformedData,
              response: { error: error.message },
              result: "Error",
              trigger: "Record Create",
              meetingType: formData.Type_of_Activity || "",
              Widget_Source: "Calendar Widget",
            });
            console.error("Error submitting the form:", error);
          }
        });

        resetFormState();
      } else {
        const transformedData = transformFormSubmission(formData);
        formData.start = new Date(formData.start);
        formData.end = new Date(formData.end);

        ZOHO.CRM.API.insertRecord({
          Entity: "Events",
          APIData: transformedData,
          Trigger: ["workflow"],
        })
          .then(async (data) => {
            const wasSuccessful = data.data[0].code === "SUCCESS";

            await logResponse({
              name: `Create Event: ${formData.title || "Unnamed"}`,
              Payload_2: transformedData,
              response: data,
              result: wasSuccessful ? "Success" : "Error",
              trigger: "Record Create",
              meetingType: formData.Type_of_Activity || "",
              Widget_Source: "Calendar Widget",
            });

            if (wasSuccessful) {
              handleInputChange("id", data?.data[0]?.details?.id);
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
              resetFormState();
              setSnackbarOpen(true);
            }
          })
          .catch(async (error) => {
            await logResponse({
              name: `Create Event: ${formData.title || "Unnamed"}`,
              Payload_2: transformedData,
              response: { error: error.message },
              result: "Error",
              trigger: "Record Create",
              meetingType: formData.Type_of_Activity || "",
              Widget_Source: "Calendar Widget",
            });
            console.error("Error submitting the form:", error);
          });
      }
    }
  };

  // Delete existing history
  const handleDeleteHistory = async () => {
    const historyRecordId = existingHistory[0]?.id;

    const getAllHistoryXcontacts = await ZOHO.CRM.API.getRelatedRecords({
      Entity: "History1",
      RecordID: historyRecordId,
      RelatedList: "Contacts3",
      page: 1,
      per_page: 200,
    });

    const deleteResponse = await ZOHO.CRM.API.deleteRecord({
      Entity: "History1",
      RecordID: historyRecordId,
    });

    if (deleteResponse.data[0].code === "SUCCESS") {
      setActivityDetails("");
      if (getAllHistoryXcontacts.data.length > 0) {
        for (const participant of getAllHistoryXcontacts.data) {
          const relatedRecordsDelete = await ZOHO.CRM.API.deleteRecord({
            Entity: "History1",
            RecordID: participant?.id,
          });
        }
      }
      // setSnackbarMessage("History deleted successfully!");
      // setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setExistingHistory([]);
      setTimeout(() => {
        handleClose();
      }, 1000);
    } else {
      // setSnackbarMessage("Failed to delete history.");
      // setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  // Optional helper
  const resetFormState = () => {
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
  };

  useEffect(() => {
    if (formData.id !== "") {
      setEdited(true);
    }
  }, [formData]);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

  const handleDelete = (eventID) => {
    setEventToDelete(eventID);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const deleteResponse = await ZOHO.CRM.API.deleteRecord({
        Entity: "Events",
        RecordID: eventToDelete,
      });

      console.log("Event deleted successfully:", deleteResponse);

      setEvents((prevEvents) =>
        prevEvents.filter((event) => event.id !== eventToDelete)
      );
      setDeleteDialogOpen(false);
      setEventToDelete(null);
      handleClose(); // If you're closing a parent modal too
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setEventToDelete(null);
  };

  const [clearChecked, setClearChecked] = useState(
    formData?.Event_Status === "Closed"
  );
  const [eraseChecked, setEraseChecked] = useState(false);
  const [addActivityToHistory, setAddActivityToHistory] = useState(false);
  const [activityDetails, setActivityDetails] = useState(
    formData.Description || ""
  );
  const [result, setResult] = useState(formData.result || "");
  const [isActivityDetailsUpdated, setIsActivityDetailsUpdated] =
    useState(false);
  const [existingHistory, setExistingHistory] = useState([]);

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
          <Tab label="Reccurence" sx={{ fontSize: "9pt" }} />
          {/* <Tab label="Clear" sx={{ fontSize: "9pt" }} /> New tab */}
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
                <Button
                  size="small"
                  color="error"
                  onClick={() => handleDelete(clickedEvent?.id)}
                >
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
      {value === 3 && (
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Clear or Erase this event, and optionally log to history.
          </Typography>

          <FormGroup row>
            <Tooltip
              title="Mark this event as cleared and update its status"
              arrow
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={clearChecked}
                    onChange={(e) => {
                      setClearChecked(e.target.checked);
                      setEraseChecked(false);
                      setResult(
                        getResultBasedOnActivityType(formData.Type_of_Activity)
                      );
                    }}
                  />
                }
                label="Clear"
              />
            </Tooltip>
            <Tooltip title="Delete this event permanently" arrow>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={eraseChecked}
                    onChange={(e) => {
                      setEraseChecked(e.target.checked);
                      setClearChecked(false);
                      setResult(
                        getResultBasedOnActivityType(formData.Type_of_Activity)
                      );
                    }}
                  />
                }
                label="Erase"
              />
            </Tooltip>
          </FormGroup>

          <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
            <Select
              labelId="demo-select-small-label"
              id="demo-select-small"
              value={result}
              label="Age"
              onChange={handleChange}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value={10}>Ten</MenuItem>
              <MenuItem value={20}>Twenty</MenuItem>
              <MenuItem value={30}>Thirty</MenuItem>
            </Select>
          </FormControl>

          {/* <FormControl fullWidth>
            <Select
              value={result}
              onChange={(e) => setResult(e.target.value)}
              size="small"
              sx={{ marginLeft: 2, minWidth: 150, fontSize: "9pt" }}
            >
              {getResultBasedOnActivityType2(formData.Type_of_Activity).map(
                (option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                )
              )}
            </Select>
          </FormControl> */}

          {existingHistory.length > 0 ? (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">
                Existing History:
                <Link
                  href={`https://crm.zoho.com.au/crm/org7004396182/tab/CustomModule4/${existingHistory[0].id}`}
                  target="_blank"
                  rel="noopener"
                  sx={{ ml: 1 }}
                >
                  View
                </Link>
                <Button
                  size="small"
                  variant="outlined"
                  color="secondary"
                  sx={{ ml: 2 }}
                  onClick={handleDeleteHistory}
                >
                  Delete History
                </Button>
              </Typography>
            </Box>
          ) : (
            <FormControlLabel
              control={
                <Checkbox
                  checked={addActivityToHistory}
                  onChange={(e) => {
                    setAddActivityToHistory(e.target.checked);
                    if (!e.target.checked) setActivityDetails("");
                    else setActivityDetails(formData.Description || "");
                  }}
                />
              }
              label="Add Activity Details to History"
            />
          )}

          <TextField
            fullWidth
            label="Activity Details"
            value={activityDetails}
            onChange={(e) => {
              setActivityDetails(e.target.value);
              setIsActivityDetailsUpdated(true);
            }}
            margin="dense"
            multiline
            minRows={4}
            size="small"
            disabled={!addActivityToHistory}
            sx={{ mt: 2 }}
          />

          <Box display="flex" justifyContent="space-between" mt={3}>
            <Button size="small" variant="contained" onClick={handleBack}>
              Back
            </Button>
            <Button
              size="small"
              variant="contained"
              color="primary"
              onClick={handleSubmit}
            >
              Ok
            </Button>
          </Box>
        </Box>
      )}

      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">Delete Event</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this event? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EventForm;
