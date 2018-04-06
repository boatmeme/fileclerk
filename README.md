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
## Install

```
npm install fileclerk
```

## Usage

```javascript
const fc = require('fileclerk');
```
# API

## sequence ( fnArray [, starting_results] )
Returns a promise that resolves after all functions have been called sequentially

##### Use Case
Resolving a sequential chain of *heterogeneous* asynchronous operations.

Useful where different operations need to be performed on the same data, but order is critical and asynchronous calls should be limited to a concurrency of 1.

##### Example

1. Persist to a Primary DB
2. If successful, denormalize to a Secondary DB
3. If successful, broadcast a message

```
const someData = { anyProperty: 'Rando' };

Prolly.sequence( [ () => saveData( someData ),
  () => denormalizeData( someData ),
  () => broadcastMessage( someData ) ] );
```

---

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
