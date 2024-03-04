import React, {useState} from 'react';
import '../App.css';

const SettingsOverlay = ({ isActive, onClose }) => {
    return <>
        {isActive ? (<>
            <div className='settings-overlay'>
                <div className='settings-background' onClick={onClose} />
                <div className='settings-container'>
                    <div className='settings-controls'>
                        <button onClick={onClose}>Close</button>
                    </div>
                    <form>
                        <button>Log in to Dropbox</button>
                        <br />
                        <button>Log in to GCS archive</button>
                        <br /><br />
                        <label>Archive directory:  </label>
                        <input /><br /><br />
                        <label>Download directory:  </label>
                        <input /><br /><br />
                        <input type='submit' />
                    </form>
                </div>
            </div>
        </>) : null}
    </>;
}


export default SettingsOverlay;
