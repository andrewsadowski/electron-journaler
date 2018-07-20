import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

const { ipcRenderer } = window.require('electron');

class App extends Component {
  constructor() {
    super();
    ipcRenderer.on('new-file', (event, fileContent) => {
      console.log(fileContent);
    });
  }
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to
          reload.
        </p>
      </div>
    );
  }
}

export default App;
