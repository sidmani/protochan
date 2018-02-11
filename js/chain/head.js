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
var Difficulty = require('../hash/difficulty.js');
var Uint256 = require('../util/uint256.js');
var ErrorType = require('../error.js');
var Config = require('../board/config.js');

///////////////////////
// A head represents the top of a chain of blocks
// Every head is guaranteed to be the top of a continuous chain to the genesis block
///////////////////////

module.exports = class Head {
  constructor(config, blockMap, thread) {
    // the board-wide config data
    this.config = config;

    // the common hashmap that stores all blocks
    this.blockMap = blockMap;

    // the hash of the associated thread
    this.thread = thread;

    // pointer is initially undefined
    this.pointer = undefined;

    // the height of the block referenced by this.pointer
    this.height = 0;

    // the number of posts that are not yet under a thread block
    this.unconfirmedPosts = 0;

    // the timestamp of the latest *post* block
    this.strictTimestamp = 0;

    // the total work done on this head
    // work = estimated # of hash ops performed to mine a block
    this.work = new Uint256();
  }

  pushPost(post) {
    let leadingZeroes = Difficulty.countLeadingZeroes(post.hash);

    if (this.pointer) {
      // this is not the first block
      // check that post's prevHash points to head
      if (!Util.arrayEquality(this.pointer, post.header.prevHash())) {
        // either invalid or a fork
        // see analogous situation in Chain.pushThread
        throw ErrorType.Chain.hashMismatch();
      }

      let deltaT = post.timestamp() - this.timestamp();

      // timestamp is strictly increasing
      if (deltaT <= 0) throw ErrorType.Parameter.invalid();

      // calculate the required difficulty of this post
      let reqDiff = Difficulty.requiredPostDifficulty(
        deltaT,
        this.config.MIN_POST_DIFFICULTY,
        this.config.MAX_POST_DIFFICULTY
      );

      // assert that the has meets the difficulty requirement
      if (leadingZeroes < reqDiff) throw ErrorType.Difficulty.insufficient();

      // post is OK.
    } else {
      // this is the first block
      // make sure this is a valid genesis post
      if (!(post instanceof GenesisPost)) throw ErrorType.Parameter.invalid();

      // sanity check
      // the block can't be older than this code
      // 0x5A7E6FC0 = Friday, Feb. 9, 2018 8:06:24 PM PST
      if (thread.timestamp() < 0x5A7E6FC0) throw Error.Parameter.invalid();

      // post is OK.
    }

    // insertion into map automatically checks duplication
    // duplication implies a hash collision or a bug
    this.blockMap.set(post);

    // post is OK!
    // set associated thread on post
    post.thread = this.thread;
    // set pointer to the new post
    this.pointer = post.hash;
    // increment the height
    this.height += 1;
    // update the post-only timestamp
    this.strictTimestamp = post.timestamp();
    // increment number of unconfirmed posts
    this.unconfirmedPosts += 1;

    // add to total work
    this.work.add(Uint256.exp2(leadingZeroes));
  }

  // XXX: untested
  stageThread(thread) {
    // thread has already been checked by caller
    // this just runs other checks and sets head

    // the pointer must exist
    // either a post block is the first block
    // or a fork sets the pointer automatically
    if (!this.pointer) throw ErrorType.State.internalConsistency();

    // get the latest post hash in this thread according to the
    // passed in threadblock
    let latestBlock = thread.getPostForThread(this.thread);

    if (latestBlock) {
      // thread is not the first thread in this head
      // assert latestPost hash is equal to head hash
      if (!Util.arrayEquality(latestBlock, this.pointer)) throw ErrorType.Chain.hashMismatch();
      // again check fork
    } else {
      // thread is either invalid or the first thread in this head
      // since the genesis post is paired with a 0-hash
      // check if genesis case

      // this head's thread hash must equal hash of thread block
      if (!Util.arrayEquality(thread.hash, this.thread)) throw ErrorType.Chain.hashMismatch();

      // post in thread block's genesis row equals this.head
      if (!Util.arrayEquality(thread.getPost(0), this.pointer)) throw ErrorType.Chain.hashMismatch();
    }

    // thread is OK!
    this.stage = thread.hash;
  }

  discardStage() {
    this.stage = undefined;
  }

  commitThread() {
    if (!(this.stage instanceof Uint8Array)) throw ErrorType.State.invalid();

    this.pointer = this.stage;
    this.height += 1;
    // XXX: this runs the same calculation for every head.
    // maybe get the chain to set the work from outside
    this.work.add(
      Uint256.exp2(Difficulty.countLeadingZeroes(this.stage))
    );
    // don't update strictTimestamp, since that depends on posts
    this.discardStage();
    this.unconfirmedPosts = 0;
  }

  // Convenience
  getBlockAtHead() {
    if (this.pointer) {
      return this.blockMap.get(this.pointer);
    }
    return undefined;
  }

  timestamp() {
    let latestBlock = this.getBlockAtHead();
    if (latestBlock) {
      return latestBlock.timestamp();
    }
    return 0;
  }
}
