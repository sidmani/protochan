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

const BlockType = require('../header/type.js');
const ErrorType = require('../../error.js');
const BlockNode = require('./blockNode.js');
const Parser = require('../parser/postParser.js');

module.exports = class PostNode extends BlockNode {
  constructor(header, data, nodeMap, config) {
    const parser = new Parser(data);
    super(header, parser, nodeMap, config);
  }
  // score the containing thread assuming this post is at the top
  score(depth) {
    return (this.segmentHeight / (this.height + 1)) - (depth / this.config.MAX_THREAD_COUNT);
  }

  // segmentHeight is the # of posts since the last thread block
  setSegmentHeight(height) {
    this.segmentHeight = height;
  }

  // height is the total # of posts in this thread
  setHeight(height) {
    this.height = height;
  }

  // the thread that this post is contained in
  setThread(thread) {
    this.thread = thread;
  }

  addChild(node) {
    if (node.type() !== BlockType.POST) {
      throw ErrorType.illegalNodeType();
    }
    this.checkPostDifficulty(node);
    node.setSegmentHeight(this.segmentHeight + 1);
    node.setHeight(this.height + 1);
    node.setThread(this.thread);
    super.addChild(node);
  }

  checkThread(thread) {
    // TODO: do we need to check hash here?
    if (this.timestamp() >= thread.timestamp()) {
      throw ErrorType.timeTravel();
    }
  }

  insertThread(thread) {
    thread.setThreadHeight(this.thread, this.height);
    super.addChild(thread);
  }
};
