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

const BlockType = require('../../block/type.js');
const ErrorType = require('../../error.js');
const BlockNode = require('./blockNode.js');
const Difficulty = require('../../hash/difficulty.js');
const Config = require('../../board/config.js');

module.exports = class GenesisNode extends BlockNode {
  constructor(header, data) {
    super(header, data);
    this.config = new Config(data);
  }

  addChild(node) {
    this.checkPrevHash(node);

    switch (node.type()) {
      case BlockType.THREAD: {
        this.checkThread(node);
        node.setHeight(1);
        // in order to guarantee that the tree is never
        // invalid and has no side effects, this insertion
        // must be after checkChildThread() returns
        // TODO: make this not repeat the get operation
        const op = this.children.get(node.data.getThread(0));
        op.children.set(node);
        break;
      }
      case BlockType.ORIGINAL_POST: {
        this.checkOriginalPost(node);
        break;
      }
      default: throw ErrorType.Chain.illegalType();
    }

    super.addChild(node);
  }

  checkThread(thread) {
    // the first thread block must contain exactly 1 record
    if (thread.data.numRecords !== 1) {
      throw ErrorType.Chain.unknownThread();
    }

    // check difficulty of thread hash
    Difficulty.verifyThreads(this, thread, this.config, 0);

    // check that the thread's original post hash points to
    // a valid child of this node
    const op = this.children.get(thread.data.getThread(0));
    if (!op || op.type() !== BlockType.ORIGINAL_POST) {
      throw ErrorType.Chain.missingReference();
    }

    op.checkThread(thread);
  }

  checkOriginalPost(op) {
    this.checkPostDifficulty(op);
  }
};
