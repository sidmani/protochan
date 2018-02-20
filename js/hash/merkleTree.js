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

const ErrorType = require('../error.js');
const HashMap = require('./hashMap.js');
const Hash = require('./blake2s.js');

module.exports = class MerkleTree {
  constructor(data, offset = 0, len = data.byteLength) {
    // must be pairs of 32-byte hashes
    if (len % 64 !== 0 || len === 0) throw ErrorType.Data.length();

    // total count of items
    const count = len / 32;

    // array of uint8arrays
    let builtArray = [];

    // maps hashes to their index in the tree for fast lookup
    this.indexMap = new HashMap();
    for (let i = 0; i < count; i += 1) {
      // each post and thread is an item
      const item = data.subarray(offset + (i * 32), offset + ((i + 1) * 32));
      this.indexMap.setRaw(item, i);
      builtArray.push(Hash.digest(item));
    }

    this.depth = 1;
    do {
      const newArray = [];
      for (let i = 0; i < builtArray.length / 2; i += 1) {
        // pair the 2i and 2i+1 indices
        // if builtArray.length is odd, length/2 will have a 0.5
        // so the last index i*2+1 will be undefined
        // this is not a problem, since the MerkleNode handles that
        // case and duplicates the hash
        const hash1 = builtArray[i * 2];
        const hash2 = builtArray[(i * 2) + 1] || hash1;
        const concat = new Uint8Array(64);
        concat.set(hash1, 0);
        concat.set(hash2, 32);

        newArray.push(Hash.digest(concat));
      }

      // builtArray now represents the next level of the tree
      builtArray = newArray;
      this.depth += 1;
    } while (builtArray.length > 1);

    this.root = builtArray[0];
    this.data = data;
    this.offset = offset;
  }

  // Verify that a thread or post is contained in this tree
  get(intermediates) {
    return this.root.path(intermediates);
    // intermediates.length must equal depth - 1
  }

  // verify(hash, intermediates, index) {
  //   // let idxArr = idx.toString(2).split('').map(num => parseInt(num));
  //   // while (idxArr.length < this.depth - 1) {
  //   //   idxArr.unshift(0);
  //   // }
  //   // while (intermediates.length > 0) {
  //   //     let concat = new Uint8Array(64);
  //   //     concat.set()
  //   // }
  // }

  difference(otherTree, filter) {
    return this.indexMap.difference(otherTree.indexMap, filter);
  }

  index(idx) {
    // return this.data.subarray(
    //   this.offset + (idx * 32),
    //   this.offset + ((idx + 1) * 32),
    // );
    const idxArr = idx
      .toString(2)
      .split('')
      .map(num => parseInt(num, 10));

    const paddedArr = new Array(this.depth - 1 - idxArr.length)
      .fill(0)
      .concat(idxArr);

    return this.root.index(paddedArr);
  }

  indexOf(hash) {
    return this.indexMap.get(hash);
  }

  contains(hash) {
    return this.indexMap.contains(hash);
  }

  prune() {
    this.root.prune();
    this.indexMap.clear();
    this.isPruned = true;
  }
};
