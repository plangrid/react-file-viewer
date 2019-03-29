// Copyright (c) 2017 PlanGrid, Inc.

import React, { Component } from 'react';

import 'styles/video.scss';
import Loading from '../loading';

class AudioViewer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
    };
  }

  onCanPlay = () => {
    this.setState({ loading: false });
  }

  componentDidMount() {
    this.audio.addEventListener('loadedmetadata', this.onCanPlay);
  }

  componentWillUnmount() {
    this.audio.removeEventListener('loadedmetadata', this.onCanPlay);
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
          <audio
            style={{ display }}
            controls
            ref={(audio) => this.audio = audio}
            onCanPlay={e => this.onCanPlay(e)}
            src={this.props.filePath}
          >
            Video playback is not supported by your browser.
          </audio>
        </div>
      </div>
    );
  }
}

export default AudioViewer;
