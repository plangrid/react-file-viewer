import React, { Component } from 'react';
import XViewer from '../../utils/xbim-viewer.debug.bundle';

import Error from './error';

export default class XBimViewer extends Component {
  // TODO check for webgl compatibility

  componentDidMount() {
    try {
      const viewer = new XViewer('xbim-viewer');
      viewer.load(this.props.filePath);
      viewer.start();
    } catch (e) {
      this.props.onError && this.props.onError(e);
      this.setState({ error: e });
    }
  }

  render() {
    if (this.state.error) {
      return <Error {...props} error={this.state.error} />;
    }

    return (
      <div className="pg-driver-view" >
        <canvas id="xbim-viewer" />
      </div>
    );
  }
}
