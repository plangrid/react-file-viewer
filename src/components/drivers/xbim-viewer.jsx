// Copyright (c) 2017 PlanGrid, Inc.

import React, { Component } from 'react';
import XViewer from '../../utils/xbim-viewer.debug.bundle';

import Error from '../error';

export default class XBimViewer extends Component {
  // TODO check for webgl compatibility
  constructor(props) {
    super(props);
    this.state = { error: false };
  }

  componentDidMount() {
    try {
      const viewer = new XViewer('xbim-viewer');
      viewer.load(this.props.filePath);
      viewer.start();
    } catch (e) {
      if (this.props.onError) {
        this.props.onError(e);
      }
      this.setState({ error: e });
    }
  }

  render() {
    if (this.state.error) {
      return <Error {...this.props} error={this.state.error} />;
    }

    return (
      <div className="pg-driver-view" >
        <canvas id="xbim-viewer" />
      </div>
    );
  }
}
