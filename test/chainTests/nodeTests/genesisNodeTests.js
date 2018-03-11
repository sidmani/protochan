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
const GenesisNode = require('../../../src/core/chain/node/genesisNode.js');
const HashMap = require('../../../src/core/hash/hashMap.js');

tap.test('GenesisNode constructor', (t) => {
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
  t.doesNotThrow(() => { n = new GenesisNode(header, data, nodeMap, config); });
  t.strictSame(n.data.maxThreads, 1, 'GenesisNode creates parser');
  t.end();
});

tap.test('GenesisNode.checkThread', (t) => {
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

  const n = new GenesisNode(header, data, nodeMap, config);
  const thread = {
    data: {
      numRecords: 2,
      getThread(idx) {
        return new Uint8Array([idx, 5, 6, 7]);
      },
    },
    header: {
      difficulty: 44,
    },
    hash: '01020509',
    type() { return 0x01; },
    timestamp() { return 312; },
    setHeight(height) { this.height = height; },
  };

  t.throws(
    () => { n.checkThread(thread); },
    ErrorType.unknownThread(),
    'checkThread rejects numRecords != 1',
  );
  thread.data.numRecords = 1;
  t.throws(
    () => { n.checkThread(thread); },
    ErrorType.insufficientDifficulty(),
    'checkThread rejects insufficient difficulty',
  );
  thread.header.difficulty = 45;
  t.throws(
    () => { n.checkThread(thread); },
    ErrorType.missingReference(new Uint8Array([0, 5, 6, 7])),
    'checkThread rejects missing original post',
  );

  nodeMap.set({
    type() { return 0x00; },
  }, new Uint8Array([0, 5, 6, 7]));

  t.throws(
    () => { n.checkThread(thread); },
    ErrorType.invalidChild(),
    'checkThread rejects non-child original post',
  );

  n.children.set(true, new Uint8Array([0, 5, 6, 7]));

  t.throws(
    () => { n.checkThread(thread); },
    ErrorType.illegalNodeType(),
    'checkThread rejects illegal original post type',
  );

  let opCheckedThread = false;
  let opInsertedThread = false;
  const op = {
    type() { return 0x02; },
    checkThread() { opCheckedThread = true; },
    insertThread() { opInsertedThread = true; },
  };
  nodeMap.set(op, new Uint8Array([0, 5, 6, 7]), true);
  t.doesNotThrow(() => { n.checkThread(thread); }, 'checkThread accepts valid thread');
  t.assert(opCheckedThread, 'checkThread runs original post\'s checks');
  t.equal(n.checkThread(thread), op, 'checkThread returns original post');

  t.doesNotThrow(() => { n.addChild(thread); }, 'GenesisNode adds child thread');
  t.assert(opInsertedThread, 'addChild inserts on original post');
  t.equal(thread.height, 1, 'addChild sets thread height to one');
  t.equal(nodeMap.getStringified(thread.hash), thread, 'addChild adds to node map');
  t.equal(n.children.getStringified(thread.hash), true, 'addChild adds to children');
  t.end();
});

tap.test('GenesisNode.addChild original post', (t) => {
  t.end();
});
