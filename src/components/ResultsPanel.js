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

    const results = [
        {name: "file1.pdf", download: true},
        {name: "file2.pdf", download: false},
        {name: "file3.pdf", download: true},
        {name: "file4.pdf", download: false},
        {name: "file5.pdf", download: true},
    ];
    const can = results.filter((result) => result.download);

    return (<div className="results">
        <Box sx={{
            bgcolor: 'background.paper',
            height: 400
            }}>
        <List component="nav">
            {can.map((result, index) => {
                return (
                    <ListItemButton
                        key={result.name}
                        selected={selectedIndex === index}
                        onClick={(event) => handleListItemClick(event, index)}
                        >
                        <ListItemText primary={result.name} />
                    </ListItemButton>
                )
            })}
        </List>
        <Divider />
        <List component="nav">
            {results.filter((result) => !result.download).map((result, index) => {
                const listIndex = can.length + index;
                return (
                    <ListItemButton
                        selected={selectedIndex === listIndex}
                        onClick={(event) => handleListItemClick(event, listIndex)}
                        >
                        <ListItemText primary={result.name} />
                    </ListItemButton>
                )
            })}
        </List>
        </Box>
    </div>);
}


export default ResultsPanel;
