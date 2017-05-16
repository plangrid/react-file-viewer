import React, { Component } from 'react';

function withFetching(WrappedComponent, props) {
  return class extends Component {
    constructor(props) {
      super(props);
      this.state = {};
      this.xhr = this.createRequest(props.filePath)
    }

    componentDidMount() {
      this.fetch();
    }

    componentWillUnmount() {
      this.abort()
    }

    render() {
      if (!this.xhr)
        return <h1>CORS not supported..</h1>;

      if (this.state.data) {
        return <WrappedComponent data={this.state.data} {...this.props} />;
      } else {
        return <h1>Loading..</h1>
      }
    }

    createRequest(path) {
      let xhr = new XMLHttpRequest();

      if ("withCredentials" in xhr) {
        // XHR for Chrome/Firefox/Opera/Safari.
        xhr.open("GET", path, true);
      } else if (typeof XDomainRequest != "undefined") {
        // XDomainRequest for IE.
        xhr = new XDomainRequest();
        xhr.open("GET", path);
      } else {
        // CORS not supported.
        xhr = null;
      }

      xhr.onreadystatechange = () => {
        if (this.xhr.readyState == 4 && this.xhr.status == 200) {
          this.setState({ data: xhr.responseText })
        }
      }

      return xhr;
    }

    fetch() {
      this.xhr.send();
    }

    abort() {
      this.xhr && this.xhr.abort();
    }
  }
};

export default withFetching;