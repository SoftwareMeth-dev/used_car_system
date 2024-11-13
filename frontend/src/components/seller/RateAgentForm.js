// src/components/seller/RateAgentForm.js
import React, { useState } from "react";
import { TextField, Button, Container, Box, Typography } from "@mui/material";
import RateAgentService from "../../services/RateAgentService";

const RateAgentForm = () => {
  const [review, setReview] = useState({ rating: "", comments: "" });

  const handleChange = (e) => {
    setReview({ ...review, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    RateAgentService.submitAgentReview(review)
      .then(() => alert("Review submitted successfully"))
      .catch((error) => console.error("Error submitting review:", error));
  };

  return (
    <Container>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
        <Typography variant="h4">Rate Agent</Typography>
        <TextField
          label="Rating"
          name="rating"
          value={review.rating}
          onChange={handleChange}
          required
          fullWidth
          margin="normal"
        />
        <TextField
          label="Comments"
          name="comments"
          value={review.comments}
          onChange={handleChange}
          required
          fullWidth
          margin="normal"
          multiline
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
        >
          Submit Review
        </Button>
      </Box>
    </Container>
  );
};

export default RateAgentForm;
