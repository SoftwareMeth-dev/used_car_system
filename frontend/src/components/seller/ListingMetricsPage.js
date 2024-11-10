// src/components/seller/ListingMetricsPage.js
import React, { useState, useEffect } from "react";
import { Container, Typography, Box } from "@mui/material";
import SellerMetricsService from "../../services/SellerMetricsService";

const ListingMetricsPage = () => {
  const [metrics, setMetrics] = useState({ views: 0, shortlists: 0 });

  useEffect(() => {
    SellerMetricsService.getMetrics()
      .then((data) => setMetrics(data))
      .catch((error) => console.error("Error fetching metrics:", error));
  }, []);

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
