import React, { useEffect, useState, useCallback } from "react";
import { Autocomplete, TextField, Box, Typography } from "@mui/material";
import { debounce } from "lodash"; // Optional, or create your own debounce function
const ZOHO = window.ZOHO;

export default function AccountField({ value, handleInputChange, clickedEvent }) {
  const [accounts, setAccounts] = useState([]); // Accounts list
  const [selectedAccount, setSelectedAccount] = useState(null); // Selected account
  const [inputValue, setInputValue] = useState(""); // Input field value
  const [notFoundMessage, setNotFoundMessage] = useState(""); // Not found message
  const [loading, setLoading] = useState(false); // Loading state

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
    <Box>
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
            <Typography variant="body2" color="textSecondary">
              {notFoundMessage || "No options"}
            </Typography>
          ) : (
            "Start typing to search..."
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
          />
        )}
      />
    </Box>
  );
}
