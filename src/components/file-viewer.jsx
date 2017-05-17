import React, { Component } from 'react';
import { default as withFetching } from "./fetch-wrapper";
import "styles/main.scss";

import {
  CsvViewer,
  Photo360Viewer,
  DocxViewer,
  VideoViewer,
  XlsxViewer,
  XBimViewer,
  PDFViewer,
} from "./drivers";

class FileViewer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const height = document.getElementById("pg-viewer").clientHeight;
    const width = document.getElementById("pg-viewer").clientWidth;
    this.setState({ height, width });
  }

  render() {
    let Driver = this.getDriver(this.props);
    return (
      <div className="pg-viewer-wrapper">
        <a onClick={this.props.getPrevious} className="pg-viewer-link prev"/>
        <div className="pg-viewer" id="pg-viewer">
          <Driver {...this.props} width={this.state.width} height={this.state.height} />
        </div>
        <a onClick={this.props.getNext} className="pg-viewer-link next"/>
      </div>
    );
  }

  getDriver(props) {
    switch (props.fileType) {
      case "csv": {
        return withFetching(CsvViewer, props)
      }
      case "xlsx":{
        const newProps = Object.assign({}, props, { responseType: "arraybuffer" });
        return withFetching(XlsxViewer, newProps);
      }
      case "jpg": {
        return Photo360Viewer
      }
      case "pdf": {
        return PDFViewer
      }
      case "docx": {
        return DocxViewer
      }
      case "mp4": {
        return VideoViewer
      }
      case "wexbim": {
        return XBimViewer
      }
      default: {
        return <h1>File type is not supported</h1>
      }
    }
  }
};

FileViewer.propTypes = {
  fileType: React.PropTypes.string.isRequired,
  filePath: React.PropTypes.string.isRequired,
}

export default FileViewer;
module.exports = FileViewer;
