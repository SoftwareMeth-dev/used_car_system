// src/components/seller/SellerListingDetails.js
import React, { useState, useEffect } from "react";
import { Container, Typography, Box } from "@mui/material";
import SellerListingsService from "../../services/SellerListingsService";

const SellerListingDetails = ({ listingId }) => {
  const [listing, setListing] = useState({});

  useEffect(() => {
    SellerListingsService.getListingById(listingId)
      .then((data) => setListing(data))
      .catch((error) =>
        console.error("Error fetching listing details:", error)
      );
  }, [listingId]);

  return (
    <Container>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4">{listing.title}</Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Description: {listing.description}
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Price: ${listing.price}
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Views: {listing.views}
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Shortlists: {listing.shortlists}
        </Typography>
      </Box>
    </Container>
  );
};

export default SellerListingDetails;
