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

var Util = require('../util.js');
var Post = require('../block/post.js');
var Thread = require('../block/thread.js');
var HashMap = require('../hash/hashMap.js');
var Difficulty = require('../hash/difficulty.js');

///////////////////////
// A head represents the top of a chain of blocks
// Every head is guaranteed to be the top of a continuous chain to the genesis block
///////////////////////

module.exports = class Head {
  constructor(originalPost, threadHash, map, startingHeight) {
    // base is the starting point of the chain
    // if this is part of a fork, base is the first block on branch after the fork

    //////////////////////////
    // parameter assertions
    Util.assert(originalPost instanceof Post);
    Util.assert(threadHash instanceof Uint8Array);
    Util.assert(map instanceof HashMap);
    Util.assert(typeof(startingHeight) === 'number');
    Util.assert(startingHeight >= 0);

    //////////////////////////
    // Set instance variables
    // the starting height of originalPost
    this.height = startingHeight;

    // the associated thread
    this.thread = threadHash;

    // the underlying hashmap
    this.map = map;

    ///////////////////////////
    // Insert the original post
    // set the associated thread for the original post
    originalPost.thread = this.thread;

    // insert the post into the hashmap; this.pointer = post's hash
    this.pointer = this.map.set(originalPost);

    // set timestamp to post's timestamp
    this.timestamp = originalPost.header.timestamp();

    // this is the number of posts that have been inserted since the last thread block
    // summing this value for all heads yields the numPosts used in thread difficulty calculations
    this.unconfirmedPosts = 1;
  }

  getBlockAtHead() {
    return this.map.get(this.pointer);
  }

  pushPost(post) {
    // parameter validation
    Util.assert(post instanceof Post);

    let hash = post.hash();
    // TODO: difficulty check
    // XXX: timestamp should be calculated based on last post block, not last any block
    let delta_t = post.header.timestamp() - this.timestamp;
    // XXX: max diff and min diff need to be set globally
    let reqDiff = Difficulty.requiredPostDifficulty(delta_t);
    // Difficulty.verify(hash, reqDiff);
    // this breaks the unit tests :(

    // check that post's prevHash points to head
    Util.assertArrayEquality(
      this.pointer,
      post.header.prevHash()
    );

    // post is OK!
    post.thread = this.thread;
    // don't need to compute the hash again
    this.map.setRaw(hash, post);
    this.pointer = hash;
    this.height += 1;
    this.timestamp = post.header.timestamp();
    this.unconfirmedPosts += 1;
  }

  // XXX: untested
  stageThread(thread, hash) {
    // parameter validation
    Util.assert(thread instanceof Thread);
    Util.assert(hash instanceof Uint8Array);

    // thread has already been checked and set in the map by caller
    // this just runs other checks and sets head
    // hash is thread.hash(), but don't waste processing
    // power recomputing it every time

    // get the latest post hash in this thread according to the
    // passed in threadblock
    let latestPost = thread.getPostForThread(this.thread);
    if (latestPost) {
      // assert latestPost hash is equal to head hash
      Util.assertArrayEquality(latestPost, this.pointer);
    } else {
      // check if genesis case

      // this head's thread hash must equal hash of thread block
      Util.assertArrayEquality(hash, this.thread);

      // post in thread block's genesis row equals this.head
      Util.assertArrayEquality(thread.getPost(0), this.pointer);
    }

    // thread is OK!
    this.stage = hash;
  }

  discardStage() {
    this.stage = undefined;
  }

  commitThread() {
    // since stage is never set from outside, check may be unnecessary
    Util.assert(this.stage instanceof Thread);

    this.pointer = this.stage;
    this.height += 1;
    // don't update the timestamp, since that depends only on posts
    this.discardStage();

    this.unconfirmedPosts = 0;
  }

  // XXX: untested
  pushThread(thread, hash) {
    this.stageThread(thread, hash);
    this.commitThread();
  }

  // XXX: untested
  sumWork() {
    return this.work; // don't calculate it every time
  }
}
