import './ResultsPanel.css';

import React, { useState, useEffect } from 'react';
import {
    Box,
    List,
    Divider,
    ListItemButton,
    ListItemText
} from '@mui/material';

const ResultsPanel = () => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [results, setResults] = useState([]);

    const handleListItemClick = (event, index) => {
        setSelectedIndex(index);
    };

    useEffect(() => {
        fetch("/get_all_files").then(res => res.json()).then(data => {
            console.log(data.results);
            console.log(typeof data.results)
            setResults(data.results);
        });
    }, [])

    return (<div className="results">
        <Box sx={{
            bgcolor: 'background.paper',
            height: 400
            }}>
        <List component="nav">
            {results.map((result, index) => {
                return (
                    <ListItemButton
                        key={result}
                        selected={selectedIndex === index}
                        onClick={(event) => handleListItemClick(event, index)}
                        >
                        <ListItemText primary={result} />
                    </ListItemButton>
                    // <div></div>
                )
            })}
        </List>
        {/* <Divider />
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
        </List> */}
        </Box>
    </div>);
}


export default ResultsPanel;
