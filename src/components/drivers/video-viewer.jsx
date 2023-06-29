// Copyright (c) 2017 PlanGrid, Inc.

import React, { Component } from 'react';

import 'styles/video.scss';
import Loading from '../loading';

class VideoViewer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
    };
    this.onCanPlay = this.onCanPlay.bind(this);
  }

  componentDidMount() {
    this.video.addEventListener('loadedmetadata', this.onCanPlay);
  }

  componentWillUnmount() {
    this.video.removeEventListener('loadedmetadata', this.onCanPlay);
  }

  onCanPlay() {
    this.setState({ loading: false });
  }

  renderLoading() {
    if (this.state.loading) {
      return <Loading />;
    }
    return null;
  }

  render() {
    const display = this.state.loading ? 'none' : 'block';
    return (
      <div className="pg-driver-view">
        <div className="video-container">
          {this.renderLoading()}
          <video
            style={{ display }}
            controls
            type={`video/${this.props.fileType}`}
            onCanPlay={e => this.onCanPlay(e)}
            ref={video => this.video = video}
            src={this.props.filePath}
          >
            Video playback is not supported by your browser.
          </video>
        </div>
      </div>
    );
  }
}

export default VideoViewer;
