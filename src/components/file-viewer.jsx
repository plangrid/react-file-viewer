// Copyright (c) 2017 PlanGrid, Inc.

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import 'styles/main.scss';
import withFetching from './fetch-wrapper';

import loadable from '@loadable/component';

const CsvViewer = loadable(() => import('./drivers/csv-viewer'));
const Photo360Viewer = loadable(() => import('./drivers/photo360-viewer'));
const PDFViewer = loadable(() => import('./drivers/pdf-viewer'));
const DocxViewer = loadable(() => import('./drivers/docx-viewer'));
const VideoViewer = loadable(() => import('./drivers/video-viewer'));
const XlsxViewer = loadable(() => import('./drivers/xlsx-viewer'));
const XBimViewer = loadable(() => import('./drivers/xbim-viewer'));
const UnsupportedViewer = loadable(() =>
  import('./drivers/unsupported-viewer'),
);
const PhotoViewer = loadable(() => import('./drivers/photo-viewer'));
const PhotoViewerWrapper = loadable(() =>
  import('./drivers/photo-viewer-wrapper'),
);
const AudioViewer = loadable(() => import('./drivers/audio-viewer'));

class FileViewer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
    };
  }

  componentDidMount() {
    const container = document.getElementById('pg-viewer');
    const height = container ? container.clientHeight : 0;
    const width = container ? container.clientWidth : 0;
    this.setState({ height, width });
  }

  getDriver() {
    switch (this.props.fileType) {
      case 'csv': {
        return withFetching(CsvViewer, this.props);
      }
      case 'xlsx': {
        const newProps = Object.assign({}, this.props, {
          responseType: 'arraybuffer',
        });
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
    const Driver = this.getDriver(this.props);
    return (
      <div className="pg-viewer-wrapper">
        <div className="pg-viewer" id="pg-viewer">
          <Driver
            {...this.props}
            width={this.state.width}
            height={this.state.height}
          />
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
