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
  formData
}) {
  const [contacts, setContacts] = useState([]); // Contacts fetched from Zoho
  const [selectedParticipants, setSelectedParticipants] = useState(
    formData.scheduleWith || []
  ); // Selected values in autocomplete
  const [inputValue, setInputValue] = useState(""); // Store the input text
  const [notFoundMessage, setNotFoundMessage] = useState("");

  // Sync selectedParticipants with value and selectedRowData
  React.useEffect(() => {
    if (selectedRowData?.Participants?.length > 0) {
      // Otherwise, if selectedRowData is available, use it as the default
      const defaultParticipants = selectedRowData.Participants.map(
        (participant) => ({
          Full_Name: participant.name, // Match with Full_Name for Autocomplete
          id: participant.participant,
        })
      );
      setSelectedParticipants(defaultParticipants);
    }
  }, [selectedRowData, contacts]);

  const handleSearch = async (searchType) => {
    setNotFoundMessage(""); // Reset the message

    if (ZOHO && inputValue) {
      try {
        let searchResults;

        // Set the search method based on the search type
        if (searchType === "firstName") {
          // Search by first name using criteria
          const searchCriteria = `(First_Name:equals:${inputValue})`;
          searchResults = await ZOHO.CRM.API.searchRecord({
            Entity: "Contacts",
            Type: "criteria",
            Query: searchCriteria,
          });
          console.log({searchResults})
        } else if (searchType === "fullName") {
          // Search by full name using "word" type, which performs a full-text search
          searchResults = await ZOHO.CRM.API.searchRecord({
            Entity: "Contacts",
            Type: "word", // Full-text search
            Query: inputValue,
          });
          console.log({searchResults})
        }

        if (searchResults.data && searchResults.data.length > 0) {
          const formattedContacts = searchResults.data.map((contact) => ({
            Full_Name: contact.Full_Name,
            id: contact.id,
          }));

          // Merge new search results with the previously selected participants
          const mergedContacts = [
            ...formattedContacts,
            ...selectedParticipants,
          ];

          // Remove duplicates (in case the search result includes already selected contacts)
          const uniqueContacts = mergedContacts.filter(
            (contact, index, self) =>
              index === self.findIndex((c) => c.id === contact.id)
          );

          setContacts(uniqueContacts); // Update contacts list with merged data
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
        // type: "contact",
      }))
    );
  };

  console.log({ data: selectedRowData?.Participants });

  return (
    <Box>
      <Autocomplete
        multiple
        options={contacts}
        getOptionLabel={(option) => option.name || ""}
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
              onClick={()=> handleSearch("fullName")}
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
                fontSize: "12px", // Reduce chip text size
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
