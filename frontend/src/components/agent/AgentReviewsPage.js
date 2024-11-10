// src/components/AgentReviewsPage.js
import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import AgentListingsService from "../services/AgentListingsService";

const AgentReviewsPage = () => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    AgentListingsService.getAgentReviews()
      .then((data) => setReviews(data))
      .catch((error) => console.error("Error fetching reviews:", error));
  }, []);

  return (
    <Container>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4">Agent Reviews</Typography>
        <List>
          {reviews.map((review, index) => (
            <ListItem key={index} divider>
              <ListItemText
                primary={`Rating: ${review.rating}`}
                secondary={`${review.review} - ${review.agent_id}`}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Container>
  );
};

export default AgentReviewsPage;
