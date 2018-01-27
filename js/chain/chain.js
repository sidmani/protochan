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
var Hash = require('../hash/blake2s.js');
var Block = require('../block/block.js');
var Post = require('../block/post.js');
var Thread = require('../block/thread.js');
var Genesis = require('../block/genesis.js');
var GenesisPost = require('../block/genesisPost.js');
var HashMap = require('../hash/hashMap.js');
var PostChain = require('./postChain.js');
var Difficulty = require('../hash/difficulty.js');

module.exports = class Chain {
  constructor(genesis, genesisPost) {
    // validate parameters
    Util.assert(genesis);
    Util.assert(genesis instanceof Genesis);

    Util.assert(genesisPost);
    Util.assert(genesisPost instanceof GenesisPost);

    // genesis block starts the chain
    this.genesis = genesis;

    // all of the individual post chains that comprise a thread
    this.threads = new Array();

    // the underlying data storage; shared among all post chains
    // to prevent duplications
    this.map = new HashMap();
    this.addThread(genesis, genesisPost);
  }

  addThread(block, originalPost) {
    Util.assert(block);
    Util.assert(block instanceof Thread);

    Util.assert(originalPost);
    Util.assert(originalPost instanceof Post);

    if (this.threads.length === 0) {
      // genesis thread
      Util.assert(block instanceof Genesis);
      Util.assert(originalPost instanceof GenesisPost);

      // TODO: check difficulty
    } else {
      // check that prevHash points correctly
      Util.assertArrayEquality(
        this.head().hash(),
        block.header.prevHash()
      );
      // check that all posts are contained in matching threads
      // and that index of post is greater than index of the
      // post pointed to for that thread in the previous thread
      // block
      let numThreads = block.numThreads();
      for (let i = 1; i < numThreads; i++) {
        // the hash of the listed thread's gen block
        let threadHash = block.getThread(i);

        // the hash of the latest post in that thread
        let postHash = block.getPost(i);

        // the actual block associated with the post hash
        let post = this.map.get(postHash);

        // for now, we are going to require that all posts
        // are inserted beforehand
        Util.assert(post);

        // assert the post is actually in the listed thread
        Util.assertArrayEquality(post.thread, threadHash);

        // make sure the post index is higher than that of the
        // last thread block's post for the corresponding
        // thread

        // get the latest inserted thread block
        // TODO: this can be moved outside the loop
        let prevBlock = this.head();

        // get the hash of the latest post in the ith thread
        // at the time of the latest inserted block
        let prevPostHash = prevBlock.getPostForThread(threadHash);

        // actually retrieve that post
        let prevPost = this.map.get(prevPostHash);

        // assert the previous post has a lesser index than new one
        Util.assert(prevPost.index < post.index);
        // TODO: check difficulty
      }
    }

    // this already checks if the thread points to the post
    let chain = new PostChain(originalPost, block, this.map);
    this.threads.push(chain);
  }

  addPost() {
    // get the post pointed to by prevHash
    // get the associated postChain
    // .push()
  }

  head() {
    Util.assert(this.threads.length > 0);
    return this.threads[this.threads.length-1];
  }
}
