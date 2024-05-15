import React, { useState, useEffect } from "react";
import { googleLogout, useGoogleLogin } from "@react-oauth/google";
import "./App.css";

import { IconButton } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import LoadingOverlay from "react-loading-overlay-ts";

import SearchBar from "./components/SearchBar";
import ResultsPanel from "./components/ResultsPanel";
import FilePanel from "./components/FilePanel";
import SettingsOverlay from "./components/SettingsOverlay";
// import SearchArea from './components/SearchArea';

// https://blog.logrocket.com/guide-adding-google-login-react-app/
// https://www.npmjs.com/package/react-loading-overlay

function App() {
    const [settingsIsActive, setSettingsIsActive] = useState(false);
    const [query, setQuery] = useState("");
    const [queryTranslation, setQueryTranslation] = useState("");
    const [results, setResults] = useState([[], [], []]);
    // const [ selectedIndex, setSelectedIndex ] = useState(0);
    const [selectedPath, setSelectedPath] = useState("");
    const [selectedSublist, setSelectedSublist] = useState(3);
    const [selectedPreview, setSelectedPreview] = useState(null);
    const [selectedFileLink, setSelectedFileLink] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (query) {
            console.log("query", query);

            // show me the query translation.. eg bird also finding xxx, yyy, zzz
            fetch(`/search/explain/${query}`)
                .then((res) => res.json())
                .then((data) => {
                    console.log("search/explain");
                    console.log(data.explanation);
                    setQueryTranslation(data.explanation);
                });

            setLoading(true);

            fetch(`/search/${query}`)
                .then((res) => res.json())
                .then((data) => {
                    console.log("search data.results", data.results);
                    if (Array.isArray(data.results)) {
                        if (data.results.length === 3) {
                            if (
                                data.results.every((sublist) => {
                                    return Array.isArray(sublist);
                                })
                            ) {
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

                    setLoading(false);
                });
        }
    }, [query]);

    // login user
    // useEffect(() => {
    //     if (user) {
    //         fetch(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`, {
    //             headers: {
    //                 Authorization: `Bearer ${user.access_token}`,
    //                 Accept: 'application/json'
    //             }
    //         })
    //         .then(res => res.json())
    //         .then(res => setProfile(res))
    //         .catch(err => console.log(err));
    //     }
    // }, [ user ]);

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

        setSelectedPath(newPath);
        handlePreview(newPath);

        if (newList === 3) {
            console.error("invalid result list");
        }
        setSelectedSublist(newList);
    };

    const renderList = (my_list) => {
        if (my_list && my_list.length > 0) {
            return my_list.join(", ");
        } else {
            return "";
        }
    };

    const handlePreview = (newPath) => {
        fetch(`/preview/dropbox/${newPath}`, { method: "GET" })
            .then((response) => response.json())
            .then((data) => {
                setSelectedPreview(data.thumbnails);
                setSelectedFileLink(data.link);
            });
    };

    return (
        <LoadingOverlay active={loading} spinner={loading}>
            <div className="App">
                <header className="search">
                    <div>
                        <SearchBar updateQuery={setQuery} enabled={!loading} />
                        <IconButton onClick={() => setSettingsIsActive(true)}>
                            <SettingsIcon />
                        </IconButton>
                        <SettingsOverlay
                            isActive={settingsIsActive}
                            onClose={() => setSettingsIsActive(!settingsIsActive)}
                        />
                    </div>

                    <div className="query-translated">
                        <p>Search explanation:</p>
                        <li>Excluded: {renderList(queryTranslation[0])}</li>
                        <li>
                            Included and optional:{" "}
                            {renderList(queryTranslation[1])}
                        </li>
                    </div>
                </header>

                <div className="results-section">
                    <ResultsPanel
                        className="results"
                        results={results}
                        handleResultClick={handleResultClick}
                    />
                    <FilePanel
                        path={selectedPath}
                        preview={selectedPreview}
                        fileLink={selectedFileLink}
                        sublist={selectedSublist}
                    />
                </div>
            </div>
        </LoadingOverlay>
    );
}

export default App;
