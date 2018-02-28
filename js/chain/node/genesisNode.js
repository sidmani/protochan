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

const BlockType = require('../../header/type.js');
const ErrorType = require('../../error.js');
const BlockNode = require('./blockNode.js');
const Parser = require('../../parser/genesisParser.js');

module.exports = class GenesisNode extends BlockNode {
  constructor(header, data, nodeMap, config) {
    const parser = new Parser(data);
    super(header, parser, nodeMap, config);
  }

  addChild(node) {
    switch (node.type()) {
      case BlockType.THREAD: {
        const op = this.checkThread(node);

        node.setHeight(1);
        op.insertThread(node);
        break;
      }
      case BlockType.ORIGINAL_POST: {
        this.checkPostDifficulty(node);
        break;
      }
      default: throw ErrorType.illegalNodeType();
    }

    super.addChild(node);
  }

  checkThread(thread) {
    // the first thread block must contain exactly 1 record
    if (thread.data.numRecords !== 1) {
      throw ErrorType.unknownThread();
    }

    // check difficulty of thread hash
    this.checkThreadDifficulty(thread, 0);

    // check that the thread's original post hash points to
    // a valid child of this node
    const opHash = thread.data.getThread(0);

    const op = this.nodeMap.get(opHash);
    // if the referenced post doesn't exist, error
    if (!op) {
      throw ErrorType.missingReference(opHash);
    }

    // if the referenced post is not a child of this node, error
    if (!this.children.contains(opHash)) {
      throw ErrorType.invalidChild();
    }

    // if the type is invalid, error
    if (op.type() !== BlockType.ORIGINAL_POST) {
      throw ErrorType.illegalNodeType();
    }

    op.checkThread(thread);
    return op;
  }
};
