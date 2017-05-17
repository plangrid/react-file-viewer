import React, { Component } from 'react';
import mammoth from "mammoth";

export default class extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    var jsonFile = new XMLHttpRequest();
    jsonFile.open("GET", this.props.filePath ,true);
    jsonFile.send();
    jsonFile.responseType = 'arraybuffer';
    jsonFile.onreadystatechange = function(){
      if (jsonFile.readyState== 4 && jsonFile.status == 200){
        mammoth.convertToHtml({arrayBuffer: jsonFile.response}, {includeDefaultStyleMap: true})
        .then(function(result){
            document.getElementById("docx").innerHTML = result.value;
        })
        .catch(function(a) {
          console.log("alexei: something went wrong")
        })
        .done();
      }
    }
  }

  render() {
    return (
      <div id="docx"></div>
    )
  }
}
