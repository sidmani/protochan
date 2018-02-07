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

var ErrorType = require('../../error.js');
var Node = require('./merkleNode.js');
var Leaf = require('./merkleLeaf.js');

module.exports = class MerkleTree {
  constructor(data) {
    // pass in thread.content()
    if (!(data instanceof Uint8Array)) throw ErrorType.Parameter.type();

    // must be pairs of 32-byte hashes
    if (data.byteLength % 64 !== 0) throw ErrorType.Data.length();

    // count is 2*num threads
    let count = data.byteLength / 32;

    // array of uint8arrays
    let builtArray = new Array();

    for (let i = 0; i < count; i++) {
      // every post and thread is a leaf
      builtArray.push(new Leaf(data.subarray(i*32, i*32 + 32)));
    }

    this.depth = 1;
    do {
      let newArray = new Array();
      for (let i = 0; i < builtArray.length/2; i++) {
        // pair the 2i and 2i+1 indices
        // if builtArray.length is odd, length/2 will have a 0.5
        // so the last index i*2+1 will be undefined
        // this is not a problem, since the MerkleNode handles that
        // case and duplicates the hash
        newArray.push(new Node(builtArray[i*2], builtArray[i*2+1]));
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

  index(idx) {
    let idxArr = idx.toString(2).split('').map(num => parseInt(num));
    while (idxArr.length < this.depth - 1) {
      idxArr.unshift(0);
    }
    return this.root.index(idxArr);
    // split index into binary array
    // traverse tree
  }

  prune() {
    this.root.prune();
  }
}
