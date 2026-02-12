import React from "react";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import {
  Box,
  Checkbox,
  Divider,
  Drawer,
  FormControl,
  IconButton,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  useTheme,
} from "@mui/material";

const DrawerComponent = ({
  open,
  setOpen,
  priorityFilter,
  setPriorityFilter,
  activityTypeFilter,
  setActivityTypeFilter,
  users,
  userFilter,
  setUserFilter,
}) => {
  const theme = useTheme();
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: 48 * 4.5 + 8,
        width: 250,
      },
    },
  };
  const priority = ["Low", "Medium", "High"];
  const activityType = [
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
  ];

  const handleChange = (event) => {
    const {
      target: { value },
    } = event;
    setPriorityFilter(typeof value === "string" ? value.split(",") : value);
  };

  const handleActivityTypeChange = (event) => {
    const {
      target: { value },
    } = event;
    setActivityTypeFilter(typeof value === "string" ? value.split(",") : value);
  };

  const handleUserChange = (event) => {
    const {
      target: { value },
    } = event;
    setUserFilter(typeof value === "string" ? value.split(",") : value);
  };
  return (
    <Drawer
      sx={{
        width: 300,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: 300,
        },
      }}
      variant="persistent"
      anchor="right"
      open={open}
      onClose={() => setOpen(false)}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          padding: theme.spacing(0, 1),
          // necessary for content to be below app bar
          ...theme.mixins.toolbar,
          justifyContent: "flex-start",
        }}
      >
        <IconButton onClick={() => setOpen(false)}>
          {theme.direction === "rtl" ? (
            <ChevronLeftIcon />
          ) : (
            <ChevronRightIcon />
          )}
        </IconButton>
      </Box>
      <Divider />
      <Box p={2}>
        <FormControl fullWidth size="small">
          <InputLabel id="demo-simple-select-standard-label">
            Priority
          </InputLabel>
          <Select
            labelId="demo-simple-select-standard-label"
            id="demo-simple-select-standard"
            multiple
            value={priorityFilter} // Make sure value is an array
            onChange={handleChange} // Correct onChange handler
            MenuProps={MenuProps}
            input={<OutlinedInput label="Priority" />}
            renderValue={(selected) => selected.join(", ")}
          >
            {priority.map((item, index) => (
              <MenuItem value={item} key={index}>
                <Checkbox checked={priorityFilter.includes(item)} />
                <ListItemText primary={item} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small" sx={{ mt: 3 }}>
          <InputLabel id="activity-type-select-label">Activity Type</InputLabel>
          <Select
            labelId="activity-type-select-label"
            id="activity-type-select"
            multiple
            value={activityTypeFilter}
            onChange={handleActivityTypeChange}
            MenuProps={MenuProps}
            input={<OutlinedInput label="Activity Type" />}
            renderValue={(selected) => selected.join(", ")}
          >
            {activityType.map((activity, index) => (
              <MenuItem value={activity.type} key={index}>
                <Checkbox
                  checked={activityTypeFilter.includes(activity.type)}
                />
                <ListItemText primary={activity.type} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* User Filter */}
        <FormControl fullWidth size="small" sx={{ mt: 3 }}>
          <InputLabel>Schedule For</InputLabel>
          <Select
            multiple
            value={userFilter}
            onChange={handleUserChange}
            MenuProps={MenuProps}
            input={<OutlinedInput label="Schedule For" />}
            renderValue={(selected) => selected.join(", ")}
          >
            {users.map((user, index) => (
              <MenuItem key={index} value={user.full_name}>
                <Checkbox checked={userFilter.includes(user.full_name)} />
                <ListItemText primary={user.full_name} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Drawer>
  );
};

export default DrawerComponent;
