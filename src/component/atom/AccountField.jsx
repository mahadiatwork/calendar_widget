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
  selectedRowData,
}) {
  const [accounts, setAccounts] = useState([]);
  const [inputValue, setInputValue] = useState(""); // Set default to What_Id name
  const [notFoundMessage, setNotFoundMessage] = useState(""); // Message if nothing is found
  const [selectedAccount, setSelectedAccount] = useState(null);

  // Utility to find matched account by id
  const findMatchedAccount = (accountId) => accounts.find((account) => account.id === accountId);

  // Sync inputValue and selectedAccount with the provided value and selectedRowData
  useEffect(() => {
    let matchedAccount = null;

    if (value?.id) {
      matchedAccount = findMatchedAccount(value.id);
    } else if (selectedRowData?.What_Id?.id) {
      matchedAccount = findMatchedAccount(selectedRowData.What_Id.id);
    }

    setSelectedAccount(matchedAccount || null);
    setInputValue(matchedAccount?.Account_Name || ""); // Set input value or reset
  }, [value, selectedRowData, accounts]);

  useEffect(() => {
    const fetchAccounts = async () => {
      if (ZOHO) {
        try {
          const response = await ZOHO.CRM.API.getAllRecords({
            Entity: "Accounts",
            sort_order: "asc",
            per_page: 100,
            page: 1,
          });
          if (response?.data) {
            setAccounts(response.data);
          }
        } catch (error) {
          console.error("Failed to fetch accounts:", error);
        }
      }
    };
    fetchAccounts();
  }, [ZOHO]); // Add ZOHO as a dependency

    // Handle advanced search when no accounts are found
    const handleAdvancedSearch = async () => {
      setNotFoundMessage(""); // Reset message before search
  
      if (ZOHO && inputValue) {
        try {
          const searchCriteria = `(Account_Name:equals:${inputValue})`;
          const searchResults = await ZOHO.CRM.API.searchRecord({
            Entity: "Accounts",
            Type: "criteria",
            Query: searchCriteria,
          });
  
          if (searchResults.data && searchResults.data.length > 0) {
            setAccounts(searchResults.data); // Update accounts with search results
            setNotFoundMessage(""); // Clear the not-found message
          } else {
            setNotFoundMessage(`"${inputValue}" not found in the database`);
          }
        } catch (error) {
          console.error("Error during search:", error);
          setNotFoundMessage("An error occurred while searching. Please try again.");
        }
      } else {
        setNotFoundMessage("Please enter a valid search term.");
      }
    };
  
    // Check if input value matches any account name
    const showSearchButton = inputValue && !accounts.some(account => account.Account_Name === inputValue);
  

  return (
    <Box>
      <Autocomplete
        freeSolo // Allows users to type custom values
        options={accounts} // Array of accounts for the autocomplete
        size="small"
        getOptionLabel={
          (option) =>
            typeof option === "string" ? option : option.Account_Name // Assuming accounts have an 'Account_Name' property
        }
        value={value?.name || selectedRowData?.What_Id.name || null} // Set default value based on selectedRowData What_Id
        onChange={(event, newValue) => {
          setSelectedAccount(newValue); // Set selected account
          handleInputChange("associateWith", newValue); // Trigger change handler
        }}
        inputValue={inputValue}
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue); // Update input value
          setNotFoundMessage(""); // Clear not-found message
        }}
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
            placeholder="Associate with"
            sx={{
              "& .MuiOutlinedInput-root": {
                padding: "0px", // Remove padding around the input
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

      {/* Display search button when input value does not match any account */}
      {showSearchButton && (
        <Box sx={{ mt: 2 }}>
          <Button
            variant="text"
            startIcon={<SearchIcon />}
            onClick={handleAdvancedSearch}
            sx={{ color: "#1976d2", textTransform: "none" }}
          >
            Search Account Name
          </Button>
        </Box>
      )}

      {/* Display "Not found" message if applicable */}
      {notFoundMessage && (
        <Box display="flex" alignItems="center" color="error.main" sx={{ mt: 2 }}>
          <ErrorOutlineIcon sx={{ mr: 1 }} />
          <Typography variant="body2">{notFoundMessage}</Typography>
        </Box>
      )}
    </Box>
  );
}
