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

"use strict";

var Post = require('./post.js');
var Difficulty = require('../hash/difficulty.js');
var ErrorType = require('../error.js');

module.exports = class GenesisPost extends Post {
  constructor(header, data) {
    super(header, data);

    // Assert that prevHash has maximum difficulty
    Difficulty.verify(header.prevHash(), 256);

    // 1 byte control length, 2b content length, 5b genesis options
    if (this.controlLength < 8) throw ErrorType.Data.controlLength();

    // set instance fields
    this.minPostDifficulty = data[3];
    this.maxPostDifficulty = data[4];
    this.minThreadDifficulty = data[5];
    this.maxThreadDifficulty = data[6];
    this.maxThreads = data[7];
    // to extend the protocol with options, store additional
    // bytes in the post block's data and parse them here

    // max >= min difficulty
    if (this.maxPostDifficulty < this.minPostDifficulty) throw ErrorType.Block.illegalControlValues();
    if (this.maxThreadDifficulty < this.minThreadDifficulty) throw ErrorType.Block.illegalControlValues();

    // nonzero max threads
    if (this.maxThreads === 0) throw ErrorType.Block.illegalControlValues();
  }
}
