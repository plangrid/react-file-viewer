import React, { Component } from 'react';

export default class PhotoViewer extends Component {
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

    const { originalWidth, originalHeight } = this.props;
    const imageDimensions = this.getImageDimensions.call(this, originalWidth, originalHeight);
    const imgStyles = {
      width: `${imageDimensions.width}px`,
      height: `${imageDimensions.height}px`,
    };

    return (
      <div style={containerStyles} className="photo-viewer-container">
        <img style={imgStyles} className="photo" src={this.props.filePath} alt="user-provided" />
      </div>
    );
  }
}
