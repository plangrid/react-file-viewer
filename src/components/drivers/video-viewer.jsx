import React, { Component } from 'react';

import Loading from '../loading';

class VideoViewer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
    };
  }

  renderLoading() {
    if (this.state.loading) {
      return <Loading />;
    }
    return null;
  }

  render() {
    return (
      <div className="pg-driver-view">
        {this.renderLoading()}
        <video
          controls
          type="video/mp4"
          onCanPlay={() => this.setState({ loading: false })}
          src={this.props.filePath}
        >
          Video playback is not supported by your browser.
        </video>
      </div>
    );
  }
}

export default VideoViewer;
