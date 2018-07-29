import React, { Component } from 'react';
import Markdown from 'markdown-to-jsx';
import styled from 'styled-components';
import dateFns from 'date-fns';
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

    ipcRenderer.on('save-file', (event, fileContent) => {
      console.log('file saved');
      this.saveFile();
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
      const filesData = filteredFiles.map(file => {
        const date = file.substr(
          file.indexOf('_') + 1,
          file.indexOf('.') - file.indexOf('_') - 1
        );
        return {
          date,
          path: `${directory}/${file}`,
          title: file.substr(0, file.indexOf('_'))
        };
      });
      //sort files
      filesData.sort((a, b) => {
        const aDate = new Date(a.date);
        const bDate = new Date(b.date);

        const aSec = aDate.getTime();
        const bSec = bDate.getTime();

        return bSec - aSec;
      });

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
    const {
      activeIndex,
      filesData,
      directory,
      loadedFile
    } = this.state;
    return (
      <AppWrap className="App">
        <Header>Journaler</Header>
        {this.state.directory ? (
          <Split>
            <FilesWindow>
              <Button>+ New Entry</Button>
              {filesData.map((file, index) => (
                <FileButton
                  onClick={this.changeFile(index)}
                  active={activeIndex === index}
                >
                  <p className="title">{file.title}</p>
                  <p className="date">{formatDate(file.date)}</p>
                </FileButton>
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
                value={loadedFile}
              />
            </CodeWindow>
            <RenderedWindow>
              <Markdown>{loadedFile}</Markdown>
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

const FileButton = styled.button`
  padding: 10px;
  width: 100%;
  background: #191324;
  opacity: 0.4;
  color: white;
  text-align: left;
  border: none;
  border-bottom: solid 1px #302b3a;
  transition: 0.3s ease all;
  &:hover {
    opacity: 1;
    border-left: solid 4px #82d8d8;
  }
  ${({ active }) =>
    active &&
    `
  opacity: 1;
  border-left: solid 4px #82d8d8;
  `};
  .title {
    font-weight: bold;
    font-size: 0.9rem;
    margin: 0 0 5px;
  }
  .date {
    margin: 0;
  }
`;

const Button = styled.button`
  background: transparent;
  color: white;
  display: block;
  border: solid 1px #82b8d8;
  border-radius: 4px;
  margin: 1rem auto;
  font-size: 1rem;
  transition: 0.3 ease all;
  padding: 5px 10px;
  &:hover {
    background: #82d8d8;
    color: #191324;
  }
`;

const formatDate = date =>
  dateFns.format(new Date(date), 'MMMM Do YYYY');
