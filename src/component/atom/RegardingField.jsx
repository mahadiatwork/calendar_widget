import React, { useState, useEffect } from "react";
import { FormControl, InputLabel, Select, MenuItem, TextField, Box } from "@mui/material";
import { getRegardingOptions } from "./helperFunc";

const RegardingField = ({ formData, handleInputChange }) => {
  const existingValue = formData.Regarding;
  const predefinedOptions = getRegardingOptions(formData.Type_of_Activity, existingValue);

  const [selectedValue, setSelectedValue] = useState("");
  const [manualInput, setManualInput] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);

  useEffect(() => {
    if (existingValue) {
      if (predefinedOptions.includes(existingValue)) {
        setSelectedValue(existingValue);
        setManualInput("");
        // setShowManualInput(false);
      } else {
        setSelectedValue("Other");
        setManualInput(existingValue);
        setShowManualInput(true);
      }
    } else {
      setSelectedValue("");
      setManualInput("");
      // setShowManualInput(false);
    }
  }, [formData.type, existingValue]);

  const handleSelectChange = (event) => {
    const value = event.target.value;
    setSelectedValue(value);
    
    if (value === "Other") {
      setShowManualInput(true);
      setManualInput("");
      handleInputChange("Regarding", "Other");
    } else {
      setShowManualInput(false);
      setManualInput("");
      handleInputChange("Regarding", value);
    }
  };

  const handleManualInputChange = (event) => {
    const value = event.target.value;
    setManualInput(value);
    handleInputChange("Regarding", value);
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

      {showManualInput && (
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
