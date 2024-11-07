// src/components/Shortlist.js
import React from 'react';
import { List, ListItem, ListItemText, Typography } from '@mui/material';

function Shortlist({ shortlist }) {
  return (
    <div>
      <Typography variant="h5" sx={{ mt: 4 }}>Your Shortlist</Typography>
      <List>
        {shortlist.map(listing => (
          <ListItem key={listing.id}>
            <ListItemText primary={`${listing.make} ${listing.model} - $${listing.price}`} />
          </ListItem>
        ))}
      </List>
    </div>
  );
}

export default Shortlist;
