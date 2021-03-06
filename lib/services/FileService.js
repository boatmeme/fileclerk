const {
  groupBy,
  flatten,
  isEmpty,
  compact,
} = require('../util/ArrayUtils');

const {
  lstat,
  ensureDir,
  remove,
  readdir,
  ensureFile,
  move,
  copy,
  pathExists,
} = require('fs-extra');

const separatorRegex = /[/|\\]/;
const extensionRegex = /\./;

const isDirectoryByPath = async (path) => {
  const stat = await lstat(path);
  return stat.isDirectory();
};

exports.getFilenameInfo = (path) => {
  const [filename, ...parents] = path.split(separatorRegex).reverse();
  const [extension = '', ...nameParts] = filename.split(extensionRegex).reverse();
  const name = isEmpty(nameParts) ? extension : nameParts.reverse().join('.');
  return {
    filename,
    name,
    extension: isEmpty(nameParts) ? '' : extension.toLowerCase(),
    parentDir: (parents || []).reverse().join('/'),
  };
};

exports.stat = async (path) => {
  try {
    const stat = await lstat(path);
    const isDirectory = stat.isDirectory();
    const filenameInfo = exports.getFilenameInfo(path);

    return {
      path,
      ...filenameInfo,
      isDirectory,
      ...stat,
    };
  } catch (err) {
    return null;
  }
};

exports.move = move;
exports.copy = copy;
exports.exists = pathExists;

exports.listDirectories = async (path, opts = { recursive: false, skipCheck: false }) => {
  const filesAndDirs = await exports.listFilesAndDirectories(path, opts);
  const { true: directories = [] } = groupBy(filesAndDirs, 'isDirectory');
  return directories;
};

exports.createFile = ensureFile;
exports.createDirectory = ensureDir;
exports.deleteDirectory = remove;

exports.listFilesAndDirectories = async (path, opts = {}) => {
  const { recursive = false, skipCheck = false } = opts;

  // If this was a recursive call, we probably already checked the parent directory
  if (!skipCheck) {
    const bIsDirectory = await isDirectoryByPath(path);
    if (!bIsDirectory) throw new Error(`${path} is not a directory`);
  }

  const contents = await readdir(path);
  const filesAndDirs = compact(await Promise.all(contents.map(name => exports.stat(`${path}/${name}`))));
  if (!recursive) return filesAndDirs;

  // If recursive, crawl the dirs!
  const dirs = filesAndDirs.filter(({ isDirectory }) => isDirectory);
  const children = await Promise
    .all(dirs.map(f => exports.listFilesAndDirectories(f.path, { recursive, skipCheck: true })));

  return [...filesAndDirs, ...flatten(children)];
};

exports.listFiles = async (path, opts = { recursive: false }) => {
  const filesAndDirs = await exports.listFilesAndDirectories(path, opts);
  const { false: files = [] } = groupBy(filesAndDirs, 'isDirectory');
  return files;
};

exports.listDirectoriesRecursive = (path, opts = {}) =>
  exports.listDirectories(path, Object.assign(opts, { recursive: true }));

exports.listFilesRecursive = (path, opts = {}) =>
  exports.listFiles(path, Object.assign(opts, { recursive: true }));
