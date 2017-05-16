import React, { Component } from 'react';

import ReactDataGrid from "react-data-grid";
import CSV from "comma-separated-values";

const rowGetter = data => i => data.rows[i];

const parse = data => {
  const rows = [];
  const columns = [];

  new CSV(data).forEach(array => {
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
};


const CsvViewer = props => {
  const data = parse(props.data)

  return (
    <ReactDataGrid
      columns={data.columns}
      rowsCount={data.rows.length}
      rowGetter={rowGetter(data)}
      minHeight={650}
    />
  );
};

export default CsvViewer;