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
  formData,
  clickedEvent
}) {
  console.log('tazwer',clickedEvent?.scheduledWith)
  const [contacts, setContacts] = useState([]); // Contacts fetched from Zoho
  const [selectedParticipants, setSelectedParticipants] = useState(
    clickedEvent?.scheduledWith || []
  ); 
  const [inputValue, setInputValue] = useState(""); // Store the input text
  const [notFoundMessage, setNotFoundMessage] = useState("");
  const [loading, setLoading] = useState(false); 

  // Sync selectedParticipants with value and selectedRowData
  useEffect(() => {
    // Sync selectedParticipants with formData's scheduledWith prop
    if (formData.scheduledWith && formData.scheduledWith.length > 0) {
      const defaultParticipants = formData.scheduledWith.map((participant) => ({
        Full_Name: participant.Full_Name,
        id: participant.participant,
      }));
      setSelectedParticipants(defaultParticipants);
    }
  }, [formData.scheduledWith]);
  


  const handleSearch = async (query) => {
    setNotFoundMessage(""); // Reset the message
    setLoading(true); // Start loading

    if (ZOHO && query.trim()) {
      try {
        const searchResults = await ZOHO.CRM.API.searchRecord({
          Entity: "Contacts",
          Type: "word", // Full-text search
          Query: query.trim(),
        });

        if (searchResults.data && searchResults.data.length > 0) {
          const formattedContacts = searchResults.data.map((contact) => ({
            Full_Name: contact.Full_Name,
            id: contact.id,
          }));

          const mergedContacts = [...formattedContacts, ...selectedParticipants];
          const uniqueContacts = mergedContacts.filter(
            (contact, index, self) =>
              index === self.findIndex((c) => c.id === contact.id)
          );

          setContacts(uniqueContacts);
          setNotFoundMessage("");
        } else {
          setNotFoundMessage(`"${query}" not found in the database`);
        }
      } catch (error) {
        console.error("Error during search:", error);
        setNotFoundMessage("An error occurred while searching. Please try again.");
      } finally {
        setLoading(false); // End loading
      }
    } else {
      setLoading(false);
    }
  };

  const handleInputChangeWithDelay = (event, newInputValue) => {
    setInputValue(newInputValue);
    setNotFoundMessage(""); // Clear the "Not found" message when user types again

    if (newInputValue.endsWith(" ")) {
      // Trigger search only when a space is detected
      handleSearch(newInputValue);
    }
  };

  const handleSelectionChange = (event, newValue) => {
    console.log({newValue})
    
    console.log(newValue.map((contact) => ({
      Full_Name: contact.Full_Name,
      participant: contact.id,
      type: "contact",
    })))
    handleInputChange(
      "scheduledWith",
      newValue.map((contact) => ({
        Full_Name: contact.Full_Name,
        participant: contact.id,
        type: "contact",
      }))
    );
    setSelectedParticipants(newValue.map((contact) => ({
      Full_Name: contact.Full_Name,
      participant: contact.id,
      type: "contact",
    })));
  };

  console.log({ data: clickedEvent?.scheduledWith });

  return (
    <Box>
      <Autocomplete
        multiple
        options={contacts}
        getOptionLabel={(option) => option.Full_Name || ""}
        value={selectedParticipants}
        onChange={handleSelectionChange}
        inputValue={inputValue}
        onInputChange={handleInputChangeWithDelay} // Use the custom handler
        loading={loading} // Show loading indicator during search
        noOptionsText={
          notFoundMessage ? (
            <Box display="flex" alignItems="center" color="error.main">
              <ErrorOutlineIcon sx={{ mr: 1 }} />
              <Typography variant="body2">{notFoundMessage}</Typography>
            </Box>
          ) : (
            "No options"
          )
        }
        renderInput={(params) => (
          <TextField
            {...params}
            fullWidth
            size="small"
            variant="outlined"
            label="Scheduled with"
            InputLabelProps={{ shrink: true }}
            placeholder="Type and press space to search..."
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
