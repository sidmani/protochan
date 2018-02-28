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

const DataParser = require('./parser.js');
const MerkleTree = require('../../hash/merkleTree.js');
const Hash = require('../../hash/blake2s.js');
const HashMap = require('../../hash/hashMap.js');
const ErrorType = require('../../error.js');
const Util = require('../../util/util.js');

module.exports = class ThreadDataParser extends DataParser {
  constructor(data, offset = 0) {
    super(data, offset);

    // content contains pairs of 32-byte hashes
    if (this.contentLength % 64 !== 0 || this.contentLength === 0) {
      throw ErrorType.dataLength();
    }

    this.indexMap = new HashMap();
    const dataArray = Util.split(
      this.data,
      32,
      offset + this.controlLength,
      (hash, idx) => this.indexMap.set(idx, hash),
    );

    // since the first array must be zero, just replace it
    // if the hash check passes, then it was OK to begin with
    dataArray[0] = new Uint8Array(32);

    this.merkleTree = new MerkleTree(dataArray);

    // combine control hash and merkle root to get data hash
    const ctrlHash = Hash.digest(this.data.subarray(0, this.controlLength));
    this.hash = Hash.digest(Util.concat(
      ctrlHash,
      this.merkleTree.root,
    ));

    // number of thread records in the data
    this.numRecords = this.contentLength / 64;
  }

  getThread(index) {
    return this.getAbsoluteIndex(index * 2);
  }

  getPost(index) {
    return this.getAbsoluteIndex((index * 2) + 1);
  }

  getAbsoluteIndex(index) {
    return this.data.subarray(
      this.offset + this.controlLength + (index * 32),
      this.offset + this.controlLength + (index * 32) + 32,
    );
  }

  // get the post associated with a particular thread
  getCorrespondingItem(hash) {
    const idx = this.indexMap.get(hash);
    if (idx === undefined) { return undefined; }
    // return idx + 1 if getting post from thread
    // return idx - 1 if getting thread from post
    return this.getAbsoluteIndex(idx + (1 - (2 * (idx % 2))));
  }

  // find records that are in this block but not in otherThread
  subtractRecords(otherThread) {
    // include keys where indices are even (just thread hashes)
    return this.indexMap.difference(
      otherThread.indexMap,
      (key, value) => value % 2 === 0,
    );
  }

  contains(hash) {
    return this.indexMap.contains(hash);
  }

  containsThread(hash) {
    return this.contains(hash) && this.indexMap.get(hash) % 2 === 0;
  }

  containsPost(hash) {
    return this.contains(hash) && this.indexMap.get(hash) % 2 === 1;
  }
};
