const should = require('should');
const FileService = require('../../lib/services/FileService');

describe('FileService', () => {
  const home = './test/fixtures';

  before(async () => {
    await FileService.createDirectory(home);
  });
  after(async () => {
    await FileService.deleteDirectory(home);
  });

  describe('stat', () => {
    const localDir = `${home}/listdirs`;
    before(async () => {
      await FileService.createFile(`${localDir}/01.mp4`);
      await FileService.createFile(`${localDir}/02.png`);
      await FileService.createDirectory(`${localDir}/03`);
    });
    after(async () => {
      await FileService.deleteDirectory(`${localDir}`);
    });

    it('should stat a directory at a specified path', async () => {
      const stat = await FileService.stat(localDir);
      stat.should.be.an.Object();
      stat.should.have.property('path').is.a.String().eql(localDir);
      stat.should.have.property('isDirectory').is.a.Boolean().is.true();
    });

    it('should stat a file at a specified path', async () => {
      const path = `${localDir}/02.png`;
      const stat = await FileService.stat(path);
      stat.should.be.an.Object();
      stat.should.have.property('path').is.a.String().eql(path);
      stat.should.have.property('isDirectory').is.a.Boolean().is.false();
    });

    it('should return null for a non-existent path', async () => {
      const path = `${localDir}/dir-${Date.now()}`;
      const stat = await FileService.stat(path);
      should(stat).be.Null();
    });
  });

  describe('listDirectories', () => {
    const localDir = `${home}/listdirs`;
    before(async () => {
      await FileService.createFile(`${localDir}/01.mp4`);
      await FileService.createFile(`${localDir}/02.png`);
      await FileService.createDirectory(`${localDir}/03`);
    });
    after(async () => {
      await FileService.deleteDirectory(`${localDir}`);
    });
    it('should list directories at specified path', async () => {
      const dirs = await FileService.listDirectories(localDir);
      dirs.should.be.an.Array().of.length(1);
    });
  });

  describe('createDirectory', () => {
    const localDir = `${home}/createdirs`;
    before(async () => {
      await FileService.createFile(`${localDir}/01.mp4`);
      await FileService.createFile(`${localDir}/02.png`);
    });
    after(async () => {
      await FileService.deleteDirectory(`${localDir}`);
    });
    it('should create a new directory at the specified path', async () => {
      const dirArr = [`${localDir}/create/2018-01-01`, `${localDir}/create/2018-01-02`, `${localDir}/create/2018-01-03`];
      await Promise.all(dirArr.map(d => FileService.createDirectory(d)));
      const dirs = await FileService.listDirectories(`${localDir}/create`);
      dirs.should.be.an.Array().of.length(3);
    });
  });

  describe('listFilesAndDirectories', () => {
    const localDir = `${home}/listfiles`;
    before(async () => {
      await FileService.createFile(`${localDir}/01.mp4`);
      await FileService.createFile(`${localDir}/02.png`);
      await FileService.createFile(`${localDir}/03/04.png`);
      await FileService.createFile(`${localDir}/05/06/07.png`);
    });
    after(async () => {
      await FileService.deleteDirectory(`${localDir}`);
    });
    it('should list files and Directories at the specified path (recursive)', async () => {
      const files = await FileService.listFilesAndDirectories(`${localDir}`);
      files.should.be.an.Array().of.length(4);
    });

    it('should list files and Directories at the specified path (recursive)', async () => {
      const files = await FileService.listFilesAndDirectories(`${localDir}`, { recursive: true });
      files.should.be.an.Array().of.length(7);
    });

    it('should throw an error if passed a file', async () => {
      const path = `${localDir}/01.mp4`;
      try {
        await FileService.listFilesAndDirectories(path);
        should(false).be.true();
      } catch (err) {
        err.should.be.Error();
        err.should.have.property('message').is.a.String().eql(`${path} is not a directory`);
      }
    });
  });

  describe('listFiles', () => {
    const localDir = `${home}/listfiles`;
    before(async () => {
      await FileService.createFile(`${localDir}/01.mp4`);
      await FileService.createFile(`${localDir}/02.png`);
      await FileService.createFile(`${localDir}/03/04.png`);
      await FileService.createFile(`${localDir}/05/06/07.png`);
    });
    after(async () => {
      await FileService.deleteDirectory(`${localDir}`);
    });
    it('should list files at the specified path', async () => {
      const files = await FileService.listFiles(`${localDir}`);
      files.should.be.an.Array().of.length(2);
    });
  });

  describe('listFilesRecursive', () => {
    const localDir = `${home}/recursive`;

    before(async () => {
      await FileService.createFile(`${localDir}/01.mp4`);
      await FileService.createFile(`${localDir}/02.png`);
      await FileService.createFile(`${localDir}/03/04.png`);
      await FileService.createFile(`${localDir}/05/06/07.png`);
      await FileService.createDirectory(`${localDir}/05/08/09`);
    });
    after(async () => {
      await FileService.deleteDirectory(`${localDir}`);
    });
    it('should list all files in an entire directory structure', async () => {
      const files = await FileService.listFilesRecursive(localDir);
      files.should.be.an.Array().of.length(4);
    });
  });

  describe('move', () => {
    const localDir = `${home}/move/src`;
    const targetDir = `${home}/move/target`;
    beforeEach(async () => {
      await FileService.createFile(`${localDir}/01.mp4`);
      await FileService.createFile(`${localDir}/02.png`);
      await FileService.createFile(`${localDir}/03/03.png`);
    });
    afterEach(async () => {
      await FileService.deleteDirectory(`${localDir}`);
      await FileService.deleteDirectory(`${targetDir}`);
    });
    it('should move files or paths from the source path to the target path', async () => {
      let files = await FileService.listFilesAndDirectories(localDir);
      files.should.be.an.Array().of.length(3);
      await Promise.all(files.map(({ filename, path }) => {
        const target = `${targetDir}/${filename}`;
        return FileService.move(path, target);
      }));
      files = await FileService.listFilesAndDirectories(localDir);
      files.should.be.an.Array().of.length(0);
      files = await FileService.listFilesAndDirectories(targetDir);
      files.should.be.an.Array().of.length(3);
    });

    it('should not overwrite by default', async () => {
      await FileService.createFile(`${targetDir}/02.png`);

      let files = await FileService.listFilesAndDirectories(localDir);
      files.should.be.an.Array().of.length(3);
      await Promise.all(files.map(async ({ filename, path }) => {
        const target = `${targetDir}/${filename}`;
        try {
          await FileService.move(path, target);
        } catch (err) {
          err.should.be.ok();
        }
      }));
      files = await FileService.listFilesAndDirectories(localDir);
      files.should.be.an.Array().of.length(1);
      files = await FileService.listFilesAndDirectories(targetDir);
      files.should.be.an.Array().of.length(3);
    });
  });
});
