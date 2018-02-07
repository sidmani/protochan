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

var Hash = require('../blake2s.js');
var HashMap = require('../hashMap.js');

module.exports = class Node {
  constructor(childA, childB) {
    this.map = new HashMap();

    this.map.set(childA);

    let concat = new Uint8Array(64);
    concat.set(childA.hash, 0);

    if (childB) {
      this.map.set(childB);

      childA.sibling = childB;
      childB.sibling = childA;
      concat.set(childB.hash, 32);
    } else {
      // this node is on the right edge of the tree
      // second child does not exist
      // duplicate first child hash
      concat.set(childA.hash, 32);
    }

    this.hash = Hash.digest(concat);
  }

  path(intermediates) {
    // retrieve a key by its intermediate hashes
    if (intermediates.length === 0) { return undefined; }
    let nextNode = this.map.get(intermediates[0]);
    return nextNode.path(intermediates.slice(1));
  }

  prune() {
    this.map.forEach(child => child.prune());
  }

  // idx as bit array
  index(idx) {
    let nextNode = this.map.enumerate()[idx[0]];
    if (nextNode) {
      return nextNode.index(idx.slice(1));
    } else {
      return undefined;
    }
  }
};
