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

const Hash = require('../blake2s.js');
const HashMap = require('../hashMap.js');

module.exports = class Node {
  constructor(childA, childB = childA) {
    this.map = new HashMap();

    this.map.set(childA);
    // set childB with overwrite allowed since b = a if b undef
    this.map.setRaw(childB.hash, childB, true);

    const concat = new Uint8Array(64);

    concat.set(childA.hash, 0);
    concat.set(childB.hash, 32);

    this.hash = Hash.digest(concat);
  }

  path(intermediates) {
    // retrieve a key by its intermediate hashes
    if (intermediates.length === 0) { return undefined; }
    const nextNode = this.map.get(intermediates[0]);
    return nextNode.path(intermediates.slice(1));
  }

  prune() {
    this.map.forEach(child => child.prune());
  }

  // idx as bit array
  index(idx) {
    const nextNode = this.map.enumerate()[idx[0]];
    if (nextNode) {
      return nextNode.index(idx.slice(1));
    }
    return undefined;
  }
};
