import React, { Component } from 'react';

function withFetching(WrappedComponent, props) {
  return class extends Component {
    constructor() {
      super(props);
      this.state = {};
      this.xhr = this.createRequest(props.filePath);
    }

    componentDidMount() {
      this.fetch();
    }

    componentWillUnmount() {
      this.abort();
    }

    render() {
      if (!this.xhr) {
        return <h1>CORS not supported..</h1>;
      }

      if (this.state.data) {
        return <WrappedComponent data={this.state.data} {...this.props} />;
      }
      return (
        <h1>Loading..</h1>
      );
    }

    createRequest(path) {
      let xhr = new XMLHttpRequest();

      if ('withCredentials' in xhr) {
        // XHR for Chrome/Firefox/Opera/Safari.
        xhr.open('GET', path, true);
      } else if (typeof XDomainRequest !== 'undefined') {
        // XDomainRequest for IE.
        xhr = new XDomainRequest();
        xhr.open('GET', path);
      } else {
        // CORS not supported.
        xhr = null;
        return null;
      }
      if (props.responseType) {
        xhr.responseType = props.responseType;
      }

      xhr.onload = () => {
        const resp = props.responseType ? xhr.response : xhr.responseText;

        this.setState({ data: resp });
      };

      return xhr;
    }

    fetch() {
      this.xhr.send();
    }

    abort() {
      if (this.xhr) {
        this.xhr.abort();
      }
    }
  };
}

export default withFetching;
