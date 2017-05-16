import React, { Component } from 'react';

import { default as withFetching } from "./fetch-wrapper.jsx";
import {
  CsvViewer,
  Photo360Viewer
} from "./drivers";

class FileViewer extends Component {
  render() {
    let Driver = this.getDriver(this.props.fileType);

    return (
      <div className='file-viewer'>
        <Driver {...this.props} />
      </div>
    );
  }

  getDriver(fileTYpe) {
    switch (fileTYpe) {
      case "csv": {
        return withFetching(CsvViewer)
      }
      case "jpg": {
        return Photo360Viewer
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
