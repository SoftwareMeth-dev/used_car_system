// src/components/ListingListPage.js
import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AgentListingsService from "../services/AgentListingsService";

const ListingListPage = () => {
  const [listings, setListings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    AgentListingsService.getAllListings()
      .then((data) => setListings(data))
      .catch((error) => console.error("Error fetching listings:", error));
  }, []);

  const handleViewDetails = (id) => {
    navigate(`/agent/listing/${id}`);
  };

  return (
    <Container>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4">My Listings</Typography>
        <List>
          {listings.map((listing) => (
            <ListItem key={listing.id} divider>
              <ListItemText
                primary={`${listing.make} ${listing.model}`}
                secondary={`Price: ${listing.price}`}
              />
              <Button onClick={() => handleViewDetails(listing.id)}>
                View Details
              </Button>
            </ListItem>
          ))}
        </List>
      </Box>
    </Container>
  );
};

export default ListingListPage;
