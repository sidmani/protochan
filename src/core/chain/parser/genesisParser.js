// This file is a part of the protochan project.
// https://github.com/sidmani/protochan
// https://www.sidmani.com/?postid=3

// Copyright (c) 2018 Sid Mani
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

'use strict';

const DataParser = require('./parser.js');
const ErrorType = require('../../error.js');
const Hash = require('../../hash/blake2s.js');

module.exports = class GenesisDataParser extends DataParser {
  constructor(data, offset = 0) {
    super(data, offset);
    // 1 byte control length, 5b genesis options
    if (this.controlLength < 6) throw ErrorType.controlLength();

    // instead of min/max, use min + range so no illegal values
    this.minPostDifficulty = this.data[offset + 1];
    this.maxPostDifficulty = this.minPostDifficulty + this.data[offset + 2];
    this.minThreadDifficulty = this.data[offset + 3];
    this.maxThreadDifficulty = this.minThreadDifficulty + this.data[offset + 4];

    this.maxThreads = this.data[offset + 5] + 1; // 1 to 256 max threads
    // to extend the protocol with board options, store additional
    // bytes in the post block's data and parse them here

    this.hash = Hash.digest(this.data);
  }
};
