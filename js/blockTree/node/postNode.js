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

module.exports = class PostNode extends BlockNode {
  setSegmentHeight(height) {
    this.segmentHeight = height;
  }

  setHeight(height) {
    this.height = height;
  }

  setThread(thread) {
    this.thread = thread;
  }

  addChild(node) {
    switch (node.type()) {
      case BlockType.POST: {
        this.checkPost(node);
        node.setSegmentHeight(this.segmentHeight + 1);
        node.setHeight(this.height + 1);
        node.setThread(this.thread);
        break;
      }
      case BlockType.THREAD: {
        this.checkThread(node);
        break;
      }
      default: throw ErrorType.Chain.illegalType();
    }

    super.addChild(node);
  }

  checkPost(post) {
    this.checkPrevHash(post);

    // verify difficulty and timestamps
    this.checkPostDifficulty(post);
  }

  checkThread(thread) {
    // TODO: do we need to check hash here?
    if (this.timestamp() >= thread.timestamp()) {
      throw ErrorType.Chain.timeTravel();
    }
  }
};
