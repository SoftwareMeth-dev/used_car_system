// src/components/ListingDetailsPage.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container, Typography, Box } from "@mui/material";
import AgentListingsService from "../services/AgentListingsService";

const ListingDetailsPage = () => {
  const { listingId } = useParams();
  const [listing, setListing] = useState(null);

  useEffect(() => {
    AgentListingsService.getListingDetails(listingId)
      .then((data) => setListing(data))
      .catch((error) =>
        console.error("Error fetching listing details:", error)
      );
  }, [listingId]);

  if (!listing) return <Typography>Loading...</Typography>;

  return (
    <Container>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4">Listing Details</Typography>
        <Typography variant="body1">Make: {listing.make}</Typography>
        <Typography variant="body1">Model: {listing.model}</Typography>
        <Typography variant="body1">Year: {listing.year}</Typography>
        <Typography variant="body1">Price: {listing.price}</Typography>
      </Box>
    </Container>
  );
};

export default ListingDetailsPage;
