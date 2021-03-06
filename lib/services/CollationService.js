const File = require('./FileService');
const {
  mapSequence,
  orderBy,
  isEmpty,
  all,
  fnAsArray,
} = require('../util/ArrayUtils');
const { uuid } = require('../util/UuidUtils');

const defaultCollateFn = (file, sourcePath) => {
  const { path = '' } = file;
  const regex = new RegExp(`${sourcePath}/?`);
  const pathDiff = path.replace(regex, '');
  return pathDiff;
};

const buildSourceFilterFn = sourceFilter =>
  file => all(fnAsArray(sourceFilter), filterFn => filterFn(file));

const defaultSourceFilter = () => true;

const leadingSeparatorRegex = /^\//;
const separatorRegex = /\//;

const buildTargetFile = (collateFn, file, sourcePath, targetPath, opts) => {
  const generatedPath = collateFn.call(this, file, sourcePath, targetPath, opts);
  const newPath = `${targetPath}/${generatedPath.replace(leadingSeparatorRegex, '')}`;
  const filenameInfo = File.getFilenameInfo(newPath);

  return Object.assign({}, file, {
    path: newPath,
    ...filenameInfo,
  });
};

const sortByPathDepth = arr => orderBy(arr, [o => o.path.split(separatorRegex).length, 'path'], ['desc', 'asc']);

exports.getCopyPairs = async (sourcePath, targetPath, opts = {}) => {
  const {
    sourceFilter = defaultSourceFilter,
    collateFn = defaultCollateFn,
    recursive = false,
  } = opts;
  const files = (await File.listFiles(sourcePath, { recursive }))
    .filter(buildSourceFilterFn(sourceFilter));
  return sortByPathDepth(files)
    .map(f => [f, buildTargetFile(collateFn, f, sourcePath, targetPath, opts)]);
};

exports.collate = async (sourcePath, targetPath, opts = {}) => {
  const defaults = {
    copy: false,
    cleanDirs: true,
    dryRun: false,
    overwrite: false,
    rename: true,
  };
  const options = Object.assign({}, defaults, opts);

  const pairs = await exports.getCopyPairs(sourcePath, targetPath, options);

  const results = await mapSequence(pairs, async ([srcFile, targetFile]) => {
    const result = {
      src: srcFile.path,
      target: targetFile.path,
      op: (options.copy ? 'copy' : 'move'),
      success: true,
      size: srcFile.size,
    };

    result.targetExists = await File.exists(result.target);
    if (options.dryRun) {
      if (result.targetExists && !options.overwrite && !options.rename) {
        result.error = 'EEXIST: file already exists';
        result.success = false;
      }
      return result;
    }

    const fileOp = options.copy ? File.copy : File.move;

    try {
      await fileOp.call(this, srcFile.path, targetFile.path, { overwrite: options.overwrite });
    } catch (err) {
      // Target already exists, so if set to rename, try appending a UUID
      if (options.rename) {
        try {
          const newTarget = `${targetFile.parentDir}/${targetFile.name}-${uuid()}${isEmpty(targetFile.extension) ? '' : '.'}${targetFile.extension}`;
          await fileOp.call(this, srcFile.path, newTarget);
          result.target = newTarget;
        } catch (renameErr) {
          /* istanbul ignore next: Haven't figured out how to test this */
          return Object.assign({}, result, { success: false, error: renameErr.message });
        }
      } else {
        return Object.assign({}, result, { success: false, error: err.message });
      }
    }

    if (!options.copy && options.cleanDirs) {
      const parent = srcFile.parentDir;
      // We're only going to recursively delete subdirectories, not the top-level source directory
      if (parent !== sourcePath) {
        const otherFiles = await File.listFilesRecursive(parent);
        if (otherFiles.length === 0) await File.deleteDirectory(parent);
      }
    }
    return result;
  });
  return results;
};
