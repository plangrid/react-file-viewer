import React, { Component } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
import "styles/pdf.scss";

const options = {
  cMapUrl: "cmaps/",
  cMapPacked: true,
};

export default class PdfViewer extends Component {
  state = {
    numPages: null,
  };

  onDocumentLoadSuccess = ({ numPages }) => {
    this.setState({ numPages });
  };

  render() {
    const { numPages } = this.state;

    return (
      <div className="pdfContainer">
        <Document
          file={this.props.filePath}
          onLoadSuccess={this.onDocumentLoadSuccess}
          options={options}
        >
          {Array.from(new Array(numPages), (el, index) => (
            <Page key={`page_${index + 1}`} pageNumber={index + 1} />
          ))}
        </Document>
      </div>
    );
  }
}
