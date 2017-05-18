import React, { Component } from 'react';
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
} from './drivers';

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
        const newProps = Object.assign({}, this.props, { responseType: 'arraybuffer' });
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
        <a onClick={this.props.getPrevious} className="pg-viewer-link prev" />
        <div className="pg-viewer" id="pg-viewer">
          <Driver {...this.props} width={this.state.width} height={this.state.height} />
        </div>
        <a onClick={this.props.getNext} className="pg-viewer-link next" />
      </div>
    );
  }
}

FileViewer.propTypes = {
  fileType: React.PropTypes.string.isRequired,
  filePath: React.PropTypes.string.isRequired,
};

export default FileViewer;
module.exports = FileViewer;
