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

var Thread = require('../block/thread.js');
var GenesisPost = require('../block/genesisPost.js');
var Post = require('../block/post.js');
var Util = require('../util.js');
var Hash = require('../hash/blake2s.js');
var HashMap = require('../hash/hashMap.js');

module.exports = class PostChain {
  constructor(originalPost, thread, map) {
    Util.assert(originalPost);
    Util.assert(originalPost instanceof GenesisPost);

    Util.assert(thread);
    Util.assert(thread instanceof Thread);

    Util.assert(map);
    Util.assert(map instanceof HashMap);

    // check that the original post hash referenced in the data sector of the thread block equals the hash of the parameter genesisPost
    Util.assertArrayEquality(
      thread.getPost(0),
      originalPost.hash()
    );

    this.thread = thread.hash();
    this.map = map;
    this.posts = new Array();

    this.map.set(thread);
    this.push(originalPost);
  }

  push(post) {
    Util.assert(post);
    Util.assert(post instanceof Post);

    if (this.posts.length === 0) {
      Util.assert(post instanceof GenesisPost);
      // if this is the original post, just add it
      // since we already checked that the thread points to it
      // TODO: difficulty checks
    } else {
      // otherwise, check that its prevHash points to head of chain
      Util.assertArrayEquality(
        this.head().hash(),
        post.header.prevHash()
      );

      // TODO: difficulty checks

      // TODO: check if the prevHash exists (i.e. a fork)
    }
    post.thread = this.threadHash;
    post.index = this.posts.length;
    this.posts.push(post);
    this.map.set(post);
  }

  head() {
    Util.assert(this.posts.length > 0);
    return this.posts[this.posts.length-1];
  }

  getIndex(idx) {
    Util.assert(idx >= 0 && idx < this.posts.length);
    return this.posts[idx];
  }
}
