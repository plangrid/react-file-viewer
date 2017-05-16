import React from 'react';
import ReactDOM from 'react-dom';
import FileViewer from './components/file-viewer.jsx';

ReactDOM.render(
  <FileViewer fileType="csv"
              filePath="http://spatialkeydocs.s3.amazonaws.com/FL_insurance_sample.csv"/>,
  document.getElementById('app')
);