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
const HeaderType = require('./header/type.js');
const ErrorType = require('../error.js');
const Config = require('./config.js');

const GenesisNode = require('./node/genesisNode.js');
const OriginalPostNode = require('./node/originalPostNode.js');
const ThreadNode = require('./node/threadNode.js');
const PostNode = require('./node/postNode.js');

const Pool = require('./pool.js');

module.exports = class Chain {
  constructor(header, data) {
    this.nodeMap = new HashMap();
    this.config = new Config(data);
    this.pool = new Pool();

    this.root = new GenesisNode(
      header,
      data,
      this.nodeMap,
      this.config,
    );

    this.nodeMap.setStringified(this.root, this.root.hash);
  }

  // get(blockHash) {
  //   return this.nodeMap.get(blockHash);
  // }

  createNode(header, data) {
    switch (header.type()) {
      case HeaderType.THREAD:
        return new ThreadNode(header, data, this.nodeMap, this.config);
      case HeaderType.POST:
        return new PostNode(header, data, this.nodeMap, this.config);
      case HeaderType.ORIGINAL_POST:
        return new OriginalPostNode(header, data, this.nodeMap, this.config);
      default: throw ErrorType.illegalNodeType();
    }
  }

  add(header, data) {
    const node = this.createNode(header, data);
    this.resolve(node);
  }

  resolve(node) {
    this.pool.traverse(node, (next) => {
      // attempt to add it to the chain
      this.addChild(next);
      // remove the dependents from pool
      this.pool.clearDependents(next.hash);
    }, (next, error) => {
      if (error.type === ErrorType.missingReference().type) {
        // dependents of next are not yet proven invalid
        this.pool.addDependent(next, error.ref);
      } else {
        // next is invalid, so its dependents are invalid
        this.pool.recursivelyClearDependents(next.hash);
      }
    });
  }

  addChild(node) {
    const prevNode = this.getStringified(node.header.prevHash);
    if (!prevNode) {
      throw ErrorType.missingReference(prevNode.hash);
    }
    prevNode.addChild(node);
  }
};
