import './ResultsPanel.css';

import React, {useState} from 'react';
import {
    Box,
    List,
    Divider,
    ListItemButton,
    ListItemText
} from '@mui/material';

const ResultsPanel = () => {
    const [selectedIndex, setSelectedIndex] = React.useState(1);

    const handleListItemClick = (event, index) => {
        setSelectedIndex(index);
    };

    return <div class="results">
    <Box sx={{
        bgcolor: 'background.paper',
        height: 400
        }}>
      <List component="nav" aria-label="main mailbox folders">
        <ListItemButton
          selected={selectedIndex === 0}
          onClick={(event) => handleListItemClick(event, 0)}
        >
          <ListItemText primary="Inbox" />
        </ListItemButton>
      </List>
      <Divider />
      <List component="nav" aria-label="secondary mailbox folder">
        <ListItemButton
          selected={selectedIndex === 2}
          onClick={(event) => handleListItemClick(event, 2)}
        >
          <ListItemText primary="Trash" />
        </ListItemButton>
      </List>
    </Box>
    </div>
}


export default ResultsPanel;
