// Copyright (c) 2017 PlanGrid, Inc.

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import 'styles/main.scss';
import withFetching from './fetch-wrapper';

import {
  CsvViewer,
  DocxViewer,
  VideoViewer,
  XlsxViewer,
  XBimViewer,
  PDFViewer,
  UnsupportedViewer,
  PhotoViewerWrapper,
  AudioViewer,
} from './drivers';

class FileViewer extends Component {
  constructor(props) {
    super(props);
    this.uniqIdentifier = Math.floor(Math.random() * 100000);
    this.state = {
      loading: true,
    };
  }

  getDriver(commonProps) {
    switch (this.props.fileType) {
      case 'csv': {
        return withFetching(CsvViewer, commonProps);
      }
      case 'xlsx': {
        const newProps = Object.assign({}, commonProps, { responseType: 'arraybuffer' });
        return withFetching(XlsxViewer, newProps);
      }
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'bmp':
      case 'png': {
        return PhotoViewerWrapper;
      }
      case 'pdf': {
        return PDFViewer;
      }
      case 'docx': {
        return DocxViewer;
      }
      case 'mp3': {
        return AudioViewer;
      }
      case 'webm':
      case 'mp4': {
        return VideoViewer;
      }
      case 'wexbim': {
        return XBimViewer;
      }
      default: {
        return UnsupportedViewer;
      }
    }
  }

  render() {
    const commonProps = Object.assign({}, this.props, { uniqIdentifier: this.uniqIdentifier });
    const Driver = this.getDriver(commonProps);
    const container = document.getElementById('pg-viewer');
    const height = container ? container.clientHeight : 0;
    const width = container ? container.clientWidth : 0;
    return (
      <div className="pg-viewer-wrapper">
        <div className="pg-viewer" id="pg-viewer">
          <Driver {...commonProps} width={width} height={height} />
        </div>
      </div>
    );
  }
}

FileViewer.propTypes = {
  fileType: PropTypes.string.isRequired,
  filePath: PropTypes.string.isRequired,
  onError: PropTypes.func,
  errorComponent: PropTypes.element,
  unsupportedComponent: PropTypes.element,
};

FileViewer.defaultProps = {
  onError: () => null,
  errorComponent: null,
  unsupportedComponent: null,
};

export default FileViewer;
module.exports = FileViewer;
