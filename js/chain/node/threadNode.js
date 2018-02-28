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

const BlockType = require('../../header/type.js');
const ErrorType = require('../../error.js');
const BlockNode = require('./blockNode.js');
const HashMap = require('../../hash/hashMap.js');
const Util = require('../../util/util.js');
const Parser = require('../../parser/threadParser.js');

module.exports = class ThreadNode extends BlockNode {
  constructor(header, data, nodeMap, config) {
    const parser = new Parser(data);
    super(header, parser, nodeMap, config);
    this.threadHeights = new HashMap();
  }

  static maxScore() {
    return 2;
  }

  score(depth) {
    return -(depth / this.config.MAX_THREAD_COUNT);
  }

  setThreadHeight(hash, height) {
    this.threadHeights.set(height, hash);
  }

  setHeight(height) {
    this.height = height;
  }

  addChild(node) {
    switch (node.type()) {
      case BlockType.POST: {
        this.checkPost(node);

        const index = node.header.reserved();
        const hash = index === 0 ? this.hash : this.data.getThread(index);
        node.setThread(hash);
        node.setSegmentHeight(1);
        node.setHeight(this.threadHeights.get(hash));
        break;
      }
      case BlockType.THREAD: {
        const parentPosts = this.checkThread(node);
        parentPosts.forEach(post => post.checkThread(node));

        node.setHeight(this.height + 1);
        parentPosts.forEach(post => post.insertThread(node));
        break;
      }
      default: throw ErrorType.illegalNodeType();
    }

    super.addChild(node);
  }

  checkPost(post) {
    // check difficulty

    // should this be w.r.t. previous post or this thread?
    this.checkPostDifficulty(post);

    // check that post reserved byte points to valid index
    if (post.header.reserved() >= this.data.numRecords) {
      throw ErrorType.unknownThread();
    }
  }

  checkThread(thread) {
    // check continuity and get removed thread hash
    const removedThreadHash = this.checkThreadContinuity();

    // the number of posts between this thread and new thread
    let numPosts = 0;
    // keep track of the minimum score to check sort order
    let minScore = ThreadNode.maxScore();
    // the posts that this thread needs to be added to as a child
    const parentPosts = [];

    // run checks on the original post
    const op = this.checkThreadOriginalPost();
    // add it to the list of parents
    parentPosts.push(op);

    // count # of posts since last thread block, check score, check pairing
    for (let i = 1; i < thread.data.numRecords; i += 1) {
      // get thread hash at index i from new block
      const threadRecord = thread.data.getThread(i);
      // get post hash at index i from new block
      const latestRecord = thread.data.getPost(i);
      // get the thread node
      const baseThreadNode = this.nodeMap.get(threadRecord);
      // get the post node
      const latestNode = this.nodeMap.get(latestRecord);
      // if the node doesn't exist, error
      if (!latestNode) {
        throw ErrorType.missingReference(latestRecord);
      }

      switch (latestNode.type()) {
        case BlockType.THREAD:
          // if the node is a thread, it must be this thread block
          if (!Util.arrayEquality(latestNode.hash, this.hash)) {
            throw ErrorType.hashMismatch();
          }
          break;
        case BlockType.POST:
          // if the node is a post, it must actually be in the paired thread
          if (!Util.arrayEquality(latestNode.thread, threadRecord)) {
            throw ErrorType.wrongThread();
          }
          // add the segment height to numPosts
          numPosts += latestNode.segmentHeight;
          // add the node to the parent list
          parentPosts.push(latestNode);
          break;
        default: throw ErrorType.internalConsistency();
      }

      // check that score is decreasing or equal
      const baseThreadDepth = (this.height + 1) - baseThreadNode.height;
      const currentScore = latestNode.score(baseThreadDepth);
      if (minScore > currentScore) {
        throw ErrorType.threadOrder();
      }
      minScore = currentScore;
    }

    // if a thread was removed, it must have had the lowest score
    if (removedThreadHash) {
      // get the base node of the removed thread
      const removedThread = this.indexMap.get(removedThreadHash);
      // get depth of removed node
      const removedThreadDepth = (this.height + 1) - removedThread.height;
      // calculate minimum possible score of removed node
      const removedScore = removedThread.score(removedThreadDepth);
      // the removed thread must have a lower score than the worst included thread
      if (minScore < removedScore) {
        throw ErrorType.threadOrder();
      }
    }

    // check difficulty
    this.checkThreadDifficulty(thread, numPosts);

    // return parent list
    return parentPosts;
  }

  checkThreadOriginalPost(thread) {
    // get the hash of the first post
    const opHash = thread.data.getPost(0);

    // get the referenced node
    const op = this.nodeMap.get(opHash);

    // must be of type original post
    if (op.type() !== BlockType.ORIGINAL_POST) {
      throw ErrorType.illegalNodeType();
    }

    return op;
  }

  checkThreadContinuity(thread) {
    // old - new = removed records
    const removedThreads = this.data.subtractRecords(thread.data);
    // removedThreads must contain exactly 1 or 0 elements
    // depending on whether the thread limit has been reached
    const expectedRemovalCount = this.height < this.config.MAX_THREAD_COUNT ? 0 : 1;

    if (removedThreads.length !== expectedRemovalCount) {
      throw ErrorType.missingThread();
    }

    // new - old = added records
    const addedThreads = thread.data.subtractRecords(this.data);

    // since new thread has zero hash, it's subtracted out
    // the only added thread is the second-newest thread
    if (addedThreads.length !== 1) {
      throw ErrorType.unknownThread();
    }

    return removedThreads[0];
  }
};
