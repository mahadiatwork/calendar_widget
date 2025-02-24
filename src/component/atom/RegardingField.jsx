import React, { useState, useEffect } from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
} from "@mui/material";

const RegardingField = ({ formData, handleInputChange }) => {
  const predefinedOptions = [
    "Hourly Consult $220",
    "Initial Consultation Fee $165",
    "No appointments today",
    "No appointments tonight",
  ]; // The predefined options

  const [selectedValue, setSelectedValue] = useState(formData.Regarding || "");
  const [manualInput, setManualInput] = useState("");

  useEffect(() => {
    // Check if the selected value is part of the predefined options
    if (selectedValue && !predefinedOptions.includes(selectedValue)) {
      setSelectedValue("Other"); // Set to "Other" if it doesn't match any predefined option
      setManualInput(formData.Regarding); // Populate manual input with the custom value
    }
  }, [selectedValue, formData.Regarding]);

  const handleSelectChange = (event) => {
    const value = event.target.value;
    setSelectedValue(value);
    if (value !== "Other") {
      setManualInput(""); // Clear manual input if predefined option is selected
      handleInputChange("Regarding", value); // Pass the selected value to handleInputChange
    }
  };

  const handleManualInputChange = (event) => {
    const value = event.target.value;
    setManualInput(value);
    handleInputChange("Regarding", value); // Pass the manual input value to handleInputChange
  };

  return (
<Box sx={{ width: "100%", mb: "3px" }}>
  <FormControl fullWidth size="small">
    <InputLabel id="regarding-label" shrink sx={{ fontSize: "9pt" }}> {/* ✅ Label text size */}
      Regarding
    </InputLabel>
    <Select
      labelId="regarding-label"
      id="regarding-select"
      label="Regarding"
      fullWidth
      size="small"
      displayEmpty
      value={selectedValue}
      onChange={handleSelectChange}
      MenuProps={{
        PaperProps: {
          sx: {
            fontSize: "9pt", // ✅ Dropdown menu text size
          },
        },
      }}
      sx={{
        "& .MuiOutlinedInput-root": {
          padding: 0,
        },
        "& .MuiInputBase-input": {
          display: "flex",
          alignItems: "center",
          fontSize: "9pt", // ✅ Input text size
        },
        "& .MuiSelect-select": {
          padding: "4px 10px",
          fontSize: "9pt", // ✅ Selected value text size
        },
      }}
    >
      {predefinedOptions.map((option) => (
        <MenuItem key={option} value={option} sx={{ fontSize: "9pt" }}> {/* ✅ Menu item text size */}
          {option}
        </MenuItem>
      ))}
      <MenuItem value="Other" sx={{ fontSize: "9pt" }}>Other (Manually enter)</MenuItem>
    </Select>
  </FormControl>

  {selectedValue === "Other" && (
    <TextField
      label="Enter your custom regarding"
      fullWidth
      size="small"
      value={manualInput}
      onChange={handleManualInputChange}
      InputLabelProps={{ shrink: true }}
      sx={{
        mt: 2,
        mb: "3px",
        "& .MuiInputLabel-root": { fontSize: "9pt" }, // ✅ Label text size
        "& .MuiOutlinedInput-root": {
          padding: "2px",
        },
        "& .MuiInputBase-input": {
          padding: "0px 10px",
          fontSize: "9pt", // ✅ Input text size
        },
      }}
    />
  )}
</Box>

  );
};

export default RegardingField;
