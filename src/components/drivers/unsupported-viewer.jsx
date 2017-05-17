import React from 'react';
import 'styles/unsupported.scss';

const UnsupportedViewer = props => (
  <div className="pg-driver-view">
    <div className="unsupported-message">
      <b>{`.${props.fileType}`}</b> is not supported.
    </div>
  </div>
);

export default UnsupportedViewer;
