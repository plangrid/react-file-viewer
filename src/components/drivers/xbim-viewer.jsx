import React, { Component } from 'react';
import XViewer from '../../utils/xbim-viewer.debug.bundle';

export default class XBimViewer extends Component {
  // TODO check for webgl compatibility

  componentDidMount() {
    const viewer = new XViewer('xbim-viewer');
    viewer.load(this.props.filePath);
    viewer.start();
  }

  render() {
    const width = `${this.props.width}px`;
    const height = `${this.props.height}px`;
    return (
      <div className="pg-driver-view" width={width} height={height} >
        <canvas id="xbim-viewer" />
      </div>
    );
  }
}
