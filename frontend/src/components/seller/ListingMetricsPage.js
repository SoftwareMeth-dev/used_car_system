// src/components/seller/ListingMetricsPage.js
import React, { useState, useEffect } from "react";
import { Container, Typography, Box } from "@mui/material";
import SellerMetricsService from "../../services/SellerMetricsService";
import { useParams } from "react-router-dom"; // If using routing to get listingId

const ListingMetricsPage = () => {
  const { listingId } = useParams(); // Assume listingId is passed through route params
  const [metrics, setMetrics] = useState({ views: 0, shortlists: 0 });

  useEffect(() => {
    if (listingId) {
      SellerMetricsService.getMetrics(listingId)
        .then((data) => setMetrics(data))
        .catch((error) => console.error("Error fetching metrics:", error));
    }
  }, [listingId]);

  return (
    <Container>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4">Listing Metrics</Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Views: {metrics.views} | Shortlists: {metrics.shortlists}
        </Typography>
      </Box>
    </Container>
  );
};

export default ListingMetricsPage;
