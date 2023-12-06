import React, { useState, useEffect } from 'react';
import '../App.css';
import './ResultsPanel.css';
import SearchBar from './SearchBar';
import ResultsPanel from './ResultsPanel';
import FilePanel from './FilePanel';

function SearchArea() {
    const [ query, setQuery ] = useState("");
    const [ results, setResults ] = useState([[], [], []]);
    const [ selectedIndex, setSelectedIndex ] = useState(0);

    useEffect(() => {
      console.log("query updated: " + query);
      if (query) {
        fetch(`/search/${query}`).then(res => res.json()).then(data => {
          console.log(data.results);
          if (Array.isArray(data.results)) {
            if (data.results.length === 3) {
              if (data.results.every((sublist) => {return Array.isArray(sublist)})) {
                setResults(data.results);
              } else {
                console.error("not a list of lists");
              }
            } else {
              console.error("wrong length of array");
            }
          } else {
            console.error("not an array");
          }
        })
      }
    }, [ query ])

    const handleResultClick = (event, index) => {
      console.log(`list item clicked: index ${index}`);
      console.log(event);
      setSelectedIndex(index);
    };

    return (
      <div>
        <header className="App-header">
          <SearchBar updateQuery={ setQuery } />
        </header>
        <div className="flex">
          <ResultsPanel
              results={ results }
              handleResultClick={ handleResultClick }/>
          <FilePanel />
        </div>
      </div>
    );
}

export default SearchArea;
