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
const HashMap = require('../../hash/hashMap.js');

module.exports = class ThreadNode extends BlockNode {
  constructor(header, data) {
    super(header, data);
    this.threadHeights = new HashMap();
  }

  setThreadHeight(hash, height) {
    this.threadHeights.setRaw(hash, height);
  }

  setHeight(height) {
    this.height = height;
  }

  static maxScore() {
    return 2;
  }

  score(currentThreadHeight) {
    const depth = currentThreadHeight - this.threadHeight;
    return (this.unconfirmedPosts / (this.height + 1)) - (depth / this.config.MAX_THREAD_COUNT);
  }

  addChild(node) {
    this.checkPrevHash(node);

    switch (node.type()) {
      case BlockType.POST: {
        this.checkPost(node);
        const index = node.header.reserved();
        const hash = index === 0 ? this.hash : this.data.getThread(index);
        node.setThread(hash);
        node.setSegmentHeight(1);
        break;
      }
      case BlockType.THREAD:
        this.checkThread(node);
        node.setHeight(this.height + 1);
        break;
      default: throw ErrorType.Chain.illegalType();
    }

    super.addChild(node);
  }

  checkPost(post) {
    // check difficulty

    // should this be w.r.t. previous post or this thread?
    this.checkPostDifficulty(post);

    // check that post reserved byte points to valid index
    if (post.header.reserved() >= this.data.numRecords) {
      throw ErrorType.Chain.unknownThread();
    }
  }

  checkThread(thread) {
    // old - new = removed records
    const removedThreads = this.data.subtractRecords(thread.data);
    // removedThreads must contain exactly 1 or 0 elements
    // depending on whether the thread limit has been reached
    const expectedRemovalCount = this.height < this.config.MAX_THREAD_COUNT ? 0 : 1;

    if (removedThreads.length !== expectedRemovalCount) {
      throw ErrorType.Chain.missingThread();
    }

    // new - old = added records
    const addedThreads = thread.data.subtractRecords(this.data);

    // since new thread has zero hash, it's subtracted out
    // the only added thread is the second-newest thread
    if (addedThreads !== 1) {
      throw ErrorType.Chain.unknownThread();
    }

    let numPosts = 0;
    // count # of posts since last thread block
    for (let i = 1; i < thread.data.numRecords; i += 1) {
      // get thread hash at index i from new block
      const threadRecord = thread.data.getThread(i);
      // get post hash at index i from new block
      const postRecord = thread.data.getPost(i);
      // check that score is decreasing

      // check that post i is in indicated thread
    }
    // check difficulty
  }
};
