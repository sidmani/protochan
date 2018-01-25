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

var Storage = require('./storage.js');
var Thread = require('../block/thread.js');
var GenesisPost = require('../block/genesisPost.js');
var Post = require('../block/post.js');
var Util = require('../util.js');
var Hash = require('../hash/blake2s.js');

module.exports = class PostChain {
  constructor(originalPost, thread) {
    Util.assert(originalPost);
    Util.assert(originalPost instanceof GenesisPost);

    Util.assert(thread);
    Util.assert(thread instanceof Thread);

    this.thread = thread;

    this.storage = Storage();
    this.push(originalPost);
  }

  push(post) {
    Util.assert(post);
    Util.assert(post instanceof Post);
    let hash = Hash.digest(post.header.data);

    if (this.storage.count() === 0) {
      // if this is the original post, just add it
      Util.assert(post instanceof GenesisPost);
    } else {
      // otherwise, check that its prevHash points to head of chain
      Util.assertArrayEquality(
        this.storage.head().hash, post.header.prevHash()
      );
      // TODO: difficulty checks
    }

    this.storage.push(hash, post);
  }

  // technically, this shouldn't be necessary if
  // all blocks are added using push()
  verify() {
    let count = this.storage.count();
    if (count === 0) { // an empty chain is trivially valid
      return;
    }

    // assert that thread block points to genesis post
    Util.assertArrayEquality(
      this.thread.getPost(0),
      Hash.digest(this.storage.getIndex(0).data)
    );

    for (let i = 1; i < count; i++) {
      // assert that idx (i-1)'s hash equals i's prevHash
      Util.assertArrayEquality(
        Hash.digest(this.storage.getIndex(i-1).data),
        this.storage.getIndex(i).header.prevHash()
      );

      // TODO: assert difficulty requirements 
    }
  }
}
