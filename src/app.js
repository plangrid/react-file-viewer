import React from 'react';
import ReactDOM from 'react-dom';
import FileViewer from './components/file-viewer.jsx';
import "styles/main.scss";

ReactDOM.render(
  <FileViewer fileType="csv"
              filePath="https://data.cityofnewyork.us/api/views/3h6b-pt5u/rows.csv"/>,
  document.getElementById('app')
);
