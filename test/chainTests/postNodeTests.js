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
const ErrorType = require('../../js/error.js');
const PostNode = require('../../js/chain/node/postNode.js');
const HashMap = require('../../js/hash/hashMap.js');

tap.test('PostNode constructor and setters', (t) => {
  const header = {
    hash: new Uint8Array([1, 2, 3, 4]),
    dataHash() {
      return new Uint8Array([
        251, 87, 31, 115, 52, 134, 126, 208,
        21, 36, 135, 244, 50, 189, 73, 4,
        30, 63, 182, 141, 192, 181, 70, 91,
        253, 229, 111, 10, 89, 214, 124, 116,
      ]);
    },
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
    hash: new Uint8Array([1, 2, 3, 4]),
    dataHash() {
      return new Uint8Array([
        251, 87, 31, 115, 52, 134, 126, 208,
        21, 36, 135, 244, 50, 189, 73, 4,
        30, 63, 182, 141, 192, 181, 70, 91,
        253, 229, 111, 10, 89, 214, 124, 116,
      ]);
    },
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

  let thread = { timestamp() { return 10; } };
  t.throws(() => n.checkThread(thread), ErrorType.timeTravel(), 'PostNode rejects invalid thread timestamp order');
  thread = { timestamp() { return 975339; } };
  t.doesNotThrow(() => n.checkThread(thread), 'PostNode accepts valid thread timestamp order');

  t.end();
});
