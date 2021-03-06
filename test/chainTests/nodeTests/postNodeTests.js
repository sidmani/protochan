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

const tap = require('tap');
const ErrorType = require('../../../src/core/error.js');
const PostNode = require('../../../src/core/chain/node/postNode.js');
const HashMap = require('../../../src/core/hash/hashMap.js');

tap.test('PostNode constructor and setters', (t) => {
  const header = {
    hash: '01020304',
    dataHash: 'fb571f7334867ed0152487f432bd49041e3fb68dc0b5465bfde56f0a59d67c74',
    timestamp() { return 12; },
  };
  const data = new Uint8Array([6, 0, 0, 0, 0, 0]);
  const nodeMap = new HashMap();
  const config = {
    MIN_THREAD_DIFFICULTY: 24,
    MAX_THREAD_DIFFICULTY: 64,
    MAX_THREAD_COUNT: 11,
  };
  let n;
  t.doesNotThrow(() => { n = new PostNode(header, data, nodeMap, config); });
  t.strictSame(n.data.controlLength, 6, 'PostNode creates parser');

  n.setSegmentHeight(5);
  t.equal(n.segmentHeight, 5, 'PostNode sets segment height');
  n.setHeight(12);
  t.equal(n.height, 12, 'PostNode sets height');
  n.setThread(new Uint8Array([4, 5, 6]));
  t.strictSame(n.thread, new Uint8Array([4, 5, 6]), 'PostNode sets thread hash');
  t.end();
});

tap.test('PostNode add thread methods', (t) => {
  const header = {
    hash: '01020304',
    dataHash: 'fb571f7334867ed0152487f432bd49041e3fb68dc0b5465bfde56f0a59d67c74',
    timestamp() { return 12; },
  };
  const data = new Uint8Array([6, 0, 0, 0, 0, 0]);
  const nodeMap = new HashMap();
  const config = {
    MIN_THREAD_DIFFICULTY: 24,
    MAX_THREAD_DIFFICULTY: 64,
    MAX_THREAD_COUNT: 11,
  };
  const n = new PostNode(header, data, nodeMap, config);
  n.height = 5;
  n.thread = new Uint8Array([4, 5, 8]);
  let thread = {
    timestamp() { return 10; },
  };
  t.throws(() => n.checkThread(thread), ErrorType.timeTravel(), 'PostNode rejects invalid thread timestamp order');
  thread = {
    hash: '080705',
    setThreadHeight(thr, height) {
      this.setThread = thr;
      this.setHeight = height;
    },
    timestamp() { return 975339; },
  };
  t.doesNotThrow(() => n.checkThread(thread), 'PostNode accepts valid thread timestamp order');
  n.insertThread(thread);
  t.strictSame(thread.setThread, new Uint8Array([4, 5, 8]), 'PostNode sets height of thread in thread block');
  t.strictSame(thread.setHeight, 5, 'PostNode sets height of thread in thread block');
  t.equal(n.children.get(new Uint8Array([8, 7, 5])), true, 'PostNode sets thread as child');
  t.end();
});

tap.test('PostNode add post methods', (t) => {
  const header = {
    hash: '01020304',
    dataHash: 'fb571f7334867ed0152487f432bd49041e3fb68dc0b5465bfde56f0a59d67c74',
    timestamp() { return 12; },
  };
  const data = new Uint8Array([6, 0, 0, 0, 0, 0]);
  const nodeMap = new HashMap();
  const config = {
    MIN_POST_DIFFICULTY: 10,
    MAX_POST_DIFFICULTY: 40,
  };
  const n = new PostNode(header, data, nodeMap, config);
  n.segmentHeight = 4;
  n.height = 12;
  n.thread = new Uint8Array([4, 23, 4]);

  t.throws(() => { n.addChild({ type() { return 0x00; } }); }, ErrorType.illegalNodeType(), 'Post rejects genesis in addChild');
  t.throws(() => { n.addChild({ type() { return 0x01; } }); }, ErrorType.illegalNodeType(), 'Post rejects thread in addChild');
  t.throws(() => { n.addChild({ type() { return 0x02; } }); }, ErrorType.illegalNodeType(), 'Post rejects originalPost in addChild');

  const child = {
    type() { return 0x03; },
    timestamp() { return 22; },
    hash: '0B11E7',
    header: {
      difficulty: 19,
    },
    setSegmentHeight(h) {
      this.segmentHeight = h;
    },
    setHeight(h) {
      this.height = h;
    },
    setThread(thr) {
      this.thread = thr;
    },
  };
  t.throws(() => { n.addChild(child); }, ErrorType.insufficientDifficulty(), 'Post rejects insufficient difficulty');
  child.header.difficulty = 21;
  t.doesNotThrow(() => { n.addChild(child); }, 'Post accepts sufficient difficulty');
  t.equal(child.segmentHeight, 5, 'Post sets segment height on child');
  t.equal(child.height, 13, 'Post sets height on child');
  t.strictSame(child.thread, new Uint8Array([4, 23, 4]), 'Post sets thread on child');
  t.end();
});
