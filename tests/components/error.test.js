// Copyright (c) 2017 PlanGrid, Inc.

import React from 'react';
import renderer from 'react-test-renderer';

import Error from 'components/error';

describe('Error component', () => {
  it('matches stored snapshot', () => {
    const tree = renderer.create(
      <Error />
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });
});
