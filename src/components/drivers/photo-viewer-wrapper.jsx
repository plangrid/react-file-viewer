import React, { Component } from 'react';

import PhotoViewer from './photo-viewer';
import Photo360Viewer from './photo360-viewer';
import Loading from '../loading';

function getPhotoDriver(width, height, fileType) {
  if (fileType === 'jpg' && window.Math.abs((width / height) - 2) <= 0.01) {
    return Photo360Viewer;
  }
  return PhotoViewer;
}

export default class PhotoViewerWrapper extends Component {
  constructor(props) {
    super(props);

    this.state = {
      originalWidth: 0,
      originalHeight: 0,
      imageLoaded: false,
    };
  }

  componentDidMount() {
    const image = new window.Image();
    image.onload = (event) => {
      this.setState({
        originalWidth: event.target.width,
        originalHeight: event.target.height,
        imageLoaded: true,
      });
    };
    image.src = this.props.filePath;
  }

  render() {
    if (!this.state.imageLoaded) {
      return <Loading />;
    }
    const { originalWidth, originalHeight } = this.state;
    const PhotoDriver = getPhotoDriver(originalWidth, originalHeight, this.props.fileType);

    return (
      <PhotoDriver {...this.state} {...this.props} />
    );
  }
}
