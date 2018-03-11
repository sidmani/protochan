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

const ErrorType = require('../../error.js');
const HashMap = require('../../hash/hashMap.js');
const Difficulty = require('../../hash/difficulty.js');

module.exports = class BlockNode {
  constructor(header, parser, nodeMap, config) {
    this.header = header;
    this.data = parser;
    this.nodeMap = nodeMap;
    this.config = config;

    if (this.data.hash !== header.dataHash) {
      throw ErrorType.dataHash();
    }

    this.hash = header.hash;
    this.children = new HashMap();
  }

  checkPostDifficulty(post) {
    // get the time difference
    const deltaT = post.timestamp() - this.timestamp();

    // if new block is older than the previous block, error
    if (deltaT <= 0) throw ErrorType.timeTravel();

    // get required difficulty
    const reqDiff = Difficulty.requiredPostDifficulty(
      deltaT,
      this.config,
    );

    // if new block doesn't have the required difficulty, error
    if (post.header.difficulty < reqDiff) {
      throw ErrorType.insufficientDifficulty();
    }
  }

  checkThreadDifficulty(thread, numPosts) {
    // get the time difference
    const deltaT = thread.timestamp() - this.timestamp();

    // if new block is older than the previous block, error
    if (deltaT <= 0) throw ErrorType.timeTravel();

    // get required difficulty
    const reqDiff = Difficulty.requiredThreadDifficulty(
      deltaT,
      numPosts,
      this.config,
    );

    // if new block doesn't have the required difficulty, error
    if (thread.header.difficulty < reqDiff) {
      throw ErrorType.insufficientDifficulty();
    }
  }

  addChild(node) {
    this.nodeMap.setStringified(node, node.hash); // set first to check duplication
    this.children.setStringified(true, node.hash);
  }

  // convenience
  type() {
    return this.header.type();
  }

  timestamp() {
    return this.header.timestamp();
  }
};
