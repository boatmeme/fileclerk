# ಠ‿ಠ fileclerk
A node.js library for file and folder collation. Sort. Separate. Organize.

[![npm version](https://badge.fury.io/js/fileclerk.svg)](https://badge.fury.io/js/fileclerk)
[![Build Status](https://travis-ci.org/growombud/fileclerk.svg?branch=master)](https://travis-ci.org/growombud/fileclerk)
[![codecov](https://codecov.io/gh/growombud/fileclerk/branch/master/graph/badge.svg)](https://codecov.io/gh/growombud/fileclerk)

## Overview

Fileclerk arose from a personal need to organize media files from disparate sources into a common location while maintaining a consistent folder structure.

More specifically, my family has media being synchronized, backed-up, copied from many different devices to wildly differing folder structures on a centralized NAS device. I wanted to get those sorted by file-type and by date.

I originally began writing it as a simple script that would run from a Docker container, but quickly realized the value of abstracting it out into a more general library. And here we are...

---
## Requirements

Currently only works for >= Node.js v8

## Install

```
npm install fileclerk
```

## Usage

```javascript
const FileClerk = require('fileclerk');
```
# API

## organize (sourcePath, targetPath [, options])
Returns a promise that resolves with a list of files that were moved / copied during the process.

##### Use Case
Pull files out of a recursive directory structure - starting at the ```sourcePath``` - and move or copy them to a different directory structure starting at the ```targetPath```.

##### Example

1. Files of many different types in an arbitrary-depth directory structure under a ```/INCOMING``` folder.
2. Want to pull out all of the image files, move them to a new directory, and organize them by year, month, and full date (based on created date of source file).
3. If any of the source directories below the ```sourcePath``` are empty after the operation, go ahead and delete those.

```
const options = {
  recursive: true,
  cleanDirs: true,
  extensions: ['jpg', 'png', 'tiff', 'gif'],
  collateFn: (file) => {
    const date = new Date(file.ctime);
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    // Return the path relative to targetPath
    return `${year}/${month}/${year}-${month}-${day}/${file.filename}`;
  }
}

const results = await FileClerk.organize(
  '/INCOMING',
  '/Pictures',
  options,
);
```

## organizeByDate (sourcePath, targetPath[, options])
Helper for organizing easily by date
TODO: Document

## organizeByExtension (sourcePath, targetPath[, options])
Helper for organizing easily by file extension

TODO: Document

## organizeByAlphabetical (sourcePath, targetPath[, options])
Helper for organizing easily by alphabetical order
TODO: Document

---

## TODO

- Documentation.
- Transpile to support earlier Node.js versions
- Handle paths in a cross-platform way. Not sure how this library behaves on Windows devices, for instance.
- General resiliency improvements for edge-cases and non-happy paths

## Contributing

1. Fork repo
2. Add / modify tests
3. Add / modify implementation
4. Open PR

## License

MIT License

Copyright (c) 2018 Jonathan Griggs

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
