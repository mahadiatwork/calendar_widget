import React from "react";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import {
  Box,
  Checkbox,
  Divider,
  Drawer,
  DrawerHeader,
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
  const priority = ["low", "medium", "high"];
  const activityType = [
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
  ]

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
      onClose={()=>setOpen(false)}
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
          <InputLabel
            id="demo-simple-select-standard-label"
          >
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

        <FormControl fullWidth size="small" sx={{mt:3}}>
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
                <Checkbox checked={activityTypeFilter.includes(activity.type)} />
                <ListItemText primary={activity.type} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Drawer>
  );
};

export default DrawerComponent;
