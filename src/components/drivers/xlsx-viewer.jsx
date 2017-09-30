// Copyright (c) 2017 PlanGrid, Inc.

import React, { Component } from 'react';
import XLSX from 'xlsx';

import CsvViewer from './csv-viewer';

class XlxsViewer extends Component {
  constructor(props) {
    super(props);
    this.state = this.parse();
  }

  parse() {
    const dataArr = new Uint8Array(this.props.data);
    const arr = [];

    for (let i = 0; i !== dataArr.length; i += 1) {
      arr.push(String.fromCharCode(dataArr[i]));
    }

    const workbook = XLSX.read(arr.join(''), { type: 'binary' });
    const names = Object.keys(workbook.Sheets);
    const sheets = names.map(name => (
      XLSX.utils.sheet_to_csv(workbook.Sheets[name])
    ));

    return { sheets, names, curSheetIndex: 0 };
  }

  renderSheetNames(names) {
    const sheets = names.map((name, index) => (
      <input
        key={name}
        type="button"
        value={name}
        onClick={() => {
          this.setState({ curSheetIndex: index });
        }}
      />
    ));

    return (
      <div className="sheet-names">
        {sheets}
      </div>
    );
  }

  renderSheetData(sheet) {
    const csvProps = Object.assign({}, this.props, { data: sheet });
    return (
      <CsvViewer {...csvProps} />
    );
  }

  render() {
    const { sheets, names, curSheetIndex } = this.state;
    return (
      <div className="spreadsheet-viewer">
        {this.renderSheetNames(names)}
        {this.renderSheetData(sheets[curSheetIndex || 0])}
      </div>
    );
  }
}

export default XlxsViewer;
