import React, { Component } from 'react';
import Markdown from 'markdown-to-jsx';
import styled from 'styled-components';
import AceEditor from 'react-ace';
import brace from 'brace';
import 'brace/mode/markdown';
import 'brace/theme/dracula';

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
        <Split>
          <AceEditor
            mode="markdown"
            theme="dracula"
            onChange={newContent => {
              this.setState({ loadedFile: newContent });
            }}
            name="markdown_editor"
            value={this.state.loadedFile}
          />
          <RenderedWindow>
            <Markdown>{this.state.loadedFile}</Markdown>
          </RenderedWindow>
        </Split>
      </div>
    );
  }
}

export default App;

const Split = styled.div`
  display: flex;
  height: 100vh;
`;

const RenderedWindow = styled.div`
  background-color: #191324;
  width: 35%;
  padding: 20px;
  color: #fff;
  border-left: 1px solid #302b3a;
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    color: #82d8d8;
  }
  h1 {
    border-bottom: solid 3px #e54b4b;
    padding-bottom: 10px;
  }
`;
