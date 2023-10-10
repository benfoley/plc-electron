import React, {useState} from 'react';
import { 
    TextField,
    InputAdornment,
    IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const SearchBar = () => {
    const [searchInput, setSearchInput] = useState("");
   
    const handleChange = (e) => {
        e.preventDefault();
        setSearchInput(e.target.value);
    };

    return <div>
        <TextField
            id="search-input"
            label="Search here"
            variant="outlined" 
            InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton edge="end" color="primary" onChange={handleChange}>
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
    </div>
}


export default SearchBar;
