import React, { Component } from 'react';

import 'styles/photo-viewer.scss';

export default class PhotoViewer extends Component {


  componentDidMount() {
    this.insertImage();
  }

  componentDidUpdate() {
    const removeCurrentImage = () => {
      const node = document.getElementById('pg-photo-container');
      while (node.hasChildNodes()) {
        node.removeChild(node.lastChild);
      }
    };

    removeCurrentImage();
    this.insertImage();
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

  insertImage() {
    const { originalWidth, originalHeight } = this.props;
    const imageDimensions = this.getImageDimensions.call(this, originalWidth, originalHeight);

    this.props.texture.image.style.width = `${imageDimensions.width}px`;
    this.props.texture.image.style.height = `${imageDimensions.height}px`;
    this.props.texture.image.setAttribute('class', 'photo');
    document.getElementById('pg-photo-container').appendChild(this.props.texture.image);
  }

  render() {
    const containerStyles = {
      width: `${this.props.width}px`,
      height: `${this.props.height}px`,
    };

    return (
      <div style={containerStyles} className="photo-viewer-container" id="pg-photo-container" />
    );
  }
}
