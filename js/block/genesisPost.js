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
var Util = require('../util.js');

module.exports = class GenesisPost extends Post {
  constructor(header, data) {
    super(header, data);
    // Assert that prevHash has maximum difficulty
    Difficulty.verify(header.prevHash(), 256);

    // 1 byte control length
    // 2 bytes content length
    // 5 bytes genesis options
    Util.assert(this.controlLength() >= 8);

    // max >= min difficulty
    Util.assert(this.maxPostDifficulty() >= this.minPostDifficulty());
    Util.assert(this.maxThreadDifficulty() >= this.minThreadDifficulty());

    // nonzero max threads
    Util.assert(this.maxThreads() > 0);
  }

  // the data contains the configuration for the board
  // MIN_POST_DIFFICULTY: uint8,
  // MAX_POST_DIFFICULTY: uint8,
  // MIN_THREAD_DIFFICULTY: uint8,
  // MAX_THREAD_DIFFICULTY: uint8,
  // MAX_THREAD_COUNT
  minPostDifficulty() {
    return this.data[3];
  }

  maxPostDifficulty() {
    return this.data[4];
  }

  minThreadDifficulty() {
    return this.data[5];
  }

  maxThreadDifficulty() {
    return this.data[6];
  }

  maxThreads() {
    return this.data[7];
  }

  // to extend the protocol with options, store additional
  // bytes in the post block's data and parse them with
  // additional functions here
}
