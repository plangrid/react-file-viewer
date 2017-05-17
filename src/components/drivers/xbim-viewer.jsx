import React, { Component } from "react";

import "utils/xbim-viewer.debug.bundle.js";
import xViewer from "utils/xbim-viewer.debug.bundle.js";

export default class XBimViewer extends Component {
  // TODO check for webgl compatibility
  render() {
    return <canvas id="xbim-viewer" width={500} height={300} />
  }

  componentDidMount() {
    const viewer = new xViewer("xbim-viewer");
    viewer.load(this.props.filePath);
    viewer.start();
  }
};
