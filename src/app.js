import React from 'react';
import ReactDOM from 'react-dom';
import FileViewer from './components/file-viewer.jsx';
import "styles/main.scss";

ReactDOM.render(
  <FileViewer fileType="xlsx"
              filePath="https://loupe-test-attach.s3.amazonaws.com/a7310570-886b-53e2-5999-f5a03fbca707.xlsx?Signature=XLCnaMpqZ31VTtnqD4IHGJ3Iz0U%3D&Expires=1495012606&AWSAccessKeyId=AKIAJM5WK2X4EBGINUAA&response-content-disposition=attachment%3B%20filename%3D%22Simple%20Spreadsheet%20%281%29.xlsx%22"/>,
  document.getElementById('app')
);
