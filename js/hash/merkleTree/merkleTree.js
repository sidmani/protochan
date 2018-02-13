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

const ErrorType = require('../../error.js');
const HashMap = require('../hashMap.js');
const Node = require('./merkleNode.js');
const Leaf = require('./merkleLeaf.js');

module.exports = class MerkleTree {
  constructor(data) {
    // pass in thread.content()
    // must be pairs of 32-byte hashes
    if (data.byteLength % 64 !== 0 || data.byteLength === 0) throw ErrorType.Data.length();

    // total count of items
    const count = data.byteLength / 32;

    // array of uint8arrays
    let builtArray = [];

    // maps hashes to their index in the tree for fast lookup
    this.indexMap = new HashMap();
    for (let i = 0; i < count; i += 1) {
      // each post and thread is an item
      const item = data.subarray(i * 32, (i + 1) * 32);
      this.indexMap.setRaw(item, i);
      builtArray.push(new Leaf(item));
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
        newArray.push(new Node(builtArray[i * 2], builtArray[(i * 2) + 1]));
      }

      // builtArray now represents the next level of the tree
      builtArray = newArray;
      this.depth += 1;
    } while (builtArray.length > 1);

    this.root = builtArray[0];
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
    const idxArr = idx.toString(2).split('').map(num => parseInt(num, 10));
    while (idxArr.length < this.depth - 1) {
      idxArr.unshift(0);
    }
    return this.root.index(idxArr);
    // split index into binary array
    // traverse tree
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
