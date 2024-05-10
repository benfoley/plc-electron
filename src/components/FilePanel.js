import React, { useState, useEffect } from 'react';
import '../App.css';

import LoadingOverlay from 'react-loading-overlay-ts';

function FilePanel({ path, sublist }) {
    const [ loading, setLoading ] = useState(false);

    function handleDownload(e) {
        if (sublist === 2) {
            setLoading(true);
            fetch(`/download/archive/${path}`, {method: "GET"}).then(res => {
                console.log(res);
                setLoading(false);
            })
        } else if (sublist === 1) {
            setLoading(true);
            fetch(`/download/dropbox/${path}`, {method: "GET"}).then(res => {
                console.log(res);
                setLoading(false);
            })
        }
    }

    return (<>
        <div className='info'>
            {/* <TextField id="info-field" value={"" + path + ", " + sublist} /> */}
            <span className="textarea" role="textbox" contenteditable>
                {path}
                <br />
                {path ? "list " + sublist : null}
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
