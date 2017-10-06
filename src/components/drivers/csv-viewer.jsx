// Copyright (c) 2017 PlanGrid, Inc.

import React, { Component } from 'react';

import ReactDataGrid from 'react-data-grid';
import CSV from 'comma-separated-values';

class CsvViewer extends Component {

  static parse(data) {
    const rows = [];
    const columns = [];

    new CSV(data).forEach((array) => {
      if (columns.length < 1) {
        array.forEach((cell, idx) => {
          columns.push({
            key: `key-${idx}`,
            name: cell,
            resizable: true,
            sortable: true,
            filterable: true,
          });
        });
      } else {
        const row = {};
        array.forEach((cell, idx) => {
          row[`key-${idx}`] = cell;
        });
        rows.push(row);
      }
    });

    return { rows, columns };
  }

  constructor(props) {
    super(props);
    this.state = CsvViewer.parse(props.data);
  }

  componentWillReceiveProps(nextProps) {
    this.setState(CsvViewer.parse(nextProps.data));
  }

  render() {
    const { rows, columns } = this.state;
    return (
      <ReactDataGrid
        columns={columns}
        rowsCount={rows.length}
        rowGetter={i => rows[i]}
        minHeight={this.props.height || 650}
      />
    );
  }
}

export default CsvViewer;
