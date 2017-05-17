import React from 'react';

const UnsupportedViewer = props => (
  <div className="pg-driver-view">
    {`.${props.fileType}`} is not supported.
  </div>
);

export default UnsupportedViewer;
