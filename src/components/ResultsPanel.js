import React, { useState, useEffect } from 'react';
import {
    List,
    Divider,
    ListItemButton,
    ListItemText
} from '@mui/material';

const ResultsPanel = ({ results, handleResultClick }) => {
    const [ children, setChildren ] = useState([]);
    const [ selectedIndex, setSelectedIndex ] = useState(-1);
    var temp = [];

    const handleListItemClick = (event, index) => {
        setSelectedIndex(index);
        handleResultClick(event, index);
    }

    const addChildren = (list, startIndex, noResultsMessage) => {
        if (list.length > 0) {
            temp.push(
                <List component="nav" key={ "list_starting_" + startIndex }>
                    {list.map((result, index) => {
                        return (
                            <ListItemButton
                                key={ result }
                                selected={ selectedIndex === index + startIndex }
                                onClick={(event) => handleListItemClick(event, index + startIndex)}
                                >
                                <ListItemText primary={ result } />
                            </ListItemButton>
                        )
                    })}
                </List>
            );
        } else {
            temp.push(
                <List component="nav" key={ "list_" + noResultsMessage }>
                    <ListItemButton key={ noResultsMessage } selected={ false }>
                        <ListItemText primary={ noResultsMessage } />
                    </ListItemButton>
                </List>
            );
        }
    }

    useEffect(() => {
        if (!(Array.isArray(results)) || results.length !== 3
            || results.some((sublist) => {return !Array.isArray(sublist)})) {
            console.error("error retrieving results");
            // eslint-disable-next-line react-hooks/exhaustive-deps
            temp = [(
                <List component="nav" key="results-error">
                    <ListItemButton key="error" selected={ false }>
                        <ListItemText primary="Error retrieving results" />
                    </ListItemButton>
                </List>
            )];
        } else {
            const [ local, dropbox, archive ] = results;
            temp = [];
            addChildren(local, 0, "No local results");
            temp.push(<Divider key='a' />);
            addChildren(dropbox, local.length, "No results in Dropbox");
            temp.push(<Divider key='b' />);
            addChildren(archive, local.length + dropbox.length, "No results in archive");
            if (local.length === 0 && dropbox.length === 0 && archive.length === 0 && selectedIndex !== -1) {
                setSelectedIndex(-1);
            }
        }
        setChildren(temp);
    }, [ results, selectedIndex ])

    return (<div className="results">
        <h2>Files</h2>
        { children }
    </div>);
}

export default ResultsPanel;
