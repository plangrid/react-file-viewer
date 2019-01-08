// Copyright (c) 2017 PlanGrid, Inc.

import React from 'react';
import { mount } from 'enzyme';
import { PDFPage } from 'components/drivers/pdf-viewer';

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
});
