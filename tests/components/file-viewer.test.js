import React from 'react';
import { mount } from 'enzyme';
import FileViewer from 'components/file-viewer';

describe('file-viewer', () => {
  it('renders without crashing', () => {
    mount(
      <FileViewer fileType='fake' filePath='fake/path' />
    );
  });
});
