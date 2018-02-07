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

const THREAD_BLOCK_ID = 0x00;

var Block = require('./block.js');
var HashMap = require('../hash/hashMap.js');
var Difficulty = require('../hash/difficulty.js');
var MerkleTree = require('../hash/merkleTree/merkleTree.js');
var ErrorType = require('../error.js');

module.exports = class ThreadBlock extends Block {
  constructor(header, data) {
    super(header, data);
    if (header.blockType() !== THREAD_BLOCK_ID) throw ErrorType.Block.type();

    // thread data comes in sets of 64 bytes (32 thread, 32 post)
    let threadDataLength = data.byteLength
    - this.controlLength
    - 2; // separator and terminator

    if (threadDataLength < 64 || threadDataLength % 64 !== 0) throw ErrorType.Data.length();

    this.numThreads = threadDataLength / 64;

    // the first thread has a zero hash
    Difficulty.verify(new Uint8Array(data, this.controlLength + 1, 32), 256);

    // verify no duplicates using hashmap
    // and create lookup table at the same time! :)
    // TODO: replace block hash check with hash check here
    this.merkleTree = new MerkleTree(new Uint8Array(data, this.controlLength + 1, this.contentLength));
  }

  // data is pairs of 32-byte hashes
  // { thread hash, post hash}
  // first row is { 0, post hash } (genesis)
  getThread(index) {
    if (index >= this.numThreads) throw ErrorType.Parameter.invalid();
    return this.merkleTree.index(index*2);
  }

  // TODO: optimize to use hashmap and not create extra arrays
  getPost(index) {
    if (index >= this.numThreads) throw ErrorType.Parameter.invalid();
    return this.merkleTree.index(index*2+1);
  }

  // get the post associated with a particular thread
  getCorrespondingItem(hash) {
    let idx = this.merkleTree.indexOf(hash);
    if (idx !== undefined) {
      if (idx % 2 === 0) {
        // get post for thread
        return this.merkleTree.index(idx + 1);
      } else {
        // get thread for post
        return this.merkleTree.index(idx - 1);
      }
    } else {
      throw ErrorType.Parameter.invalid();
    }
  }

  prune() {
    // TODO: prune data
  }
};
