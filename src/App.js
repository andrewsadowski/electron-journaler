import React, { Component } from 'react';
import Markdown from 'markdown-to-jsx';
import logo from './logo.svg';
import './App.css';

const { ipcRenderer } = window.require('electron');

class App extends Component {
  state = {
    loadedFile: ''
  };
  constructor() {
    super();

    ipcRenderer.on('new-file', (event, fileContent) => {
      console.log(fileContent);
      this.setState({
        loadedFile: fileContent
      });
    });
  }
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <Markdown>{this.state.loadedFile}</Markdown>
      </div>
    );
  }
}

export default App;
