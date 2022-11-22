// Copyright (c) 2017 PlanGrid, Inc.
import { readFileSync } from 'fs'

import React from 'react';
import { mount } from 'enzyme';
import { createWaitForElement } from 'enzyme-wait';
import { PDFPage } from 'components/drivers/pdf-viewer';
import PDFDriver from '../../src/components/drivers/pdf-viewer'

describe('pdf-viewer', () => {
  let spy;
  beforeEach(() => {
    spy = jest.spyOn(PDFPage.prototype, 'fetchAndRenderPage').mockImplementation(() => {})
  })

  afterEach(() => {
    spy.mockReset();
    spy.mockRestore();
  })

  it('renders without crashing', () => {
    mount(
      <PDFPage fileType='fake' filePath='fake/path' />
    );
  });

  it('calls fetchAndRenderPage on mount with visibility check disabled', () => {
   mount(
      <PDFPage fileType='fake' filePath='fake/path' disableVisibilityCheck />
    );
    expect(spy).toHaveBeenCalled();
  });

  it('does not call fetchAndRenderPage on mount with visibility check enabled', () => {
    mount(
      <PDFPage fileType='fake' filePath='fake/path' disableVisibilityCheck={false} />
    );
    expect(spy).not.toHaveBeenCalled();
  });

  it('updates loading progress state', async () => {
    const fileContents = readFileSync('./example_files/sample.pdf');
    const wrapper = mount(
      <PDFDriver fileType='pdf' filePath={fileContents} />
    );
    createWaitForElement('.pdf-canvas')(wrapper).then((componentReady) => {
      expect(componentReady.state().percent).toBe('100')
    })
  });
});
