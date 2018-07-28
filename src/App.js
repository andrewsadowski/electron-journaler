import React, { Component } from 'react';
import Markdown from 'markdown-to-jsx';
import styled from 'styled-components';
import AceEditor from 'react-ace';
import brace from 'brace';
import 'brace/mode/markdown';
import 'brace/theme/dracula';

import './App.css';

const { ipcRenderer } = window.require('electron');
const settings = window.require('electron-settings');
const fs = window.require('fs');

class App extends Component {
  state = {
    loadedFile: '',
    filesData: [],
    activeIndex: 0,
    directory: settings.get('directory') || null
  };
  constructor() {
    super();

    //On load, check to see if dir exists, if so load
    const directory = settings.get('directory');
    if (directory) {
      this.loadAndReadFiles(directory);
    }

    ipcRenderer.on('new-file', (event, fileContent) => {
      console.log(fileContent);
      this.setState({
        loadedFile: fileContent
      });
    });

    ipcRenderer.on('new-dir', (event, directory) => {
      this.setState({
        directory
      });
      settings.set('directory', directory);
      this.loadAndReadFiles(directory);
    });
  }

  loadAndReadFiles = directory => {
    fs.readdir(directory, (err, files) => {
      const filteredFiles = files.filter(file =>
        file.includes('.md')
      );
      const filesData = filteredFiles.map(file => ({
        path: `${directory}/${file}`
      }));
      this.setState(
        {
          filesData
        },
        () => this.loadFile(0)
      );
    });
  };

  changeFile = index => () => {
    const { activeIndex } = this.state;
    if (index !== activeIndex) {
      this.saveFile();
      this.loadFile(index);
    }
  };

  loadFile = index => {
    const { filesData } = this.state;

    const content = fs.readFileSync(filesData[index].path).toString();
    this.setState({
      loadedFile: content,
      activeIndex: index
    });
  };

  saveFile = () => {
    const { activeIndex, loadedFile, filesData } = this.state;
    fs.writeFile(filesData[activeIndex].path, loadedFile, err => {
      if (err) return console.log(err);
      console.log('File was saved');
    });
  };

  render() {
    return (
      <AppWrap className="App">
        <Header>Journaler</Header>
        {this.state.directory ? (
          <Split>
            <FilesWindow>
              {this.state.filesData.map((file, index) => (
                <button onClick={this.changeFile(index)}>
                  {file.path}
                </button>
              ))}
            </FilesWindow>
            <CodeWindow>
              <AceEditor
                mode="markdown"
                theme="dracula"
                onChange={newContent => {
                  this.setState({ loadedFile: newContent });
                }}
                name="markdown_editor"
                value={this.state.loadedFile}
              />
            </CodeWindow>
            <RenderedWindow>
              <Markdown>{this.state.loadedFile}</Markdown>
            </RenderedWindow>
          </Split>
        ) : (
          <LoadingMessage>
            <h1>Press cmd or Ctrl+O to open a directory</h1>
          </LoadingMessage>
        )}
      </AppWrap>
    );
  }
}

export default App;

const AppWrap = styled.div`
  margin-top: 23px;
`;

const LoadingMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  background-color: #191324;
  height: 100vh;
`;

const Header = styled.header`
  background-color: #191324;
  color: #75717c;
  font-size: 0.8rem;
  height: 23px;
  text-align: center;
  position: fixed;
  padding-top: 3px;
  box-shadow: 0px 3px 3px rgba(0, 0, 0, 0.2);
  top: 0;
  left: 0;
  width: 100%;
  z-index: 10;
  -webkit-app-region: drag;
`;

const Split = styled.div`
  display: flex;
  height: 100vh;
`;

const FilesWindow = styled.div`
  background: #140f1d;
  border-right: solid 1px #302b3a;
  position: relative;
  width: 20%;
  &:after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    pointer-events: none;
    box-shadow: -10px 0 20px rgba(0, 0, 0, 0.3) inset;
  }
`;

const CodeWindow = styled.div`
  flex: 1;
  padding-top: 2rem;
  background-color: #191324;
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
  a {
    color: #e54b4b;
  }
`;
