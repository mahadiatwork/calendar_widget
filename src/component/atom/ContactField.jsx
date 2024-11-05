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
  const [loading, setLoading] = useState(false); 

  // Sync selectedParticipants with value and selectedRowData
  useEffect(() => {
    if (selectedRowData?.Participants?.length > 0) {
      const defaultParticipants = selectedRowData.Participants.map(
        (participant) => ({
          Full_Name: participant.name,
          id: participant.participant,
        })
      );
      setSelectedParticipants(defaultParticipants);
    }
  }, [selectedRowData, contacts]);


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
    setSelectedParticipants(newValue);
    handleInputChange(
      "scheduledWith",
      newValue.map((contact) => ({
        Full_Name: contact.Full_Name,
        participant: contact.id,
        type: "contact",
      }))
    );
  };

  console.log({ data: selectedRowData?.Participants });

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
        loading={loading} // Display input text
        // onInputChange={(event, newInputValue) => {
        //   setInputValue(newInputValue); // Update input value when typing
        //   setNotFoundMessage(""); // Clear the "Not found" message when user types again
        // }}
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
