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

const THREAD_BLOCK_ID = 0x00;

const Block = require('../block.js');
const Difficulty = require('../../hash/difficulty.js');
const MerkleTree = require('../../hash/merkleTree/merkleTree.js');
const ErrorType = require('../../error.js');
const Util = require('../../util/util.js');

module.exports = class ThreadBlock extends Block {
  constructor(header, data) {
    super(header, data);
    if (header.blockType() !== THREAD_BLOCK_ID) throw ErrorType.Block.type();

    // thread data comes in sets of 64 bytes (32 thread, 32 post)
    const threadDataLength = data.byteLength
    - this.controlLength
    - 2; // separator and terminator

    if (threadDataLength < 64 || threadDataLength % 64 !== 0) throw ErrorType.Data.length();

    this.numThreads = threadDataLength / 64;

    // the first thread has a zero hash
    Difficulty.verify(data.subarray(this.controlLength + 1, this.controlLength + 1 + 32), 256);

    // merkle tree does not allow duplicates since it has a one-to-one index map
    const content = data.subarray(this.controlLength + 1, data.length - 1);
    this.merkleTree = new MerkleTree(content);

    // check that the merkle root equals the header's dataHash
    if (!Util.arrayEquality(this.merkleTree.root.hash, header.dataHash())) {
      throw ErrorType.Data.hash();
    }

    // XXX: untested
    // so that we don't need to check if block is post or thread
    this.thread = this.hash;
  }

  // data = pairs of 32-byte hashes
  // { thread hash + post hash }
  // genesis row is { 0, post hash }
  getThread(index) {
    return this.merkleTree.index(index * 2);
  }

  getPost(index) {
    return this.merkleTree.index((index * 2) + 1);
  }

  // get the post associated with a particular thread
  getCorrespondingItem(hash) {
    const idx = this.merkleTree.indexOf(hash);
    if (idx === undefined) { return undefined; }
    // return idx + 1 if getting post from thread
    // return idx - 1 if getting thread from post
    return this.merkleTree.index(idx + (1 - (2 * (idx % 2))));
  }

  // find records that are in this block but not in otherThread
  subtractThreadRecords(otherThread) {
    // include keys where indices are even (just thread hashes)
    return this.merkleTree.difference(otherThread.merkleTree, (key, value) => value % 2 === 0);
  }

  contains(hash) {
    return this.merkleTree.contains(hash);
  }

  containsThread(hash) {
    return this.contains(hash) && this.merkleTree.indexOf(hash) % 2 === 0;
  }

  containsPost(hash) {
    return this.contains(hash) && this.merkleTree.indexOf(hash) % 2 === 1;
  }

  prune() {
    this.merkleTree.prune();
  }

  isPruned() {
    return this.merkleTree.isPruned;
  }
};
