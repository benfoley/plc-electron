import React, { useState, useEffect } from 'react';
import LoadingOverlay from 'react-loading-overlay-ts';

function FilePanel({ path, preview, fileLink, sublist }) {
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

    const openFileLink = e => {
        if (fileLink)
            window.open(fileLink, "_blank");
        else 
            console.log("no link");
    }

    return (<>
        <div className='info'>
            <h2>File info</h2>
            <div className="textarea" role="textbox" >
                {path}
            </div>
            <div className='preview'>
                {preview ? <img src={`data:image/png;base64,${preview}`} alt="preview" /> : ''}
            </div>
        </div>

        <div className='actions'>
            <LoadingOverlay active={loading} spinner={loading}>
                <button className='action-button'
                    disabled={sublist === 0}
                    onClick={ handleDownload }>Download</button>
            </LoadingOverlay>
            <button className='action-button'
                    disabled={sublist === 0}
                    onClick={ openFileLink }>Open</button>
        </div>
    </>);
}

export default FilePanel;
