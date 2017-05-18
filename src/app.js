import 'styles/main.scss';

import React from 'react';
import ReactDOM from 'react-dom';
import FileViewer from './components/file-viewer';
import sampleHouse from '../example_files/SampleHouse.wexbim';
import solarImage from '../example_files/02-USVI-Solar.jpg';
import docx from '../example_files/SampleSpec.docx';
import csv from '../example_files/Total_Crime.csv';

// filePath='https://data.cityofnewyork.us/api/views/3h6b-pt5u/rows.csv'
ReactDOM.render(
  <FileViewer
    fileType="dddd"
    filePath={csv}
  />,
  window.document.getElementById('app')
);
