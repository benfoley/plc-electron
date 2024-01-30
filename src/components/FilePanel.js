import React, { useState, useEffect } from 'react';
import '../App.css';

function FilePanel({ path, sublist }) {
    function handleDownload(e) {
        console.log(sublist)
        console.log(typeof(sublist))
        if (sublist === 2) {
            fetch(`/download/archive/${path}`, {method: "GET"}).then(res => {
                console.log(res);
            })
        } else if (sublist === 1) {
            fetch(`/download/dropbox/${path}`, {method: "GET"}).then(res => {
                console.log(res);
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
        <div className='download'><button
            disabled={sublist === 0}
            id="download-button"
            onClick={ handleDownload }>Download</button></div>
    </>);
}

export default FilePanel;
