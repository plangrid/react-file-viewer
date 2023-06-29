// Copyright (c) 2017 PlanGrid, Inc.

import React, { Component } from 'react';

import 'styles/photo-viewer.scss';

export default class PhotoViewer extends Component {
  componentDidMount() {
    const { originalWidth, originalHeight } = this.props;
    const imageDimensions = this.getImageDimensions.call(this, originalWidth, originalHeight);

    this.props.texture.image.style.width = `${imageDimensions.width}px`;
    this.props.texture.image.style.height = `${imageDimensions.height}px`;
    this.props.texture.image.setAttribute('class', 'photo');
    document.getElementById(this.getElementId()).appendChild(this.props.texture.image);
  }

  getElementId() {
    return `pg-photo-container-${this.props.uniqIdentifier}`;
  }

  getImageDimensions(originalWidth, originalHeight) {
    // Scale image to fit into viewer
    let imgHeight;
    let imgWidth;
    const { height: viewerHeight, width: viewerWidth } = this.props;

    if (originalHeight <= viewerHeight && originalWidth <= viewerWidth) {
      imgWidth = originalWidth;
      imgHeight = originalHeight;
    } else {
      const heightRatio = viewerHeight / originalHeight;
      const widthRatio = viewerWidth / originalWidth;
      if (heightRatio < widthRatio) {
        imgHeight = originalHeight * heightRatio;
        imgWidth = originalWidth * heightRatio;
      } else {
        imgHeight = originalHeight * widthRatio;
        imgWidth = originalWidth * widthRatio;
      }
    }

    return { height: imgHeight, width: imgWidth };
  }

  render() {
    const containerStyles = {
      width: `${this.props.width}px`,
      height: `${this.props.height}px`,
    };

    return (
      <div style={containerStyles} className="photo-viewer-container" id={this.getElementId()} />
    );
  }
}
