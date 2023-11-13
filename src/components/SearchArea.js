import React, { useState, useEffect } from 'react';
import './App.css';
import SearchBar from './components/SearchBar';
import ResultsPanel from './components/ResultsPanel';

function SearchArea() {
    const [ query, setQuery ] = useState("");
    const [ results, setResults ] = useState([]);

    return (
      <div>
        <header className="App-header">
          <SearchBar onSubmit={setQuery}/>
        </header>
        <ResultsPanel />
      </div>
    );
}

export default SearchArea;
