import React from "react";
import { TextField } from "@mui/material";

const CustomTextField = ({ onChange, value, ...props }) => {
  return (
    <TextField
      variant="outlined"
      size="small"
      fullWidth
      autoComplete="off"
      value={value}
      InputLabelProps={{ shrink: true }}
      onChange={onChange}
      {...props}
      sx={{
        "& .MuiOutlinedInput-root": {
          padding: "2px",
          "& input": {
            padding: "4px 10px",
            fontSize: "9pt", // ✅ Input text size
          },
        },
        "& .MuiInputLabel-root": {
          fontSize: "9pt", // ✅ Label text size
        },
      }}
    />
  );
};

export default CustomTextField;
