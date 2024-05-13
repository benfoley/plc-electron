import React, { useState, useEffect } from 'react';
import '../App.css';

import LoadingOverlay from 'react-loading-overlay-ts';

function FilePanel({ path, sublist }) {
    const [ loading, setLoading ] = useState(false);

    const handleDownload = e => {
        setLoading(true);
        // The URLs here are handled by Flask. Look in api/api.py
        // Flask should download the file from Cloud/DropBox and save to downloads dir
        // TODO: add async and move setLoading out of then
        // sublist 2 is cloud, sublist 1 is dropbox
        if (sublist === 2) {
            fetch(`/download/archive/${path}`, {method: "GET"})
            .then(res => {
                console.log(res);
                setLoading(false);
            })
        } else if (sublist === 1) {
            fetch(`/download/dropbox/${path}`, {method: "GET"})
            .then(res => {
                console.log(res);
                setLoading(false);
            })
        }                  
    }
    
    return (<>
        <div className='info'>
            <span className="textarea" role="textbox" >
                {path}
            </span>
        </div>
        <LoadingOverlay active={loading} spinner={loading}>
            <button className='download'
                disabled={sublist === 0}
                id="download-button"
                onClick={ handleDownload }>Download</button>
        </LoadingOverlay>
    </>);
}

export default FilePanel;
