// Copyright (c) 2017 PlanGrid, Inc.

import React from 'react';
import renderer from 'react-test-renderer';

import { AudioViewer } from 'components/drivers';

describe('AudioViewer', () => {
  it('matches snapshot', () => {
    const tree = renderer.create(
      <AudioViewer filePath='fake/path' />
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });
});
