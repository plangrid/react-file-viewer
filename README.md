# react-file-viewer

Extendable file viewer for web

## Supported file formats:

 - png, jpeg, gif, bmp, including 360-degree images
 - pdf
 - csv
 - xslx
 - docx
 - mp4


## Usage

There is one main React component, `FileViewer`, that takes the following props:

`fileType` string: type of resource to be shown (one of the supported file
formats, eg `'png'`). Passing in an unsupported file type will result in the
display of an `unsupported filetype` error.

`filePath` string: the url of the resource to be shown by the FileViewer.

`onError` function [optional]: function that will be called when there is an error in the file
viewer fetching or rendering the requested resource. This is a place where you can
pass a callback for a logging utility.

`errorComponent` react element [optional]: A component to render in case of error
instead of the default error component that comes packaged with react-file-viewer.

So, to use this component, you might do the following:

```
// MyApp.js
import React, { Component } from 'react';
import logger from 'logging-library';
import FileViewer from 'react-file-viewer';
import { CustomErrorComponent } from 'custom-error';

const file = 'http://example.com/image.png'
const type = 'png'

class MyComponent extends Component {
  render() {
    return (
      <FileViewer
        fileType={type}
        filePath={file}
        errorComponent={CustomErrorComponent}
        onError={this.onError}
    );
  }

  onError(e) {
    logger.logError(e, 'error in file-viewer');
  }
}
```

## Development

There is a demo app built into this library that can be used for development
purposes. It is by default served via webpack-dev-server.

### To start demo app

`make start` will start the demo app served by webpack-dev-server


### To run the linter

`make lint`



Roadmap

- Remove ignored linting rules and fix them 
