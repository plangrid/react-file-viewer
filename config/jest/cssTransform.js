// Copyright (c) 2017 PlanGrid, Inc.
// Turn style imports into empty objects

module.exports = {
  process() {
    return 'module.exports = {};';
  },
  getCacheKey(fileData, filename) {
    return 'cssTransform';
  }
};
