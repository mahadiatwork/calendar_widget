import React, { useEffect, useState, useCallback } from "react";
import { Autocomplete, TextField, Box, Typography } from "@mui/material";
import { debounce } from "lodash"; // Optional, or create your own debounce function
const ZOHO = window.ZOHO;

export default function AccountField({
  value,
  handleInputChange,
  clickedEvent,
  formData,
}) {
  const [accounts, setAccounts] = useState([]); // Accounts list
  const [selectedAccount, setSelectedAccount] = useState(value || null); // Selected account
  const [inputValue, setInputValue] = useState(""); // Input field value
  const [notFoundMessage, setNotFoundMessage] = useState(""); // Not found message
  const [loading, setLoading] = useState(false); // Loading state

  // Sync selectedAccount with formData.What_Id for the default value
  useEffect(() => {
    // console.log({associateWith: formData.associateWith})
    if (formData.associateWith?.id) {
      const selected = {
        Account_Name: formData.associateWith.Account_Name,
        id: formData.associateWith.id,
      };
      setSelectedAccount(selected);
      setInputValue(formData.associateWith.Account_Name || "");
      setAccounts((prevAccounts) =>
        [selected, ...prevAccounts].filter(
          (v, i, a) => a.findIndex((t) => t.id === v.id) === i // Ensure no duplicates
        )
      );
    }
  }, [formData.associateWith]); // Rerun effect only when formData.What_Id changes

  // Utility to debounce the search function
  const debounceSearch = useCallback(
    debounce(async (query) => {
      if (query.trim()) {
        setLoading(true);
        setNotFoundMessage(""); // Clear previous not-found messages

        try {
          const searchResults = await ZOHO.CRM.API.searchRecord({
            Entity: "Accounts",
            Type: "word", // Full-text search
            Query: query.trim(),
          });

          if (searchResults.data && searchResults.data.length > 0) {
            const formattedAccounts = searchResults.data.map((account) => ({
              Account_Name: account.Account_Name,
              id: account.id,
            }));
            setAccounts(formattedAccounts);
            setNotFoundMessage(""); // Clear the not-found message
          } else {
            setNotFoundMessage(`"${query.trim()}" not found in the database`);
          }
        } catch (error) {
          console.error("Error during search:", error);
          setNotFoundMessage(
            "An error occurred while searching. Please try again."
          );
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }, 500), // Adjust delay as needed
    [] // Dependency array
  );

  // Trigger the debounced search when input changes
  const handleInputChangeWithDelay = (event, newInputValue) => {
    setInputValue(newInputValue); // Update input field
    setNotFoundMessage(""); // Clear any previous not-found message
    debounceSearch(newInputValue); // Call the debounced search function
  };

  // Sync inputValue and selectedAccount with clickedEvent on mount
  useEffect(() => {
    if (clickedEvent?.associateWith?.id) {
      setSelectedAccount({
        Account_Name: clickedEvent?.associateWith?.Account_Name,
        id: clickedEvent?.associateWith?.id,
      });
      setInputValue(clickedEvent?.associateWith.name || "");
    }
  }, [clickedEvent]);

  return (
    <Box sx={{ mb: "3px" }}>
      <Autocomplete
        freeSolo
        options={accounts}
        getOptionLabel={(option) => option.Account_Name || ""}
        value={selectedAccount}
        onChange={(event, newValue) => {
          setSelectedAccount(newValue);
          handleInputChange("associateWith", newValue);
        }}
        inputValue={inputValue}
        onInputChange={handleInputChangeWithDelay}
        loading={loading}
        noOptionsText={
          inputValue ? (
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{ fontSize: "9pt" }}
            >
              {notFoundMessage || "No options"}
            </Typography>
          ) : (
            <Typography sx={{ fontSize: "9pt" }}>
              Start typing to search...
            </Typography>
          )
        }
        renderInput={(params) => (
          <TextField
            {...params}
            fullWidth
            size="small"
            variant="outlined"
            label="Associate with"
            placeholder="Start typing to search..."
            InputLabelProps={{ shrink: true, sx: { fontSize: "9pt" } }} // ✅ Label text size
            sx={{
              "& .MuiOutlinedInput-root": {
                padding: "0px", // Remove extra padding
                height: "31px", // Maintain small height
              },
              "& .MuiInputBase-input": {
                fontSize: "9pt", // ✅ Input text size
              },
            }}
          />
        )}
        componentsProps={{
          popper: {
            modifiers: [
              {
                name: "preventOverflow",
                options: {
                  boundary: "window",
                },
              },
            ],
          },
          paper: {
            sx: {
              fontSize: "9pt", // ✅ Dropdown container text size
            },
          },
        }}
        sx={{
          "& .MuiAutocomplete-option": {
            fontSize: "9pt", // ✅ Each option text size
            padding: "4px 8px", // Optional: Adjust padding for better spacing
          },
        }}
      />
    </Box>
  );
}
