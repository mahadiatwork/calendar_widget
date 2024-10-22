import {
  Autocomplete,
  TextField,
  Button,
  Box,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
const ZOHO = window.ZOHO;

export default function ContactField({
  value,
  handleInputChange,
  selectedRowData,
}) {
  const [contacts, setContacts] = useState([]); // Contacts fetched from Zoho
  const [selectedParticipants, setSelectedParticipants] = useState([]); // Selected values in autocomplete
  const [inputValue, setInputValue] = useState(""); // Store the input text
  const [notFoundMessage, setNotFoundMessage] = useState("");

  // Extract participants from selectedRowData and set them as the default value
  useEffect(() => {
    if (value) {
      const defaultParticipants = value.map((participant) => ({
        Full_Name: participant.name, // Use Full_Name to match contacts
        id: participant.participant,
      }));
      setSelectedParticipants(defaultParticipants);
    }
  }, [selectedRowData]);

  // Fetch contacts from Zoho CRM
  useEffect(() => {
    async function getData() {
      if (ZOHO) {
        const usersResponse = await ZOHO.CRM.API.getAllRecords({
          Entity: "Contacts",
          sort_order: "asc",
          per_page: 100,
          page: 1,
        });
        // Assuming Zoho returns contacts with Full_Name, map the result correctly
        if (usersResponse?.data) {
          const formattedContacts = usersResponse.data.map((contact) => ({
            Full_Name: contact.Full_Name,
            id: contact.id,
          }));
          setContacts(formattedContacts); // Store contacts in correct structure
        }
      }
    }
    getData();
  }, [ZOHO]);

  const handleAdvancedSearch = async () => {
    setNotFoundMessage(""); // Reset the message

    // Perform advanced search using inputValue
    if (ZOHO && inputValue) {
      try {
        const searchCriteria = `(First_Name:equals:${inputValue})`; // Search criteria
        const searchResults = await ZOHO.CRM.API.searchRecord({
          Entity: "Contacts",
          Type: "criteria",
          Query: searchCriteria,
        });

        if (searchResults.data && searchResults.data.length > 0) {
          const formattedContacts = searchResults.data.map((contact) => ({
            Full_Name: contact.Full_Name,
            id: contact.id,
          }));
          setContacts(formattedContacts); // Update contacts list with search results
          setNotFoundMessage(""); // Clear the "Not Found" message
        } else {
          setNotFoundMessage(`"${inputValue}" not found in the database`); // Show "Not Found" message
        }
      } catch (error) {
        console.error("Error during advanced search:", error);
        setNotFoundMessage(
          "An error occurred while searching. Please try again."
        );
      }
    } else {
      setNotFoundMessage("Please enter a valid search term.");
    }
  };

  const handleSelectionChange = (event, newValue) => {
    setSelectedParticipants(newValue); // Update the selected values
    // Update the parent component with the selected contacts
    handleInputChange(
      "scheduleWith",
      newValue.map((contact) => ({
        name: contact.Full_Name,
        participant: contact.id,
        type: contact.type,
      }))
    );
  };

  return (
    <Box>
      <Autocomplete
        multiple
        options={contacts}
        getOptionLabel={(option) => option.Full_Name || ""}
        value={selectedParticipants} // Control the selected values
        onChange={handleSelectionChange} // Handle the selection of new values
        inputValue={inputValue} // Display input text
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue); // Update input value when typing
          setNotFoundMessage(""); // Clear the "Not found" message when user types again
        }}
        sx={{"& .MuiInputBase-root": {p:'0px'},"& .MuiOutlinedInput-root":{p:0}}}
        noOptionsText={
          notFoundMessage ? (
            <Box display="flex" alignItems="center" color="error.main">
              <ErrorOutlineIcon sx={{ mr: 1 }} />
              <Typography variant="body2">{notFoundMessage}</Typography>
            </Box>
          ) : (
            <Button
              variant="text"
              startIcon={<SearchIcon />}
              onClick={handleAdvancedSearch}
              sx={{ color: "#1976d2", textTransform: "none" }}
            >
              Search First Name
            </Button>
          )
        }
        renderInput={(params) => (
          <TextField
            {...params}
            fullWidth
            size="small"
            variant="outlined"
            placeholder="Scheduled with"
            sx={{
              "& > div":{py:'0 !important'},
              "& .MuiOutlinedInput-root": {
                padding: "0px", // Reduce padding inside the input field
                minHeight: "30px", // Adjust the height of the input box
                height:"30px"
              },
              "& .MuiInputBase-input": {
                padding: "0px 0px", // Adjust the inner input padding
                minHeight: "30px", // Match the input height
                height:'30px',
                display: "flex",
                alignItems: "center",
              },
              "& .MuiChip-root": {
                height: '1.5rem', // Reduce the size of selected option chips
                margin: "1px", // Adjust margin between chips
                fontSize: "10px", // Reduce chip text size
              },
              "& input":{
                py:'0 !important'
              }
            }}
          />
        )}
      />
    </Box>
  );
}
