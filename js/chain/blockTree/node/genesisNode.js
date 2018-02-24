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
const Config = require('../../../board/config.js');
const ThreadNode = require('./threadNode.js');
const OriginalPostNode = require('./originalPostNode.js');

module.exports = class GenesisNode extends BlockNode {
  constructor(header, data) {
    super(header, data, new Config(data));
  }

  addChild(header, data) {
    if (!Util.arrayEquality(
      header.prevHash(),
      this.hash,
    )) {
      throw ErrorType.Chain.hashMismatch();
    }

    switch (header.blockType()) {
      case BlockType.THREAD: {
        const node = new ThreadNode(header, data, this.config);
        this.insertChildThread(node);
        break;
      }
      case BlockType.ORIGINAL_POST: {
        const node = new OriginalPostNode(header, data, this.config);
        this.insertChildOriginalPost(node);
        break;
      }
      default: throw ErrorType.Chain.illegalType();
    }
  }

  insertChildThread(thread) {
    if (thread.data.numRecords !== 1) {
      throw ErrorType.Chain.unknownThread();
    }

    // check difficulty of thread hash
    const deltaT = thread.timestamp() - this.timestamp();
    if (deltaT <= 0) throw ErrorType.Chain.timeTravel();

    const reqDiff = Difficulty.requiredThreadDifficulty(
      deltaT,
      0,
      this.config,
    );

    if (thread.header.difficulty < reqDiff) {
      throw ErrorType.Difficulty.insufficient();
    }

    // check that the thread's original post hash points to
    // a valid child of this node
    const op = this.children.get(thread.data.getThread(0));
    if (!op || op.type() !== BlockType.ORIGINAL_POST) {
      throw ErrorType.Chain.missingReference();
    }

    op.checkChildThread(thread);
    op.rawInsertChildThread(thread);

    this.children.set(thread);
  }

  insertChildOriginalPost(op) {
    // get the time difference
    const deltaT = op.timestamp() - this.timestamp();

    // if new block is older than the previous block, error
    if (deltaT <= 0) throw ErrorType.Chain.timeTravel();

    // get required difficulty
    const reqDiff = Difficulty.requiredPostDifficulty(
      deltaT,
      this.config,
    );

    // if new block doesn't have the required difficulty, error
    if (op.header.difficulty < reqDiff) {
      throw ErrorType.Difficulty.insufficient();
    }

    this.children.set(op);
  }
};
