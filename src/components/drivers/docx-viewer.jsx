import React, { Component } from 'react';
import mammoth from 'mammoth';

import 'styles/docx.scss';
import Loading from '../loading';

export default class extends Component {

  componentDidMount() {
    const jsonFile = new XMLHttpRequest();
    jsonFile.open('GET', this.props.filePath, true);
    jsonFile.send();
    jsonFile.responseType = 'arraybuffer';
    jsonFile.onreadystatechange = () => {
      if (jsonFile.readyState === 4 && jsonFile.status === 200) {
        mammoth.convertToHtml(
          { arrayBuffer: jsonFile.response },
          { includeDefaultStyleMap: true },
        )
        .then((result) => {
          document.getElementById('docx').innerHTML = result.value;
        })
        .catch((a) => {
          console.log('alexei: something went wrong', a);
        })
        .done();
      }
    };
  }

  render() {
    return (<div id="docx"><Loading /></div>);
  }
}
