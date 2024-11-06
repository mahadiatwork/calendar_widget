import {
  Autocomplete,
  TextField,
  Button,
  Box,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline"; // Icon for "Not Found" message
import CustomTextField from "./CustomTextField";
const ZOHO = window.ZOHO;

export default function AccountField({
  value,
  handleInputChange,
  // clickedEvent,
  clickedEvent,
}) {
  const [accounts, setAccounts] = useState([]); // No initial accounts
  const [selectedAccount, setSelectedAccount] = useState(null); // Selected account object
  const [inputValue, setInputValue] = useState("");
  const [notFoundMessage, setNotFoundMessage] = useState(""); // Message if nothing is found
  const [loading, setLoading] = useState(false);

  // Utility to find matched account by id
  const findMatchedAccount = (accountId) =>
    accounts.find((account) => account.id === accountId);

  // Sync inputValue and selectedAccount with the provided value and clickedEvent
  useEffect(() => {
    if (clickedEvent?.scheduleFor?.id) {
      setSelectedAccount({
        Account_Name: clickedEvent.scheduleFor.name,
        id: clickedEvent.scheduleFor.id,
      });
      setInputValue(clickedEvent.scheduleFor.name || "");
    }
  }, [clickedEvent]);

  // useEffect(() => {
  //   const fetchAccounts = async () => {
  //     if (ZOHO) {
  //       try {
  //         const response = await ZOHO.CRM.API.getAllRecords({
  //           Entity: "Accounts",
  //           sort_order: "asc",
  //           per_page: 100,
  //           page: 1,
  //         });
  //         if (response?.data) {
  //           setAccounts(response.data);
  //         }
  //       } catch (error) {
  //         console.error("Failed to fetch accounts:", error);
  //       }
  //     }
  //   };
  //   fetchAccounts();
  // }, [ZOHO]); // Add ZOHO as a dependency

  // Handle advanced search when no accounts are found
  const handleAdvancedSearch = async (query) => {
    setNotFoundMessage(""); // Reset message before search
    setLoading(true); // Start loading

    if (ZOHO && query.trim()) {
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
        setLoading(false); // End loading
      }
    } else {
      setLoading(false);
    }
  };

  const handleInputChangeWithDelay = (event, newInputValue) => {
    setInputValue(newInputValue); // Update input value
    setNotFoundMessage(""); // Clear not-found message

    if (newInputValue.endsWith(" ")) {
      // Trigger search only when a space is detected
      handleAdvancedSearch(newInputValue);
    }
  };
  // Check if input value matches any account name
  // const showSearchButton = inputValue && !accounts.some(account => account.Account_Name === inputValue);

  return (
    <Box>
      <Autocomplete
        freeSolo // Allows users to type custom values
        options={accounts}
        getOptionLabel={(option) => option.Account_Name || ""}
        value={selectedAccount}
        onChange={(event, newValue) => {
          setSelectedAccount(newValue); // Set selected account
          handleInputChange("associateWith", newValue); // Trigger change handler
        }}
        inputValue={inputValue}
        onInputChange={handleInputChangeWithDelay} // Use the custom handler
        loading={loading}
        noOptionsText={
          inputValue ? (
            <Button
              variant="text"
              startIcon={<SearchIcon />}
              onClick={handleAdvancedSearch}
              sx={{ color: "#1976d2", textTransform: "none" }}
            >
              Search First Name
            </Button>
          ) : (
            <Typography variant="body2" color="textSecondary">
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
            InputLabelProps={{ shrink: true }}
            placeholder="Type and press space to search..."
            sx={{
              "& .MuiOutlinedInput-root": {
                padding: "2px 0px", // Remove padding around the input
                minHeight: "28px", // Set a minimum height for the input field
                height: "28px", // Set the desired height
              },
              "& .MuiInputBase-input": {
                padding: "1px 6px", // Adjust padding inside the input
                minHeight: "30px", // Match the input's height
                display: "flex",
                alignItems: "center",
                fontSize: "14px", // Optionally reduce the font size for more compact design
              },
            }}
          />
        )}
      />
    </Box>
  );
}
