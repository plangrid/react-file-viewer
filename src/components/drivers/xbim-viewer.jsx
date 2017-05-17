import React, { Component } from "react";

import "utils/xbim-viewer.debug.bundle.js";
import xViewer from "utils/xbim-viewer.debug.bundle.js";

export default class XBimViewer extends Component {
  // TODO check for webgl compatibility
  render() {
    const width = `${this.props.width}px`;
    const height =  `${this.props.height}px`;
    return (
      <div className="pg-driver-view" width={width} height={height} >
        <canvas id="xbim-viewer" />
      </div>
    );
  }

  componentDidMount() {
    const viewer = new xViewer("xbim-viewer");
    viewer.load(this.props.filePath);
    viewer.start();
  }
};
