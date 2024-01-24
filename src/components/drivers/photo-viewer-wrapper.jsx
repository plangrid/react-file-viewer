// Copyright (c) 2017 PlanGrid, Inc.

import React, { Component } from 'react';

import * as THREE from 'three';
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
    this.loadPhoto();
  }

  componentDidUpdate(prevProps) {
    if (this.props.filePath !== prevProps.filePath) {
      this.loadPhoto();
    }
  }

  loadPhoto() {
    this.setState({
      imageLoaded: false,
    });
    const urlToLoad = this.props.filePath;
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = '';
    loader.load(
      urlToLoad,
      (texture) => {
        // If the filePath prop changed since we started loading,
        // we need to abort because the new image will have already started loading.
        if (this.props.filePath !== urlToLoad) {
          return;
        }

        this.setState({
          originalWidth: texture.image.width,
          originalHeight: texture.image.height,
          imageLoaded: true,
          texture,
        });
      },
      (xhr) => {
        console.log(`${xhr.loaded / xhr.total * 100}% loaded`);
      },
      (xhr) => {
        console.log('An error happened', xhr);
      },
    );
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
