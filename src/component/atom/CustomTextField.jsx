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
            padding: "2px 10px",
          },
        },
      }}
    />
  );
};

export default CustomTextField;
