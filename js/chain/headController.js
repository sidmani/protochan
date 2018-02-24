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

const HashMap = require('../hash/hashMap.js');
const Head = require('./head.js');
const Util = require('../util/util.js');

module.exports = class HeadController {
  constructor() {
    // this.blockToHead = new HashMap();
    // block hash -> head group
    this.headGroups = new HashMap();
  }

  pushPost(post) {
    // get the HeadGroup for this pseudo-thread
    // or create a new head group
    const group = this.headGroups.get(post.header.prevHash()) || new HeadGroup();

    group.pushPost(post);

    // point post hash to head group
    this.headGroups.setRaw(post.hash, group);
    // XXX: is this necessary?
    this.headGroups.setRaw(post.header.prevHash(), group);

    // tell the head group to point the new post hash to the head
  }

  pushThread(thread) {
    // for each post referenced in the thread
    for (let i = 0; i < thread.numRecords; i += 1) {
      // get the latest hash at index i
      const postHash = thread.getPost(i);

      // get the associated group
      const group = this.headGroups.get(postHash) || new HeadGroup();

      // concatenation of post & thread hash is the new pointer
      const concat = group.pushThread(
        postHash,
        thread.hash,
      );

      this.headGroups.setRaw(concat, group);
    }
  }
};

// Each HeadGroup represents all of the heads in a single thread
class HeadGroup {
  constructor() {
    this.map = new HashMap();
    // map = block hash -> head
  }

  pushPost(post) {
    // get the head or create if necessary
    const head = this.map.get(post.header.prevHash()) || new Head();

    // add the post to the head
    head.pushPost(post);

    // replace oldBlock -> head with newBlock -> heasd
    this.map.relink(
      post.header.prevHash(),
      post.hash,
      head,
    );
  }

  pushThread(thread, postHash) {
    // get the head or create if necessary
    const head = this.map.get(postHash) || new Head();

    // update the head
    head.pushThread(thread);

    // concatenate post & thread hashes
    const concat = Util.concat(postHash, thread.hash);

    // replace post -> head with concat -> head
    this.map.relink(
      postHash,
      concat,
      head,
    );

    return concat;
  }
}

// XXX: move to fork
// score(currentThreadHeight) {
//   // score depends on:
//   // total number of posts (+)
//   // depth of genesis thread block (-)
//   // activity (number of posts since last thread block) (+)
//
//   // genesis block must always have max score
//   // (max threads - depth) / max threads
//   const depth = currentThreadHeight - this.threadHeight;
//   return (this.unconfirmedPosts / (this.height + 1)) - (depth / this.config.MAX_THREAD_COUNT);
// }
//
// static genesisScore() {
//   // has to be a number that is always > score(n)
//   // (# between 0 and 1) - (# between 0 and 1) <= 1
//   return 1;
// }
