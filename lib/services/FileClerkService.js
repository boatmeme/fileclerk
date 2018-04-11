const { collate } = require('./CollationService');
const {
  isEmpty,
  fnAsArray,
  asArray,
  compact,
  none,
  any,
  mapAsArray,
  isRegex,
} = require('../util/ArrayUtils');
const { format: dateStr } = require('../util/TimeUtils');

const mapRegexArr = (arr, regexFn = o => (isRegex(o) ? o : new RegExp(o))) =>
  mapAsArray(arr, regexFn);

const leadingDot = /^\./;

exports.organize = async (sourcePath, targetPath, opts = {}) => {
  const defaults = {
    recursive: true,
    cleanDirs: true,
  };

  const extensions = mapRegexArr(opts.extensions, e => (isEmpty(e)
    ? new RegExp('.*\\/[^.]*$')
    : new RegExp(`.*\\.${e.replace(leadingDot, '')}$`, 'i')));

  const includes = mapRegexArr(opts.includes);
  const excludes = mapRegexArr(opts.excludes);

  const helperFilter = (file) => {
    if (isEmpty(extensions) && isEmpty(includes) && isEmpty(excludes)) return true;
    const comparePath = file.path.replace(new RegExp(`${sourcePath}[\\/]?`), '');
    return (isEmpty(extensions) ? true : any(extensions, e => e.test(comparePath)))
      && (isEmpty(includes) ? true : any(includes, i => i.test(comparePath)))
      && (isEmpty(excludes) ? true : none(excludes, e => e.test(comparePath)));
  };

  const sourceFilter = [...fnAsArray(opts.sourceFilter), helperFilter];

  const options = Object.assign({}, defaults, opts, { sourceFilter });

  const results = await collate(sourcePath, targetPath, options);
  return results;
};

exports.organizeByDate = (sourcePath, targetPath, opts = {}) => {
  const {
    dateFormat = ['YYYY-MM-DD'],
    dateProperty = 'ctime',
  } = opts;

  const fmtStrArr = compact(asArray(dateFormat));

  const collateFn = (f) => {
    const dateVal = f[dateProperty];
    return [
      ...fmtStrArr.map(fmtStr => `${dateStr(dateVal, fmtStr)}`),
      f.filename,
    ].join('/');
  };

  const options = Object.assign({}, opts, { collateFn });
  return exports.organize(sourcePath, targetPath, options);
};

exports.organizeByExtension = (sourcePath, targetPath, opts = {}) => {
  const {
    noExtensionDir = 'any',
  } = opts;

  const collateFn = ({ extension = noExtensionDir, filename }) =>
    (isEmpty(extension)
      ? `${noExtensionDir}/${filename}`
      : `${extension}/${filename}`);

  const options = Object.assign({}, opts, { collateFn });
  return exports.organize(sourcePath, targetPath, options);
};

const alphaNumRegex = /([0-9A-Za-z])/;
exports.organizeByAlphabetical = (sourcePath, targetPath, opts = {}) => {
  const {
    upperCase = false,
    symbolDir = '0',
  } = opts;

  const collateFn = ({ name, filename }) => {
    const matches = name.match(alphaNumRegex) || [];
    const [firstChar = symbolDir] = matches;
    const dirName = upperCase ? firstChar.toUpperCase() : firstChar.toLowerCase();
    return `/${dirName}/${filename}`;
  };

  const options = Object.assign({}, opts, { collateFn });
  return exports.organize(sourcePath, targetPath, options);
};
