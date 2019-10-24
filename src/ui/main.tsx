// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
import React from 'react';
import ReactDOM from 'react-dom';

ReactDOM.render(
    <div className='app'>
        <h4>Welcome to React, Electron and Typescript</h4>
        <p>Hello World</p>
    </div>,
    document.getElementById('main')
);
