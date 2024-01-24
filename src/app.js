// Copyright (c) 2017 PlanGrid, Inc.

import 'styles/main.scss';

import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import FileViewer from './components/file-viewer';
import sampleHouse from '../example_files/SampleHouse.wexbim';
import solarImage from '../example_files/02-USVI-Solar.jpg';
import docx from '../example_files/SampleSpec.docx';
import doc from '../example_files/sample.doc';
import csv from '../example_files/Total_Crime.csv';
import mp4 from '../example_files/small.mp4';
import xlsx from '../example_files/SimpleSpreadsheet.xlsx';
import photo360 from '../example_files/360photo.jpg';
import avi from '../example_files/drop.avi';
import webm from '../example_files/small.webm'
import mov from '../example_files/step.mov'
import mp3 from '../example_files/sample.mp3'
import rtf from '../example_files/sample.rtf';
import pdf from '../example_files/sample.pdf';

const demoImages = [solarImage, photo360];

const getNextDemoImage = (currentDemoImage) => {
  const currentIndex = demoImages.indexOf(currentDemoImage);
  const nextIndex = currentIndex + 1 >= demoImages.length ? 0 : currentIndex + 1;
  return demoImages[nextIndex];
};

const App = () => {
  const [demoImage, setDemoImage] = useState(demoImages[0]);

  return (
    <div>
      <p>Scroll down for more demos.</p>

      <div style={{
        height: '100vh',
        overflow: 'hidden',
      }}>
        <h2>xlsx demo</h2>
        <FileViewer
          fileType="xlsx"
          filePath={xlsx}
          onGridSort={() => null}
        />
      </div>

      <div style={{
        backgroundColor: 'white',
        margin: 'auto',
      }}>
        <h2>image demo</h2>
        <button onClick={() => setDemoImage(getNextDemoImage(demoImage))}>Swap image</button>
        <FileViewer
          fileType="jpeg"
          filePath={demoImage}
          onGridSort={() => null}
        />
      </div>
    </div>
  );
};

ReactDOM.render(
  <App />,
  window.document.getElementById('app')
);
