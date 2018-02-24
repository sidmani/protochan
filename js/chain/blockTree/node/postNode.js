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
const ThreadNode = require('./threadNode.js');

module.exports = class PostNode extends BlockNode {
  constructor(header, data, config, segmentHeight) {
    super(header, data, config);
    this.segmentHeight = segmentHeight;
  }

  addChild(header, data) {
    switch (header.blockType()) {
      case BlockType.POST: {
        const node = new PostNode(
          header,
          data,
          this.config,
          this.segmentHeight + 1,
        );
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
    if (!Util.arrayEquality(
      post.header.prevHash(),
      this.hash,
    )) {
      throw ErrorType.Chain.hashMismatch();
    }
    // get the time difference
    const deltaT = post.timestamp() - this.timestamp();

    // if new block is older than the previous block, error
    if (deltaT <= 0) throw ErrorType.Chain.timeTravel();

    // get required difficulty
    // TODO: pass config through
    const reqDiff = Difficulty.requiredPostDifficulty(
      deltaT,
      this.config,
    );

    // if new block doesn't have the required difficulty, error
    if (post.header.difficulty < reqDiff) {
      throw ErrorType.Difficulty.insufficient();
    }

    this.children.set(post);
  }

  insertChildThread(thread) {
    this.checkChildThread(thread);
    this.rawInsertChildThread(thread);
  }

  checkChildThread(thread) {
    // TODO: do we need to check hash here?
    if (this.timestamp() >= thread.timestamp()) {
      throw ErrorType.Chain.timeTravel();
    }
  }

  rawInsertChildThread(thread) {
    this.children.set(thread);
  }
};
