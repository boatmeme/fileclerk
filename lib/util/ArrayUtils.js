const groupBy = require('lodash.groupby');
const flatten = require('lodash.flatten');
const orderBy = require('lodash.orderby');
const isEmpty = require('lodash.isempty');
const isFunction = require('lodash.isfunction');
const isRegex = require('lodash.isregexp');
const compact = require('lodash.compact');
const any = require('lodash.some');
const all = require('lodash.every');
const { mapSequence } = require('prolly');

const none = (...args) => !any(...args);

const { isArray } = Array;
const asArray = (maybeArr) => {
  if (isEmpty(maybeArr)) return [];
  return isArray(maybeArr) ? maybeArr : [maybeArr];
};

const mapAsArray = (arr, mapFn) => asArray(arr).map(mapFn);

const fnAsArray = (maybeFnArr) => {
  if (isFunction(maybeFnArr)) return [maybeFnArr];
  if (isArray(maybeFnArr)) return maybeFnArr.filter(o => isFunction(o));
  return [];
};

const min = arr => asArray(arr).reduce((acc, t) =>
  (t < acc ? t : acc), Number.MAX_SAFE_INTEGER);

module.exports = {
  compact,
  asArray,
  mapAsArray,
  fnAsArray,
  isArray,
  isEmpty,
  groupBy,
  orderBy,
  flatten,
  mapSequence,
  any,
  none,
  all,
  isFunction,
  isRegex,
  min,
};
