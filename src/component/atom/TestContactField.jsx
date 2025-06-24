import { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Typography,
} from "@mui/material";
const ZOHO = window.ZOHO;

export default function TestContactField({
  value,
  handleInputChange,
  // ZOHO,
  clickedEvent = {}, // Default to an empty object
  formData,
}) {
  const [contacts, setContacts] = useState([]); // Fetched contacts
  const [selectedParticipants, setSelectedParticipants] = useState(value || []); // Selected participants
  const [searchType, setSearchType] = useState("First_Name"); // Search criteria
  const [searchText, setSearchText] = useState(""); // Search input
  const [filteredContacts, setFilteredContacts] = useState([]); // Filtered contacts for display
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const debounceTimer = useRef(null); // Debounce timer for search

  // Helper function to determine invite status display
  const getInviteStatusDisplay = (status, sendInvites) => {
    if (status === "yes") return "Accepted";
    if (status === "no") return "Declined";
    if (status === undefined) {
      return "Not Sent";
    }
    if (status === "" || status === null) {
      return sendInvites ? "Invite Sent" : "Not Sent";
    }
    if (status === "not_known") {
      return sendInvites ? "No Reply" : "Not Sent";
    }
    return status; // fallback for any other status values
  };

  useEffect(() => {
    const fetchParticipantsDetails = async () => {
      if (clickedEvent?.scheduledWith && ZOHO) {
        const participants = await Promise.all(
          clickedEvent.scheduledWith.map(async (participant) => {
            const contactId = participant?.participant ?? participant?.id;

            if (!contactId) {
              console.warn("Missing contact ID for participant:", participant);
              return {
                id: "unknown",
                Full_Name: participant?.name || "Unknown",
                Email: participant?.Email || "No Email",
              };
            }

            try {
              const contactDetails = await ZOHO.CRM.API.getRecord({
                Entity: "Contacts",
                RecordID: contactId,
              });

              if (contactDetails?.data?.length > 0) {
                const contact = contactDetails.data[0];
                return {
                  id: contact.id,
                  First_Name: contact.First_Name || "N/A",
                  Last_Name: contact.Last_Name || "N/A",
                  Email: contact.Email || "No Email",
                  Mobile: contact.Mobile || "N/A",
                  Full_Name: `${contact.First_Name || "N/A"} ${
                    contact.Last_Name || "N/A"
                  }`,
                  ID_Number: contact.ID_Number || "N/A",
                  status: participant.status,
                };
              } else {
                return {
                  id: contactId,
                  Full_Name: participant?.name || "Unknown",
                  Email: participant?.Email || "No Email",
                };
              }
            } catch (error) {
              console.error(
                `Error fetching contact for ID ${contactId}:`,
                error
              );
              return {
                id: contactId,
                Full_Name: participant?.name || "Unknown",
                Email: participant?.Email || "No Email",
              };
            }
          })
        );

        setSelectedParticipants(participants);
        handleInputChange("scheduledWith", participants);
      }
    };

    fetchParticipantsDetails();
  }, [clickedEvent, ZOHO]);

  // Open modal and sync selected participants
  const handleOpen = () => {
    setFilteredContacts([]);
    setIsModalOpen(true);
  };

  // Close modal without saving changes
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  // Fetch and filter contacts from the server based on search criteria
  const handleSearch = async () => {
    if (!ZOHO || !searchText.trim()) return;

    try {
      let searchResults;

      if (searchType === "Email") {
        searchResults = await ZOHO.CRM.API.searchRecord({
          Entity: "Contacts",
          Type: "email",
          Query: searchText.trim(),
        });
      } else if (searchType === "Mobile") {
        searchResults = await ZOHO.CRM.API.searchRecord({
          Entity: "Contacts",
          Type: "criteria",
          Query: `(Mobile:equals:${searchText.trim()})`,
        });
      } else if (searchType === "ID_Number") {
        searchResults = await ZOHO.CRM.API.searchRecord({
          Entity: "Contacts",
          Type: "criteria",
          Query: `(ID_Number:equals:${searchText.trim()})`,
        });
      } else if (searchType === "Full_Name") {
        searchResults = await ZOHO.CRM.API.searchRecord({
          Entity: "Contacts",
          Type: "word",
          Query: searchText.trim(),
        });
      } else {
        searchResults = await ZOHO.CRM.API.searchRecord({
          Entity: "Contacts",
          Type: "criteria",
          Query: `(${searchType}:equals:${searchText.trim()})`,
        });
      }

      if (searchResults.data && searchResults.data.length > 0) {
        const formattedContacts = searchResults.data.map((contact) => ({
          First_Name: contact.First_Name || "N/A",
          Last_Name: contact.Last_Name || "N/A",
          Email: contact.Email || "No Email",
          Mobile: contact.Mobile || "N/A",
          ID_Number: contact.ID_Number || "N/A", // Assuming ID_Number is available
          id: contact.id,
        }));
        setFilteredContacts(formattedContacts);
      } else {
        setFilteredContacts([]);
      }
    } catch (error) {
      console.error("Error during search:", error);
      setFilteredContacts([]);
    }
  };

  // Toggle selection of a contact
  const toggleContactSelection = (contact) => {
    setSelectedParticipants((prev) =>
      prev.some((c) => c.id === contact.id)
        ? prev.filter((c) => c.id !== contact.id)
        : [...prev, contact]
    );
  };

  // Save changes and close the modal
  const handleOk = () => {
    const updatedParticipants = selectedParticipants.map((participant) => ({
      Full_Name:
        participant.Full_Name ||
        `${participant.First_Name} ${participant.Last_Name}`,
      Email: participant.Email,
      participant: participant.id,
      type: "contact",
    }));

    handleInputChange("scheduledWith", updatedParticipants);
    // console.log({ clickedEvent: clickedEvent})
    if (clickedEvent !== null) {
      clickedEvent.scheduledWith = updatedParticipants;
    }

    // Close the modal
    setIsModalOpen(false);
  };

  return (
    <Box>
      {/* Single-line display for selected contacts */}
      <Box display="flex" alignItems="center" gap={2}>
        <TextField
          fullWidth
          value={selectedParticipants
            .map((c) => c.Full_Name || `${c.First_Name} ${c.Last_Name}`)
            .join(", ")}
          variant="outlined"
          placeholder="Selected contacts"
          InputProps={{
            readOnly: true,
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              padding: "2px",
              "& input": {
                padding: "4px 10px",
                fontSize: "9pt", // ✅ Input text size
              },
            },
          }}
          size="small"
        />
        <Button
          variant="contained"
          size="small"
          onClick={handleOpen}
          sx={{ width: "100px", fontSize: "9pt" }} // ✅ Button text size
        >
          Contacts
        </Button>
      </Box>

      {/* Modal */}
      <Dialog open={isModalOpen} onClose={handleCancel} fullWidth maxWidth="md">
        <DialogContent>
          {/* Search Controls */}
          <Box display="flex" gap={2} mb={2}>
            <TextField
              select
              label="Search By"
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              fullWidth
              size="small"
              sx={{
                "& .MuiInputLabel-root": { fontSize: "9pt" },
                fontSize: "9pt",
              }} // ✅ Label & input text size
            >
              <MenuItem value="First_Name" sx={{ fontSize: "9pt" }}>
                First Name
              </MenuItem>
              <MenuItem value="Last_Name" sx={{ fontSize: "9pt" }}>
                Last Name
              </MenuItem>
              <MenuItem value="Email" sx={{ fontSize: "9pt" }}>
                Email
              </MenuItem>
              <MenuItem value="Mobile" sx={{ fontSize: "9pt" }}>
                Mobile
              </MenuItem>
              <MenuItem value="ID_Number" sx={{ fontSize: "9pt" }}>
                MS File Number
              </MenuItem>
              <MenuItem value="Full_Name" sx={{ fontSize: "9pt" }}>
                Full Name
              </MenuItem>
            </TextField>
            <TextField
              label="Search Text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              fullWidth
              size="small"
              sx={{
                "& .MuiInputLabel-root": { fontSize: "9pt" },
                fontSize: "9pt",
              }} // ✅ Label & input text size
            />
            <Button
              variant="contained"
              onClick={handleSearch}
              sx={{ width: "150px", fontSize: "9pt" }} // ✅ Button text size
            >
              Search
            </Button>
          </Box>

          {/* Search Results Table */}
          <TableContainer sx={{ maxHeight: 300, overflowY: "auto" }}>
            <Table size="small" sx={{ tableLayout: "fixed", fontSize: "9pt" }}>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      position: "sticky",
                      top: 0,
                      zIndex: 1,
                      backgroundColor: "background.paper",
                      fontWeight: "bold",
                      width: "50px",
                      fontSize: "9pt",
                    }}
                  ></TableCell>
                  <TableCell
                    sx={{
                      position: "sticky",
                      top: 0,
                      zIndex: 1,
                      backgroundColor: "background.paper",
                      fontWeight: "bold",
                      fontSize: "9pt",
                    }}
                  >
                    First Name
                  </TableCell>
                  <TableCell
                    sx={{
                      position: "sticky",
                      top: 0,
                      zIndex: 1,
                      backgroundColor: "background.paper",
                      fontWeight: "bold",
                      fontSize: "9pt",
                    }}
                  >
                    Last Name
                  </TableCell>
                  <TableCell
                    sx={{
                      position: "sticky",
                      top: 0,
                      zIndex: 1,
                      backgroundColor: "background.paper",
                      fontWeight: "bold",
                      width: "30%",
                      fontSize: "9pt",
                    }}
                  >
                    Email
                  </TableCell>
                  <TableCell
                    sx={{
                      position: "sticky",
                      top: 0,
                      zIndex: 1,
                      backgroundColor: "background.paper",
                      fontWeight: "bold",
                      fontSize: "9pt",
                    }}
                  >
                    Mobile
                  </TableCell>
                  <TableCell
                    sx={{
                      position: "sticky",
                      top: 0,
                      zIndex: 1,
                      backgroundColor: "background.paper",
                      fontWeight: "bold",
                      fontSize: "9pt",
                    }}
                  >
                    MS File Number
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredContacts.length > 0 ? (
                  filteredContacts.map((contact) => (
                    <TableRow
                      key={contact.id}
                      sx={{
                        "& .MuiTableCell-root": {
                          padding: "4px 6px",
                          fontSize: "9pt",
                        },
                      }}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedParticipants.some(
                            (c) => c.id === contact.id
                          )}
                          onChange={() => toggleContactSelection(contact)}
                        />
                      </TableCell>
                      <TableCell>{contact.First_Name}</TableCell>
                      <TableCell>{contact.Last_Name}</TableCell>
                      <TableCell>{contact.Email}</TableCell>
                      <TableCell>{contact.Mobile}</TableCell>
                      <TableCell>{contact.ID_Number}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      align="center"
                      sx={{
                        padding: "8px",
                        fontStyle: "italic",
                        fontSize: "9pt",
                      }}
                    >
                      No data found. Please try another search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Box mt={3}>
            <Typography variant="h6" sx={{ fontSize: "9pt" }}>
              Selected Contacts:
            </Typography>
            <TableContainer>
              <Table
                size="small"
                sx={{ tableLayout: "fixed", fontSize: "9pt" }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        width: "50px",
                        fontWeight: "bold",
                        fontSize: "9pt",
                      }}
                    ></TableCell>
                    <TableCell sx={{ fontWeight: "bold", fontSize: "9pt" }}>
                      First Name
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", fontSize: "9pt" }}>
                      Last Name
                    </TableCell>
                    <TableCell
                      sx={{ width: "30%", fontWeight: "bold", fontSize: "9pt" }}
                    >
                      Email
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", fontSize: "9pt" }}>
                      Mobile
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", fontSize: "9pt" }}>
                      MS File Number
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", fontSize: "9pt" }}>
                      Invite Status
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedParticipants.map((contact) => (
                    <TableRow
                      key={contact.id}
                      sx={{
                        "& .MuiTableCell-root": {
                          padding: "4px 6px",
                          fontSize: "9pt",
                        },
                      }}
                    >
                      <TableCell>
                        <Checkbox
                          checked
                          onChange={() => toggleContactSelection(contact)}
                        />
                      </TableCell>
                      <TableCell>
                        <a
                          href={`https://crm.zoho.com.au/crm/org7004396182/tab/Contacts/${contact.id}/canvas/76775000000287551`}
                          target="_blank"
                          rel="noopener noreferrer"
                          // style={{  color: "inherit" }}
                        >
                          {contact.First_Name}
                        </a>
                      </TableCell>
                      <TableCell>
                        <a
                          href={`https://crm.zoho.com.au/crm/org7004396182/tab/Contacts/${contact.id}/canvas/76775000000287551`}
                          target="_blank"
                          rel="noopener noreferrer"
                          // style={{  color: "inherit" }}
                        >
                          {contact.Last_Name}
                        </a>
                      </TableCell>
                      <TableCell>{contact.Email}</TableCell>
                      <TableCell>{contact.Mobile}</TableCell>
                      <TableCell>{contact.ID_Number}</TableCell>
                      <TableCell>
                        {getInviteStatusDisplay(
                          contact.status,
                          formData?.Send_Invites
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={handleCancel}
            variant="outlined"
            sx={{ fontSize: "9pt" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleOk}
            variant="contained"
            color="primary"
            disabled={selectedParticipants.length === 0}
            sx={{ fontSize: "9pt" }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
