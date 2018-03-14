// Copyright (c) 2017 PlanGrid, Inc.

import React from 'react';
import 'styles/unsupported.scss';

const UnsupportedViewer = props => (
  <div className="pg-driver-view">
    <div className="unsupported-message">
      {props.unsupportedComponent
        ? <props.unsupportedComponent {...props} />
        : <p className="alert"><b>{`.${props.fileType}`}</b> is not supported.</p>}
    </div>
  </div>
);

export default UnsupportedViewer;
