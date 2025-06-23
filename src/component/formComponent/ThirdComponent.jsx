import {
  Box,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid2 as Grid,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Datepicker } from "@mobiscroll/react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import CustomTextField from "../atom/CustomTextField";

dayjs.extend(utc);
dayjs.extend(timezone);

const ThirdComponent = ({ formData, handleInputChange, clickedEvent }) => {
  const [openStartDatepicker, setOpenStartDatepicker] = useState(false);
  const [openEndDatepicker, setOpenEndDatepicker] = useState(false);

  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const recurrence = formData?.occurrence;

    if (!formData.startTime) {
      const currentTime = dayjs().toISOString();
      handleInputChange("startTime", currentTime);
      handleInputChange(
        "endTime",
        dayjs(currentTime).add(1, "year").toISOString()
      );
    }

    if (recurrence && typeof recurrence === "object" && recurrence.RRULE) {
      const ruleParts = recurrence.RRULE.split(";").reduce((acc, part) => {
        const [key, val] = part.split("=");
        acc[key] = val;
        return acc;
      }, {});

      if (ruleParts.DTSTART) {
        const datePart = dayjs(ruleParts.DTSTART);

        const timeStart = clickedEvent?.start
          ? dayjs(clickedEvent.start)
          : null;
        const timeEnd = clickedEvent?.end ? dayjs(clickedEvent.end) : null;

        const mergedStart = timeStart
          ? datePart.hour(timeStart.hour()).minute(timeStart.minute()).second(0)
          : datePart;

        const mergedEnd = timeEnd
          ? dayjs(ruleParts.UNTIL)
              .hour(timeEnd.hour())
              .minute(timeEnd.minute())
              .second(0)
          : datePart.add(1, "hour");

        handleInputChange("startTime", mergedStart.toISOString());
        handleInputChange("endTime", mergedEnd.toISOString());

        const freqMap = {
          DAILY: "daily",
          WEEKLY: "weekly",
          MONTHLY: "monthly",
          YEARLY: "yearly",
        };
        const freq = ruleParts.FREQ;
        if (freq && freqMap[freq]) {
          handleInputChange("occurrence", freqMap[freq]);
        }
      }
    } else {
      const timeStart = dayjs(formData.start);
      const timeEnd = dayjs(formData.end);
      handleInputChange("startTime", timeStart);
      handleInputChange("endTime", timeEnd);
    }
  }, []);

  const CustomInputComponent = useCallback(({ field, formattedDate }) => {
    return (
      <CustomTextField
        fullWidth
        size="small"
        label=""
        variant="outlined"
        value={formattedDate}
        onClick={() => {
          if (field === "startTime") {
            setOpenStartDatepicker(true);
          } else {
            setOpenEndDatepicker(true);
          }
        }}
      />
    );
  }, []);

  return (
    <Box>
      <FormControl>
        <FormLabel id="frequency-radio-group" sx={{ fontSize: "9pt" }}>
          Frequency
        </FormLabel>
        <RadioGroup
          aria-labelledby="frequency-radio-group"
          name="occurrence"
          value={formData.occurrence || "once"}
          onChange={(e) => handleInputChange("occurrence", e.target.value)}
        >
          <FormControlLabel
            value="once"
            control={<Radio size="small" />}
            label="Once (This activity occurs only once)"
            sx={{ "& .MuiTypography-root": { fontSize: "9pt" } }}
          />
          <FormControlLabel
            value="daily"
            control={<Radio size="small" />}
            label="Daily (This activity occurs daily)"
            sx={{ "& .MuiTypography-root": { fontSize: "9pt" } }}
          />
          <FormControlLabel
            value="weekly"
            control={<Radio size="small" />}
            label="Weekly (This activity occurs weekly)"
            sx={{ "& .MuiTypography-root": { fontSize: "9pt" } }}
          />
          <FormControlLabel
            value="monthly"
            control={<Radio size="small" />}
            label="Monthly (This activity occurs monthly)"
            sx={{ "& .MuiTypography-root": { fontSize: "9pt" } }}
          />
          <FormControlLabel
            value="yearly"
            control={<Radio size="small" />}
            label="Yearly (This activity occurs yearly)"
            sx={{ "& .MuiTypography-root": { fontSize: "9pt" } }}
          />
        </RadioGroup>
      </FormControl>

      <Grid container spacing={2} sx={{ mt: 1, py: 1 }}>
        <Grid size={6}>
          <Box display="flex" alignItems="center">
            <Typography
              variant="body1"
              sx={{ fontSize: "9pt", minWidth: "80px" }}
            >
              Starts:
            </Typography>
            <Datepicker
              controls={["calendar", "time"]}
              calendarType="month"
              display="center"
              calendarScroll="vertical"
              inputComponent={() => {
                const dateValue = formData?.startTime;
                const formattedDate =
                  dateValue && dayjs(dateValue).isValid()
                    ? dayjs(dateValue).format("DD/MM/YYYY hh:mm A")
                    : "";
                return (
                  <CustomInputComponent
                    field="startTime"
                    formattedDate={formattedDate}
                  />
                );
              }}
              onClose={() => setOpenStartDatepicker(false)}
              onChange={(e) => {
                handleInputChange("startTime", e.value);
              }}
              isOpen={openStartDatepicker}
            />
          </Box>
        </Grid>
        <Grid size={6}>
          <Box display="flex" alignItems="center">
            <Typography
              variant="body1"
              sx={{ fontSize: "9pt", minWidth: "80px" }}
            >
              Ends:
            </Typography>
            <Datepicker
              controls={["calendar", "time"]}
              calendarType="month"
              display="center"
              disabled={formData.noEndDate}
              calendarScroll="vertical"
              inputComponent={() => {
                const dateValue = formData?.endTime;
                const formattedDate =
                  dateValue && dayjs(dateValue).isValid()
                    ? dayjs(dateValue).format("DD/MM/YYYY hh:mm A")
                    : "";
                return (
                  <CustomInputComponent
                    field="endTime"
                    formattedDate={formattedDate}
                  />
                );
              }}
              onClose={() => setOpenEndDatepicker(false)}
              onChange={(e) => {
                const selectedDate = dayjs(e.value); // Only take the date part
                const currentTime = dayjs(formData?.endTime); // Only take the time part

                // Merge: use the date from selectedDate, and time from currentTime
                const mergedDateTime = selectedDate
                  .hour(currentTime.hour())
                  .minute(currentTime.minute())
                  .second(currentTime.second());

                handleInputChange("endTime", mergedDateTime.toISOString());
              }}
              isOpen={openEndDatepicker}
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ThirdComponent;
