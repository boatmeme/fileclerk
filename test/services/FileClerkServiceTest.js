const should = require('should');
const moment = require('moment-timezone');
const { wait } = require('prolly');
const FileService = require('../../lib/services/FileService');
const FileClerk = require('../../lib/services/FileClerkService');

describe('FileClerkService', () => {
  const home = './test/fixtures';

  before(async () => {
    await FileService.createDirectory(home);
  });
  after(async () => {
    await FileService.deleteDirectory(home);
  });

  describe('organize', () => {
    const srcDir = `${home}/Pictures/INCOMING`;
    const targetDir = `${home}/PictureDestination`;

    beforeEach(async () => {
      await FileService.createFile(`${srcDir}/01.mp4`);
      await FileService.createFile(`${srcDir}/02.png`);
      await FileService.createFile(`${srcDir}/03/04.png`);
      await FileService.createFile(`${srcDir}/03/sub/another.mp4`);
      await FileService.createDirectory(`${srcDir}/03/sub/donotfind.dir`);
      await FileService.createFile(`${srcDir}/05/06/07.png`);
      await FileService.createFile(`${srcDir}/05/06/07.jpg`);
      await FileService.createFile(`${srcDir}/05/07/10.mp4`);
      await FileService.createDirectory(`${srcDir}/05/08/09`);
      await FileService.createFile(`${srcDir}/png/1.arf`);
      await FileService.createFile(`${srcDir}/png/2.arf`);
      await FileService.createFile(`${srcDir}/png/3.arf`);
    });
    afterEach(async () => {
      await FileService.deleteDirectory(srcDir);
      await FileService.deleteDirectory(targetDir);
    });

    it('should organize with no parameters', async () => {
      const files = await FileClerk.organize(srcDir, targetDir);
      files.should.be.an.Array().of.length(10);
      const remainingDirs = await FileService.listDirectoriesRecursive(srcDir);
      remainingDirs.should.be.an.Array().of.length(3);
      const remainingFiles = await FileService.listFilesRecursive(srcDir);
      remainingFiles.should.be.an.Array().of.length(0);
      const newDirs = await FileService.listDirectoriesRecursive(targetDir);
      newDirs.should.be.an.Array().of.length(6);
      const newFiles = await FileService.listFilesRecursive(targetDir);
      newFiles.should.be.an.Array().of.length(10);
    });

    it('should organize with list of extension filters', async () => {
      const opts = {
        extensions: ['jpg', 'png'],
      };
      const files = await FileClerk.organize(srcDir, targetDir, opts);
      files.should.be.an.Array().of.length(4);
      const remainingDirs = await FileService.listDirectoriesRecursive(srcDir);
      remainingDirs.should.be.an.Array().of.length(8);
      const remainingFiles = await FileService.listFilesRecursive(srcDir);
      remainingFiles.should.be.an.Array().of.length(6);
      const newDirs = await FileService.listDirectoriesRecursive(targetDir);
      newDirs.should.be.an.Array().of.length(3);
      const newFiles = await FileService.listFilesRecursive(targetDir);
      newFiles.should.be.an.Array().of.length(4);
    });

    it('should organize with list of includes regex strings', async () => {
      const testDir = `${srcDir}/regextest`;
      await FileService.createFile(`${testDir}/includes/01.mp4`);
      await FileService.createFile(`${testDir}/includes/02.png`);
      await FileService.createFile(`${testDir}/includes/03/04.jpg`);
      await FileService.createFile(`${testDir}/other/includes/02.png`);
      await FileService.createFile(`${testDir}/other/includes/shouldmatch/02.png`);

      const opts = {
        extensions: ['png', 'jpg'],
        includes: ['^includes', 'shouldmatch'],
      };
      const files = await FileClerk.organize(testDir, targetDir, opts);
      files.should.be.an.Array().of.length(3);
      const remainingDirs = await FileService.listDirectoriesRecursive(testDir);
      remainingDirs.should.be.an.Array().of.length(3);
      const remainingFiles = await FileService.listFilesRecursive(testDir);
      remainingFiles.should.be.an.Array().of.length(2);
      const newDirs = await FileService.listDirectoriesRecursive(targetDir);
      newDirs.should.be.an.Array().of.length(5);
      const newFiles = await FileService.listFilesRecursive(targetDir);
      newFiles.should.be.an.Array().of.length(3);
    });

    it('should organize with list of excludes regex strings', async () => {
      const testDir = `${srcDir}/regextest`;
      await FileService.createFile(`${testDir}/includes/01.mp4`);
      await FileService.createFile(`${testDir}/includes/02.png`);
      await FileService.createFile(`${testDir}/includes/excludes/04.jpg`);
      await FileService.createFile(`${testDir}/includes/03.png`);
      await FileService.createFile(`${testDir}/includes/shouldmatch/03.png`);

      const opts = {
        excludes: ['excludes', '03'],
      };
      const files = await FileClerk.organize(testDir, targetDir, opts);
      files.should.be.an.Array().of.length(2);
      const remainingDirs = await FileService.listDirectoriesRecursive(testDir);
      remainingDirs.should.be.an.Array().of.length(3);
      const remainingFiles = await FileService.listFilesRecursive(testDir);
      remainingFiles.should.be.an.Array().of.length(3);
      const newDirs = await FileService.listDirectoriesRecursive(targetDir);
      newDirs.should.be.an.Array().of.length(1);
      const newFiles = await FileService.listFilesRecursive(targetDir);
      newFiles.should.be.an.Array().of.length(2);
    });

    it('should organize with list of includes and excludes regex strings', async () => {
      const testDir = `${srcDir}/regextest`;
      await FileService.createFile(`${testDir}/includes/01.mp4`);
      await FileService.createFile(`${testDir}/includes/02.png`);
      await FileService.createFile(`${testDir}/includes/excludes/04.jpg`);
      await FileService.createFile(`${testDir}/other/includes/02.png`);
      await FileService.createFile(`${testDir}/other/includes/shouldmatch/02.png`);

      const opts = {
        extensions: ['png', 'jpg', 'mp4'],
        includes: ['^includes', 'shouldmatch'],
        excludes: ['excludes', '02'],
      };
      const files = await FileClerk.organize(testDir, targetDir, opts);
      files.should.be.an.Array().of.length(1);
      const remainingDirs = await FileService.listDirectoriesRecursive(testDir);
      remainingDirs.should.be.an.Array().of.length(5);
      const remainingFiles = await FileService.listFilesRecursive(testDir);
      remainingFiles.should.be.an.Array().of.length(4);
      const newDirs = await FileService.listDirectoriesRecursive(targetDir);
      newDirs.should.be.an.Array().of.length(1);
      const newFiles = await FileService.listFilesRecursive(targetDir);
      newFiles.should.be.an.Array().of.length(1);
    });

    it('should organize with list of includes and excludes RegExp objects', async () => {
      const testDir = `${srcDir}/regextest`;
      await FileService.createFile(`${testDir}/includes/01.mp4`);
      await FileService.createFile(`${testDir}/includes/02.png`);
      await FileService.createFile(`${testDir}/includes/excludes/04.jpg`);
      await FileService.createFile(`${testDir}/other/includes/02.png`);
      await FileService.createFile(`${testDir}/other/includes/shouldmatch/02.png`);

      const opts = {
        extensions: ['png', 'jpg', 'mp4'],
        includes: [new RegExp('^includes'), new RegExp('shouldmatch')],
        excludes: [new RegExp('excludes'), new RegExp('02')],
      };
      const files = await FileClerk.organize(testDir, targetDir, opts);
      files.should.be.an.Array().of.length(1);
      const remainingDirs = await FileService.listDirectoriesRecursive(testDir);
      remainingDirs.should.be.an.Array().of.length(5);
      const remainingFiles = await FileService.listFilesRecursive(testDir);
      remainingFiles.should.be.an.Array().of.length(4);
      const newDirs = await FileService.listDirectoriesRecursive(targetDir);
      newDirs.should.be.an.Array().of.length(1);
      const newFiles = await FileService.listFilesRecursive(targetDir);
      newFiles.should.be.an.Array().of.length(1);
    });

    it('should organize with a user-defined sourceFilter', async () => {
      const testDir = `${srcDir}/user-defined-filter`;
      await FileService.createFile(`${testDir}/includes/catchwithuserfilter.mp4`);
      await FileService.createFile(`${testDir}/includes/01.mp4`);
      await FileService.createFile(`${testDir}/includes/02.png`);
      await FileService.createFile(`${testDir}/includes/excludes/04.jpg`);
      await FileService.createFile(`${testDir}/other/includes/02.png`);
      await FileService.createFile(`${testDir}/other/includes/shouldmatch/02.png`);

      const opts = {
        extensions: ['png', 'jpg', 'mp4'],
        includes: [new RegExp('^includes'), new RegExp('shouldmatch')],
        excludes: [new RegExp('excludes'), new RegExp('02')],
        sourceFilter: ({ name }) => name !== 'catchwithuserfilter',
      };
      const files = await FileClerk.organize(testDir, targetDir, opts);
      files.should.be.an.Array().of.length(1);
      const remainingDirs = await FileService.listDirectoriesRecursive(testDir);
      remainingDirs.should.be.an.Array().of.length(5);
      const remainingFiles = await FileService.listFilesRecursive(testDir);
      remainingFiles.should.be.an.Array().of.length(5);
      const newDirs = await FileService.listDirectoriesRecursive(targetDir);
      newDirs.should.be.an.Array().of.length(1);
      const newFiles = await FileService.listFilesRecursive(targetDir);
      newFiles.should.be.an.Array().of.length(1);
    });

    it('should organize with multiple user-defined sourceFilters', async () => {
      const testDir = `${srcDir}/user-defined-filter`;
      await FileService.createFile(`${testDir}/includes/also-catch-with-user-filter.mp4`);
      await FileService.createFile(`${testDir}/includes/catchwithuserfilter.mp4`);
      await FileService.createFile(`${testDir}/includes/01.mp4`);
      await FileService.createFile(`${testDir}/includes/02.png`);
      await FileService.createFile(`${testDir}/includes/excludes/04.jpg`);
      await FileService.createFile(`${testDir}/other/includes/02.png`);
      await FileService.createFile(`${testDir}/other/includes/shouldmatch/02.png`);

      const opts = {
        extensions: ['png', 'jpg', 'mp4'],
        includes: [new RegExp('^includes'), new RegExp('shouldmatch')],
        excludes: [new RegExp('excludes'), new RegExp('02')],
        sourceFilter: [
          ({ name }) => name !== 'catchwithuserfilter',
          ({ name }) => name !== 'also-catch-with-user-filter',
        ],
      };
      const files = await FileClerk.organize(testDir, targetDir, opts);
      files.should.be.an.Array().of.length(1);
      const remainingDirs = await FileService.listDirectoriesRecursive(testDir);
      remainingDirs.should.be.an.Array().of.length(5);
      const remainingFiles = await FileService.listFilesRecursive(testDir);
      remainingFiles.should.be.an.Array().of.length(6);
      const newDirs = await FileService.listDirectoriesRecursive(targetDir);
      newDirs.should.be.an.Array().of.length(1);
      const newFiles = await FileService.listFilesRecursive(targetDir);
      newFiles.should.be.an.Array().of.length(1);
    });

    it('should simulate organize w/dry run param', async () => {
      await FileService.createDirectory(targetDir);
      const opts = {
        extensions: ['jpg', 'png'],
        dryRun: true,
      };

      const files = await FileClerk.organize(srcDir, targetDir, opts);
      files.should.be.an.Array().of.length(4);
      const remainingDirs = await FileService.listDirectoriesRecursive(srcDir);
      remainingDirs.should.be.an.Array().of.length(9);
      const remainingFiles = await FileService.listFilesRecursive(srcDir);
      remainingFiles.should.be.an.Array().of.length(10);
      const newFiles = await FileService.listFilesRecursive(targetDir);
      newFiles.should.be.an.Array().of.length(0);
    });
  });

  describe('organizeByDate', () => {
    const srcDir = `${home}/Pictures/INCOMING`;
    const targetDir = `${home}/PictureDestination`;

    beforeEach(async () => {
      await FileService.createFile(`${srcDir}/01.mp4`);
      await FileService.createFile(`${srcDir}/02.png`);
      await FileService.createFile(`${srcDir}/03/04.png`);
      await FileService.createFile(`${srcDir}/03/sub/another.mp4`);
      await FileService.createDirectory(`${srcDir}/03/sub/donotfind.dir`);
      await FileService.createFile(`${srcDir}/05/06/07.png`);
      await FileService.createFile(`${srcDir}/05/06/07.jpg`);
      await FileService.createFile(`${srcDir}/05/07/10.mp4`);
      await FileService.createDirectory(`${srcDir}/05/08/09`);
      await FileService.createFile(`${srcDir}/png/1.arf`);
      await FileService.createFile(`${srcDir}/png/2.arf`);
      await FileService.createFile(`${srcDir}/png/3.arf`);
    });
    afterEach(async () => {
      await FileService.deleteDirectory(srcDir);
      await FileService.deleteDirectory(targetDir);
    });

    it('should organize by creation date (no params)', async () => {
      const now = moment();
      const resultPathShouldContain = ['YYYY-MM-DD'].map(f => now.format(f)).join('/');

      const files = await FileClerk.organizeByDate(srcDir, targetDir);
      files.should.be.an.Array().of.length(10);
      const remainingDirs = await FileService.listDirectoriesRecursive(srcDir);
      remainingDirs.should.be.an.Array().of.length(3);
      const remainingFiles = await FileService.listFilesRecursive(srcDir);
      remainingFiles.should.be.an.Array().of.length(0);
      const newDirs = await FileService.listDirectoriesRecursive(targetDir);
      newDirs.should.be.an.Array().of.length(1);
      const newFiles = await FileService.listFilesRecursive(targetDir);
      newFiles.should.be.an.Array().of.length(10);
      newFiles.forEach(({ path, filename }) => {
        should((new RegExp(`^${targetDir}/${resultPathShouldContain}/${filename}$`)).test(path)).be.true();
      });
    });

    it('should organize by creation date (default format) w/extensions', async () => {
      const opts = {
        extensions: ['jpg', 'png'],
      };
      const now = moment();
      const resultPathShouldContain = ['YYYY-MM-DD'].map(f => now.format(f)).join('/');

      const files = await FileClerk.organizeByDate(srcDir, targetDir, opts);
      files.should.be.an.Array().of.length(4);
      const remainingDirs = await FileService.listDirectoriesRecursive(srcDir);
      remainingDirs.should.be.an.Array().of.length(8);
      const remainingFiles = await FileService.listFilesRecursive(srcDir);
      remainingFiles.should.be.an.Array().of.length(6);
      const newDirs = await FileService.listDirectoriesRecursive(targetDir);
      newDirs.should.be.an.Array().of.length(1);
      const newFiles = await FileService.listFilesRecursive(targetDir);
      newFiles.should.be.an.Array().of.length(4);
      newFiles.forEach(({ path, filename }) => {
        should((new RegExp(`^${targetDir}/${resultPathShouldContain}/${filename}$`)).test(path)).be.true();
      });
    });

    it('should organize by creation date (custom formats)', async () => {
      const opts = {
        extensions: ['jpg', 'png'],
        dateFormat: ['YYYY', 'YYYY-MM', 'YYYY-MM-DD'],
      };
      const now = moment();
      const resultPathShouldContain = opts.dateFormat.map(f => now.format(f)).join('/');

      const files = await FileClerk.organizeByDate(srcDir, targetDir, opts);
      files.should.be.an.Array().of.length(4);
      const remainingDirs = await FileService.listDirectoriesRecursive(srcDir);
      remainingDirs.should.be.an.Array().of.length(8);
      const remainingFiles = await FileService.listFilesRecursive(srcDir);
      remainingFiles.should.be.an.Array().of.length(6);
      const newDirs = await FileService.listDirectoriesRecursive(targetDir);
      newDirs.should.be.an.Array().of.length(3);
      const newFiles = await FileService.listFilesRecursive(targetDir);
      newFiles.should.be.an.Array().of.length(4);
      newFiles.forEach(({ path, filename }) => {
        should((new RegExp(`^${targetDir}/${resultPathShouldContain}/${filename}$`)).test(path)).be.true();
      });
    });

    it('should organize by creation date (default to use earliest of all File.stats dates)', async () => {
      const opts = {
        extensions: ['jpg', 'png'],
        dateFormat: ['YYYY-MM-DDTHH:mm:ss.SSSZ'],
      };
      const filename = 'mytest.jpg';
      const tsSourceDir = `${srcDir}/timestamp-src`;
      const tsTargetDir = `${srcDir}/timestamp-target`;
      const srcFile = `${tsSourceDir}/${filename}`;

      const startTime = moment().valueOf();
      await wait(10);

      await FileService.createFile(srcFile);

      await wait(10);

      const [{ target: middleTarget }] =
        await FileClerk.organizeByDate(tsSourceDir, tsTargetDir, opts);
      const { ctime: middleCtime } = await FileService.stat(middleTarget);
      const m1 = middleTarget.match(new RegExp(`([^/]*)/${filename}$`));
      const middleTargetDirTime = moment(m1[1]).valueOf();

      await wait(10);

      const [{ target: lastTarget }]
        = await FileClerk.organizeByDate(tsTargetDir, tsSourceDir, opts);
      const { ctime: latestCtime } = await FileService.stat(lastTarget);
      const m2 = lastTarget.match(new RegExp(`([^/]*)/${filename}$`));

      const latestTargetDirTime = moment(m2[1]).valueOf();
      const middleCTime = moment(middleCtime).valueOf();
      const latestCTime = moment(latestCtime).valueOf();

      latestTargetDirTime.should.be.eql(middleTargetDirTime);
      latestTargetDirTime.should.be.lessThan(latestCTime);
      latestTargetDirTime.should.be.lessThan(middleCTime);
      latestTargetDirTime.should.be.greaterThan(startTime);
    });

    it('should organize by creation date (client-defined timezone)', async () => {
      const tzStr = 'Antarctica/South_Pole';
      const timezone = moment.tz(tzStr).format('Z');
      const opts = {
        extensions: ['jpg', 'png'],
        dateFormat: ['Z'],
        timeZone: tzStr,
      };
      const filename = 'mytest.jpg';
      const tsSourceDir = `${srcDir}/timestamp-src`;
      const tsTargetDir = `${srcDir}/timestamp-target`;
      const srcFile = `${tsSourceDir}/${filename}`;

      await FileService.createFile(srcFile);
      const [{ target }] = await FileClerk.organizeByDate(tsSourceDir, tsTargetDir, opts);
      const tzMatch = target.match(new RegExp(`([^/]*)/${filename}$`));
      tzMatch[1].should.be.a.String().eql(timezone);
    });

    it('should organize by creation date (client-defined date property)', async () => {
      const opts = {
        extensions: ['jpg', 'png'],
        dateFormat: ['YYYY-MM-DDTHH:mm:ss.SSSZ'],
        dateProperty: 'ctime',
      };
      const filename = 'mytest.jpg';
      const tsSourceDir = `${srcDir}/timestamp-src`;
      const tsTargetDir = `${srcDir}/timestamp-target`;
      const srcFile = `${tsSourceDir}/${filename}`;

      const startTime = moment().valueOf();
      await wait(10);

      await FileService.createFile(srcFile);

      await wait(10);

      const [{ target: middleTarget }] =
        await FileClerk.organizeByDate(tsSourceDir, tsTargetDir, opts);
      const { ctime: middleCtime } = await FileService.stat(middleTarget);
      const m1 = middleTarget.match(new RegExp(`([^/]*)/${filename}$`));
      const middleTargetDirTime = moment(m1[1]).valueOf();

      await wait(10);

      const [{ target: lastTarget }]
        = await FileClerk.organizeByDate(tsTargetDir, tsSourceDir, opts);
      const { ctime: latestCtime } = await FileService.stat(lastTarget);
      const m2 = lastTarget.match(new RegExp(`([^/]*)/${filename}$`));

      const latestTargetDirTime = moment(m2[1]).valueOf();
      const middleCTime = moment(middleCtime).valueOf();
      const latestCTime = moment(latestCtime).valueOf();

      latestTargetDirTime.should.be.greaterThan(middleTargetDirTime);
      latestTargetDirTime.should.be.lessThan(latestCTime);
      latestTargetDirTime.should.be.eql(middleCTime);
      latestTargetDirTime.should.be.greaterThan(startTime);
    });
  });

  describe('organizeByExtension', () => {
    const srcDir = `${home}/Pictures/INCOMING`;
    const targetDir = `${home}/PictureDestination`;

    beforeEach(async () => {
      await FileService.createFile(`${srcDir}/01.mp4`);
      await FileService.createFile(`${srcDir}/02.png`);
      await FileService.createFile(`${srcDir}/03/04.png`);
      await FileService.createFile(`${srcDir}/03/sub/another.mp4`);
      await FileService.createDirectory(`${srcDir}/03/sub/donotfind.dir`);
      await FileService.createFile(`${srcDir}/05/06/a.rose.by.any.other.name`);
      await FileService.createFile(`${srcDir}/05/06/no_extension`);
      await FileService.createFile(`${srcDir}/05/06/07.PNG`);
      await FileService.createFile(`${srcDir}/05/06/07.jpg`);
      await FileService.createFile(`${srcDir}/05/07/10.MP4`);
      await FileService.createDirectory(`${srcDir}/05/08/09`);
      await FileService.createFile(`${srcDir}/png/1`);
      await FileService.createFile(`${srcDir}/png/1.arf`);
      await FileService.createFile(`${srcDir}/png/2.arf`);
      await FileService.createFile(`${srcDir}/png/3.arf`);
    });
    afterEach(async () => {
      await FileService.deleteDirectory(srcDir);
      await FileService.deleteDirectory(targetDir);
    });

    it('should organize by file extension (no params)', async () => {
      const files = await FileClerk.organizeByExtension(srcDir, targetDir);
      files.should.be.an.Array().of.length(13);
      const remainingDirs = await FileService.listDirectoriesRecursive(srcDir);
      remainingDirs.should.be.an.Array().of.length(3);
      const remainingFiles = await FileService.listFilesRecursive(srcDir);
      remainingFiles.should.be.an.Array().of.length(0);
      const newDirs = await FileService.listDirectoriesRecursive(targetDir);
      newDirs.should.be.an.Array().of.length(6);
      const newFiles = await FileService.listFilesRecursive(targetDir);
      newFiles.should.be.an.Array().of.length(13);
    });

    it('should organize by file extension, and filter on extensions irrespective of leading dot (.)', async () => {
      const opts = {
        extensions: ['JPG', '.png', ''],
      };
      const files = await FileClerk.organizeByExtension(srcDir, targetDir, opts);
      files.should.be.an.Array().of.length(6);
      const remainingDirs = await FileService.listDirectoriesRecursive(srcDir);
      remainingDirs.should.be.an.Array().of.length(9);
      const remainingFiles = await FileService.listFilesRecursive(srcDir);
      remainingFiles.should.be.an.Array().of.length(7);
      const newDirs = await FileService.listDirectoriesRecursive(targetDir);
      newDirs.should.be.an.Array().of.length(3);
      const newFiles = await FileService.listFilesRecursive(targetDir);
      newFiles.should.be.an.Array().of.length(6);
    });
  });

  describe('organizeByAlphabetical', () => {
    const srcDir = `${home}/Pictures/INCOMING`;
    const targetDir = `${home}/PictureDestination`;

    beforeEach(async () => {
      await FileService.createFile(`${srcDir}/1.mp4`);
      await FileService.createFile(`${srcDir}/02.png`);
      await FileService.createFile(`${srcDir}/03/~&.png`);
      await FileService.createFile(`${srcDir}/03/sub/another.mp4`);
      await FileService.createDirectory(`${srcDir}/03/sub/donotfind.dir`);
      await FileService.createFile(`${srcDir}/05/06/a.png`);
      await FileService.createFile(`${srcDir}/05/06/!#b.jpg`);
      await FileService.createFile(`${srcDir}/05/07/10.mp4`);
      await FileService.createDirectory(`${srcDir}/05/08/09`);
      await FileService.createFile(`${srcDir}/png/1.arf`);
      await FileService.createFile(`${srcDir}/png/2.arf`);
      await FileService.createFile(`${srcDir}/png/3.arf`);
    });
    afterEach(async () => {
      await FileService.deleteDirectory(srcDir);
      await FileService.deleteDirectory(targetDir);
    });

    it('should organize by alphabetical (no params)', async () => {
      const files = await FileClerk.organizeByAlphabetical(srcDir, targetDir);
      files.should.be.an.Array().of.length(10);
      const remainingDirs = await FileService.listDirectoriesRecursive(srcDir);
      remainingDirs.should.be.an.Array().of.length(3);
      const remainingFiles = await FileService.listFilesRecursive(srcDir);
      remainingFiles.should.be.an.Array().of.length(0);
      const newDirs = await FileService.listDirectoriesRecursive(targetDir);
      newDirs.should.be.an.Array().of.length(6);
      const newFiles = await FileService.listFilesRecursive(targetDir);
      newFiles.should.be.an.Array().of.length(10);
    });

    it('should organize by alphabetical (w/Extension filters)', async () => {
      const opts = {
        extensions: ['jpg', 'png', 'mp4'],
      };
      const files = await FileClerk.organizeByAlphabetical(srcDir, targetDir, opts);
      files.should.be.an.Array().of.length(7);
      const remainingDirs = await FileService.listDirectoriesRecursive(srcDir);
      remainingDirs.should.be.an.Array().of.length(4);
      const remainingFiles = await FileService.listFilesRecursive(srcDir);
      remainingFiles.should.be.an.Array().of.length(3);
      const newDirs = await FileService.listDirectoriesRecursive(targetDir);
      newDirs.should.be.an.Array().of.length(4);
      const newFiles = await FileService.listFilesRecursive(targetDir);
      newFiles.should.be.an.Array().of.length(7);
    });

    it('should organize by alphabetical w/Custom Symbol and Case', async () => {
      const opts = {
        extensions: ['jpg', 'png', 'mp4'],
        upperCase: true,
        symbolDir: '#',
      };
      const files = await FileClerk.organizeByAlphabetical(srcDir, targetDir, opts);
      files.should.be.an.Array().of.length(7);
      const remainingDirs = await FileService.listDirectoriesRecursive(srcDir);
      remainingDirs.should.be.an.Array().of.length(4);
      const remainingFiles = await FileService.listFilesRecursive(srcDir);
      remainingFiles.should.be.an.Array().of.length(3);
      const newDirs = await FileService.listDirectoriesRecursive(targetDir);
      newDirs.should.be.an.Array().of.length(5);
      const newFiles = await FileService.listFilesRecursive(targetDir);
      newFiles.should.be.an.Array().of.length(7);
    });
  });
});
