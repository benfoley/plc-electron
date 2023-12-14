import React, {useState} from 'react';
import { 
    TextField,
    InputAdornment,
    IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const SearchBar = ({ updateQuery }) => {
    const [ value, setValue ] = useState("");

    const submitQuery = (e) => {
        e.preventDefault();
        updateQuery(value);
    };

    const handleKey = (e) => {
      if (e.key === 'Enter') {
        updateQuery(value);
      }
    }

    return <TextField
        id="search-input"
        label="Search here"
        value={ value }
        onInput={ e => setValue(e.target.value) }
        onKeyDown={ handleKey }
        onSubmit={ submitQuery }
        variant="outlined" 
        InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton edge="end" color="primary" onClick={ submitQuery }>
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
        }}
    />
}


export default SearchBar;
