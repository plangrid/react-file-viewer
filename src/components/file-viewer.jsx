// Copyright (c) 2017 PlanGrid, Inc.

import React, { lazy, Suspense, Component } from 'react'
import PropTypes from 'prop-types'
import 'styles/main.scss'
import withFetching from './fetch-wrapper'

const CsvViewer = lazy(() => import('./drivers/csv-viewer'))
const DocxViewer = lazy(() => import('./drivers/docx-viewer'))
const VideoViewer = lazy(() => import('./drivers/video-viewer'))
const XlsxViewer = lazy(() => import('./drivers/xlsx-viewer'))
const XBimViewer = lazy(() => import('./drivers/xbim-viewer'))
const PDFViewer = lazy(() => import('./drivers/pdf-viewer'))
const UnsupportedViewer = lazy(() => import('./drivers/unsupported-viewer'))
const PhotoViewerWrapper = lazy(() => import('./drivers/photo-viewer-wrapper'))
const AudioViewer = lazy(() => import('./drivers/audio-viewer'))

class FileViewer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: true,
    }
  }

  componentDidMount() {
    const container = document.getElementById('pg-viewer')
    const height = container ? container.clientHeight : 0
    const width = container ? container.clientWidth : 0
    this.setState({ height, width })
  }

  getDriver() {
    switch (this.props.fileType) {
      case 'csv': {
        return withFetching(CsvViewer, this.props)
      }
      case 'xlsx': {
        const newProps = Object.assign({}, this.props, {
          responseType: 'arraybuffer',
        })
        return withFetching(XlsxViewer, newProps)
      }
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'bmp':
      case 'png': {
        return PhotoViewerWrapper
      }
      case 'pdf': {
        return PDFViewer
      }
      case 'docx': {
        return DocxViewer
      }
      case 'mp3': {
        return AudioViewer
      }
      case 'webm':
      case 'mp4': {
        return VideoViewer
      }
      case 'wexbim': {
        return XBimViewer
      }
      default: {
        return UnsupportedViewer
      }
    }
  }

  render() {
    const Driver = this.getDriver(this.props)
    const LoadingFallback = () => <div>Loading file viewer...</div>
    return (
      <div className="pg-viewer-wrapper">
        <div className="pg-viewer" id="pg-viewer">
          <Suspense fallback={<LoadingFallback />}>
            <Driver
              {...this.props}
              width={this.state.width}
              height={this.state.height}
            />
          </Suspense>
        </div>
      </div>
    )
  }
}

FileViewer.propTypes = {
  fileType: PropTypes.string.isRequired,
  filePath: PropTypes.string.isRequired,
  onError: PropTypes.func,
  errorComponent: PropTypes.element,
  unsupportedComponent: PropTypes.element,
}

FileViewer.defaultProps = {
  onError: () => null,
  errorComponent: null,
  unsupportedComponent: null,
}

export default FileViewer
module.exports = FileViewer
