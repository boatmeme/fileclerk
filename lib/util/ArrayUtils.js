const groupBy = require('lodash.groupby');
const flatten = require('lodash.flatten');
const orderBy = require('lodash.orderby');
const isEmpty = require('lodash.isempty');
const compact = require('lodash.compact');
const { mapSequence } = require('prolly');

const { isArray } = Array;
const asArray = maybeArr => (isArray(maybeArr) ? maybeArr : [maybeArr]);

module.exports = {
  compact,
  asArray,
  isArray,
  isEmpty,
  groupBy,
  orderBy,
  flatten,
  mapSequence,
};
