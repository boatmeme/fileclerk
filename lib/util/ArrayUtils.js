const groupBy = require('lodash.groupby');
const flatten = require('lodash.flatten');
const orderBy = require('lodash.orderby');
const isEmpty = require('lodash.isempty');
const isFunction = require('lodash.isfunction');
const isRegex = require('lodash.isregexp');
const compact = require('lodash.compact');
const any = require('lodash.some');
const { mapSequence } = require('prolly');

const none = (...args) => !any(...args);

const { isArray } = Array;
const asArray = (maybeArr) => {
  if (isEmpty(maybeArr)) return [];
  return isArray(maybeArr) ? maybeArr : [maybeArr];
};

const mapAsArray = (arr, mapFn) => asArray(arr).map(mapFn);

module.exports = {
  compact,
  asArray,
  mapAsArray,
  isArray,
  isEmpty,
  groupBy,
  orderBy,
  flatten,
  mapSequence,
  any,
  none,
  isFunction,
  isRegex,
};
