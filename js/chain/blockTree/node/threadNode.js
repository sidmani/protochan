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

const BlockType = require('../../../block/type.js');
const Util = require('../../../util/util.js');
const ErrorType = require('../../../error.js');
const BlockNode = require('./blockNode.js');
const Difficulty = require('../../../hash/difficulty.js');
const PostNode = require('./postNode.js');

module.exports = class ThreadNode extends BlockNode {
  addChild(header, data) {
    if (!Util.arrayEquality(
      header.prevHash(),
      this.hash,
    )) {
      throw ErrorType.Chain.hashMismatch();
    }

    switch (header.blockType()) {
      case BlockType.POST: {
        const node = new PostNode(header, data, this.config, 1);
        this.insertChildPost(node);
        break;
      }
      case BlockType.THREAD: {
        const node = new ThreadNode(header, data, this.config);
        this.insertChildThread(node);
        break;
      }
      default: throw ErrorType.Chain.illegalType();
    }
  }

  insertChildPost(post) {
    // check difficulty
    // should this be w.r.t. previous post or this thread?
    const deltaT = post.timestamp() - this.timestamp();
    if (deltaT <= 0) throw ErrorType.Chain.timeTravel();

    const reqDiff = Difficulty.requiredPostDifficulty(
      deltaT,
      this.config,
    );

    if (post.header.difficulty < reqDiff) {
      throw ErrorType.Difficulty.insufficient();
    }

    // check that post reserved byte points to valid index
    if (post.header.reserved() >= this.numRecords) {
      throw ErrorType.Chain.unknownThread();
    }

    this.children.set(post);
  }

  insertChildThread(thread) {
    // count # of posts since last thread block
    // count # of
    // check difficulty

  }
};
