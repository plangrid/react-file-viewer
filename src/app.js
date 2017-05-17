import 'styles/main.scss';

import React from 'react';
import ReactDOM from 'react-dom';
import FileViewer from './components/file-viewer';
import sampleHouse from '../example_files/SampleHouse.wexbim';

// filePath='https://data.cityofnewyork.us/api/views/3h6b-pt5u/rows.csv'
ReactDOM.render(
  <FileViewer
    fileType="wexbim"
    filePath={sampleHouse}
  />,
  window.document.getElementById('app')
);
