import React, { useState, useEffect } from 'react';
import '../App.css';
import SearchBar from './SearchBar';
import ResultsPanel from './ResultsPanel';
import FilePanel from './FilePanel';

function SearchArea() {
    const [ query, setQuery ] = useState("");
    const [ results, setResults ] = useState([[], [], []]);
    const [ selectedIndex, setSelectedIndex ] = useState(0);
    const [ selectedPath, setSelectedPath ] = useState("");
    const [ selectedSublist, setSelectedSublist ] = useState(3);

    useEffect(() => {
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
      var prevResults = 0;
      var newPath = "";
      var newList = 3;
      var found = false;
      
      for (let i = 0; i < results.length; i++) {
        for (let j = 0; j < results[i].length; j++) {
          if (prevResults + j === index) {
            newList = i;
            newPath = results[i][j];
            found = true;
            break;
          }
        }

        if (found) {
          break;
        }
        
        prevResults += results[i].length;
      }
      
      setSelectedIndex(index);
      setSelectedPath(newPath);

      if (newList === 3) {
        console.error("invalid result list");
      }
      setSelectedSublist(newList);
    };

    return (
      <>
        <header className="search">
          <SearchBar updateQuery={ setQuery } />
        </header>
        <div className="results-section">
          <ResultsPanel className="results"
              results={ results }
              handleResultClick={ handleResultClick }/>
          <FilePanel
              path={ selectedPath }
              sublist={ selectedSublist }
              />
        </div>
      </>
    );
}

export default SearchArea;
