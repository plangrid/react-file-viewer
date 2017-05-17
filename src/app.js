import 'styles/main.scss';

import React from 'react';
import ReactDOM from 'react-dom';
import FileViewer from './components/file-viewer';
import sampleHouse from '../example_files/SampleHouse.wexbim';

// filePath='https://data.cityofnewyork.us/api/views/3h6b-pt5u/rows.csv'
ReactDOM.render(
  <FileViewer
    fileType="docx"
    filePath="https://loupe-test-attach.s3.amazonaws.com/38c2b32f-9d85-d5e4-d3fa-47afea485b38.docx?Signature=UEcd6t2Vg8ilAqI7r3%2FSQFiKA9I%3D&Expires=1495072806&AWSAccessKeyId=AKIAIOELB366ZQPABL6A&response-content-disposition=attachment%3B%20filename%3D%22SpecUploadmorefiletypes.docx%22"
  />,
  window.document.getElementById('app')
);
