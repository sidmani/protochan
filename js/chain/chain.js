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

var Util = require('../util/util.js');
var Post = require('../block/post.js');
var Thread = require('../block/thread/thread.js');
var Genesis = require('../block/thread/genesis.js');
var GenesisPost = require('../block/genesisPost.js');
var HashMap = require('../hash/hashMap.js');
var Difficulty = require('../hash/difficulty.js');
var Head = require('./head.js');
var Configuration = require('../board/config.js');
var ErrorType = require('../error.js');

module.exports = class Chain {
  constructor(config) {
    if (!(config instanceof Config)) throw ErrorType.Parameter.type();

    this.config = config;

    this.headMap = new HashMap();
    this.blockMap = new HashMap();

    // set the thread pointer to an array of zeroes
    // the first block must point to a zero prevHash,
    // meaning it must be a genesis block
    this.threadPointer = undefined;

    // the height of the current thread block
    this.threadHeight = 0;
  }

  // Convenience methods
  getBlock(hash) {
    return this.blockMap.get(hash);
  }

  getHead(threadHash) {
    return this.threadMap.get(threadHash);
  }

  pushThread(originalPost, thread) {
    // assert post is instanceof GenesisPost
    if (!(originalPost instanceof GenesisPost)) throw ErrorType.Parameter.invalid();

    // check thread genesis row points to post
    if (!Util.arrayEquality(thread.getPost(0), originalPost.hash)) throw ErrorType.Chain.hashMismatch();

    // check that thread timestamp > post timestamp
    // since the hash chain implies the order of creation
    if(originalPost.timestamp() >= thread.timestamp()) throw ErrorType.Parameter.invalid();

    // check that the number of thread records contained is:
    // min(height + 1, maxThreads)
    // for example, genesis block has min(0 + 1, MAX_THREAD_COUNT)
    // = 1 (since MAX_THREAD_COUNT >= 1)
    let expectedThreadCount = Math.min(this.threadHeight + 1, this.config.MAX_THREAD_COUNT);
    if (thread.numThreads !== expectedThreadCount) throw ErrorType.Parameter.invalid();

    if (this.threadPointer) {
      // this is not the first block
      // check that the thread prevHash points to it
      if (!Util.arrayEquality(thread.header.prevHash(), this.threadPointer)) {
        // the hashes are not equal.
        // TODO: implementation here
        // option 1: points to a known thread (a fork)
        // pushing to all heads should automatically create a fork
        // need a way to fork the thread pointer
        // option 2: invalid based on known blocks. throw error.

        // remove this
        throw ErrorType.Parameter.invalid();
      }

      let prevThread = this.getBlock(thread.header.prevHash());

      // TODO: check that threads/posts present in the block are valid
      // have to successfully stage on every head
      // and be ordered according to the ranking algorithm
      // if height >= maxThreads, the removed thread record
      // must have a lower score than every included thread record
      // at the timestamp of the thread block

      // get time diff between new thread and previous one
      let deltaT = thread.timestamp() - prevThread.timestamp();

      // the timestamp must be strictly increasing
      if (deltaT <= 0) throw ErrorType.Parameter.invalid();

      // count all unconfirmed posts on all heads
      let numPosts = head.enumerate().reduce((sum, head) => sum + head.unconfirmedPosts, 0);

      // calculate the minimum difficulty required
      let reqDiff = Difficulty.requiredThreadDifficulty(
        deltaT,
        numPosts,
        this.config.MAX_THREAD_COUNT,
        this.config.MIN_THREAD_DIFFICULTY,
        this.config.MAX_THREAD_DIFFICULTY);

      // check that the hash meets the requirement
      if (Difficulty.countLeadingZeroes(thread.hash) < reqDiff) throw ErrorType.Difficulty.insufficient();
    } else {
      // this is the first block
      // make sure it is a valid genesis block
      if (!(thread instanceof Genesis)) throw ErrorType.Parameter.invalid();

      // sanity check
      // the block can't be older than this code
      // 0x5A7E6FC0 = Friday, Feb. 9, 2018 8:06:24 PM PST
      if (thread.timestamp() < 0x5A7E6FC0) throw Error.Parameter.invalid();

      // block is OK.
    }

    // once we've asserted the thread is OK:
    // create a new head
    let newHead = new Head(
      this.config,
      this.blockMap,
      thread.hash
    );
    // push the post onto the head
    // stage the thread on all heads (including new one)
    // Only insert into headmap after stage succeeds
    // commit on all heads
    // set this.timestamp?
    // set height on thread block?
    // increment height
    this.threadHeight += 1;
    // set pointer
    this.threadPointer = thread.hash;
  }

  pushPost(post) {
    // the board (the callee) is responsible for checking board ID
    // retrieve post pointed to by prevHash

    // the post pointed to by the parameter
    let prevPost = this.blockMap.get(post.header.prevHash());

    // this function doesn't need to handle a genesis case
    // there is no way a post can be inserted without
    // a previous post already existing
    if (!prevPost) throw ErrorType.Chain.missingReference();

    // retrieve the associated head
    // don't need to check non-nil
    // all posts in the map guaranteed to have associated head
    // XXX: what if the prevPost is a thread block? this fails
    let head = this.getHead(prevPost.thread);

    // head could be instanceof Head or of Fork
    // abstraction takes care of that for us here
    try {
      // tell the head to append the post
      // the head handles difficulty and hash mismatch checks
      head.pushPost(post);
    } catch (err) {
      // the post was invalid or didn't point to the top post
      // if it's invalid, propagate the error
      // otherwise, construct a fork
    }
  }
}

class Fork {
  constructor(heads, threadHash) {
    this.heads = heads;
    this.thread = threadHash;
  }
}
