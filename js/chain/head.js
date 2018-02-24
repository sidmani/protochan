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

const Difficulty = require('../hash/difficulty.js');
const Uint256 = require('../util/uint256.js');

// A Head keeps track of information about a thread
module.exports = class Head {
  constructor() {
    // the height of the block referenced by this.pointer
    this.height = 0;

    // the number of posts that are not yet under a thread block
    this.unconfirmedPosts = 0;

    // the timestamp of the latest post block
    this.strictTimestamp = 0;

    // the total work done on this head
    // work = avg # of hash ops performed to mine a block
    this.work = new Uint256();
  }

  pushPost(post) {
    // increment the height
    this.height += 1;
    // increment number of unconfirmed posts
    this.unconfirmedPosts += 1;
    // update the post-only timestamp
    this.strictTimestamp = post.timestamp();
    // add to total work
    this.work.addExp2(Difficulty.countLeadingZeroes(post.hash));
  }

  pushThread(thread) {
    // XXX: should height include threads?
    this.height += 1;
    // XXX: this runs the same calculation for every head.
    this.work.addExp2(Difficulty.countLeadingZeroes(thread.hash));
    // don't update strictTimestamp, since that depends on posts
    this.unconfirmedPosts = 0;
  }
};
