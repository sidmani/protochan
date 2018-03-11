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

module.exports = class Pool {
  constructor() {
    this.pool = new HashMap();
    // this.blacklist = new HashMap();
  }

  addDependent(dependentNode, dependencyHash) {
    if (this.pool.containsStringified(dependencyHash)) {
      this.pool.getStringified(dependencyHash).push(dependentNode);
    } else {
      this.pool.setStringified([dependentNode], dependencyHash);
    }
  }

  getDependents(hash) {
    return this.pool.getStringified(hash) || [];
  }

  clearDependents(hash) {
    this.pool.unsetStringified(hash);
  }

  recursivelyClearDependents(node) {
    this.traverse(node, (next) => {
      this.clearDependents(next.hash);
    });
  }

  traverse(node, fn, onErr = () => {}) {
    let dependents = [node];

    while (dependents.length > 0) {
      const next = dependents.pop();
      const nextDependents = this.getDependents(next.hash);
      try {
        fn(next);
        dependents = dependents.concat(nextDependents);
      } catch (error) {
        onErr(next, error);
      }
    }
  }
};
