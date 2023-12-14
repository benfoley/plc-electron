import React, { useState, useEffect } from 'react';
import '../App.css';

function FilePanel({ path, sublist }) {
    return (<>
        <div className='info'>
            {/* <TextField id="info-field" value={"" + path + ", " + sublist} /> */}
            <span className="textarea" role="textbox" contenteditable>
                {path}
                <br />
                {sublist}
            </span>
        </div>
        <div className='download'><button id="download-button">Download</button></div>
    </>);
}

export default FilePanel;
