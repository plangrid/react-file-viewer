import React, { Component } from 'react';

function withFetching(WrappedComponent, props) {
  return class extends Component {
    constructor(props) {
      super(props);
      this.state = { data: {} };
      this.xhr = this.createRequest()
    }

    componentDidMount() {
      this.fetch(this.props.filePath);
    }

    componentWillUnmount() {
      this.abort()
    }

    render() {
      if (this.state.data.length > 0 || Object.keys(this.state.data).length > 0) {
        return <WrappedComponent data={this.state.data} {...this.props} />;
      } else {
        return <h1>Loading..</h1>
      }
    }

    createRequest() {
      const xhr = new XMLHttpRequest();

      xhr.onreadystatechange = () => {
        if (this.xhr.readyState == 4 && this.xhr.status == 200) {
          this.setState({ data: xhr.responseText })
        }
      }

      return xhr;
    }

    fetch(path) {
      this.xhr.open("GET", path, true);
      this.xhr.send();
    }

    abort() {
      this.xhr && this.xhr.abort();
    }
  }
};

export default withFetching;