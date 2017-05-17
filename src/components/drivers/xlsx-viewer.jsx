import React, { Component } from "react";
import XLSX from "xlsx";

import CsvViewer from "./csv-viewer";

class XlxsViewer extends Component {
  constructor(props) {
    super(props);
    this.state = this.parse(props.data);
  }

  render() {
    const { sheets, names, curSheetIndex} = this.state;
    return (
      <div className="spreadsheet-viewer">
        {this.renderSheetNames(names)}
        {this.renderSheetData(this.props, sheets[curSheetIndex || 0])}
      </div>
    );

  }

  renderSheetData(props, sheet) {
    return <CsvViewer {...props} data={sheet}/>
  }

  renderSheetNames(names) {
    const sheets = names.map((name, index) => (
      <input type="button"
             value={name}
             onClick={() => (this.setState({ curSheetIndex: index }))} />
    ));

    return (
      <div className="sheet-names">
        {sheets}
      </div>
    );
  }

  parse (data) {
    const dataArr = new Uint8Array(data);
    const arr = [];

    for (var i = 0; i != dataArr.length; ++i) {
      arr.push(String.fromCharCode(dataArr[i]));
    }

    const workbook = XLSX.read(arr.join(""), { type: "binary" });
    const names = Object.keys(workbook.Sheets);
    const sheets = names.map(name => (
      XLSX.utils.sheet_to_csv(workbook.Sheets[name])
    ))

    return { sheets, names };
  }

}

export default XlxsViewer;


