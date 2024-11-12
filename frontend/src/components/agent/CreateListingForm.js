// src/components/CreateListingForm.js
import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
} from "@mui/material";
import AgentListingsService from "../services/AgentListingsService";

const CreateListingForm = () => {
  const [listing, setListing] = useState({
    make: "",
    model: "",
    year: "",
    seller_id: "",
    price: "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    setListing({
      ...listing,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    try {
      await AgentListingsService.createListing(listing);
      setSuccessMessage("Listing created successfully!");
      setListing({ make: "", model: "", year: "", seller_id: "", price: "" }); // Clear form
    } catch (error) {
      setErrorMessage("Error creating listing. Please try again.");
      console.error("Error creating listing:", error);
    }
  };

  return (
    <Container>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4">Create New Listing</Typography>
        {successMessage && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {successMessage}
          </Alert>
        )}
        {errorMessage && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {errorMessage}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            label="Make"
            name="make"
            fullWidth
            required
            onChange={handleChange}
            value={listing.make}
          />
          <TextField
            label="Model"
            name="model"
            fullWidth
            required
            onChange={handleChange}
            value={listing.model}
          />
          <TextField
            label="Year"
            name="year"
            type="number"
            fullWidth
            required
            onChange={handleChange}
            value={listing.year}
          />
          <TextField
            label="Seller ID"
            name="seller_id"
            fullWidth
            required
            onChange={handleChange}
            value={listing.seller_id}
          />
          <TextField
            label="Price"
            name="price"
            type="number"
            fullWidth
            required
            onChange={handleChange}
            value={listing.price}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
          >
            Create Listing
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default CreateListingForm;
