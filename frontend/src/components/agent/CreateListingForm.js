// src/components/CreateListingForm.js
import React, { useState } from "react";
import { Container, TextField, Button, Typography, Box } from "@mui/material";
import AgentListingsService from "../services/AgentListingsService";

const CreateListingForm = () => {
  const [listing, setListing] = useState({
    make: "",
    model: "",
    year: "",
    seller_id: "",
    price: "",
  });

  const handleChange = (e) => {
    setListing({
      ...listing,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await AgentListingsService.createListing(listing);
      console.log("Listing created successfully");
    } catch (error) {
      console.error("Error creating listing:", error);
    }
  };

  return (
    <Container>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4">Create New Listing</Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            label="Make"
            name="make"
            fullWidth
            required
            onChange={handleChange}
          />
          <TextField
            label="Model"
            name="model"
            fullWidth
            required
            onChange={handleChange}
          />
          <TextField
            label="Year"
            name="year"
            type="number"
            fullWidth
            required
            onChange={handleChange}
          />
          <TextField
            label="Seller ID"
            name="seller_id"
            fullWidth
            required
            onChange={handleChange}
          />
          <TextField
            label="Price"
            name="price"
            type="number"
            fullWidth
            required
            onChange={handleChange}
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
