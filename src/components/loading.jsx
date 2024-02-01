// Copyright (c) 2017 PlanGrid, Inc.

import React from 'react';

import 'styles/loading.scss';

const Loading = () => (
  <div className="loading-container">
    {props.loadingComponent
      ? <props.loadingComponent {...props} />
      : <span className="loading" />}
  </div>
);

export default Loading;
