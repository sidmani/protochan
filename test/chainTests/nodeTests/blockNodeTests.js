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
const BlockNode = require('../../../src/core/chain/node/blockNode.js');

tap.test('BlockNode', (t) => {
  const header = {
    type() {
      return 0x03;
    },
    timestamp() {
      return 0xAB;
    },
    dataHash() {
      return new Uint8Array([0, 1, 5]);
    },
    hash: new Uint8Array([8, 4, 7, 9]),
  };

  const data = {
    hash: new Uint8Array([0, 2]),
  };

  t.throws(
    () => new BlockNode(header, data),
    ErrorType.dataHash(),
    'BlockNode checks that header.dataHash and data.hash match',
  );

  data.hash = header.dataHash();
  const nodeMap = {
    set(v) {
      this.setObj = v;
    },
  };
  const node = new BlockNode(header, data, nodeMap, 'abcd');

  t.equal(node.header, header, 'BlockNode sets header');
  t.equal(node.data, data, 'BlockNode sets data');
  t.equal(node.nodeMap, nodeMap, 'BlockNode sets nodeMap');
  t.equal(node.config, 'abcd', 'BlockNode sets config');

  t.equal(node.type(), 0x03, 'BlockNode gets type');
  t.equal(node.timestamp(), 0xAB, 'BlockNode gets timestamp');

  t.strictSame(node.hash, header.hash, 'BlockNode sets hash');

  const child = {
    hash: new Uint8Array([5, 4, 3]),
  };
  node.addChild(child);
  t.equal(nodeMap.setObj, child, 'BlockNode.addChild inserts into nodeMap');
  t.end();
});

// t.test('BlockNode.checkPrevHash', t => {
//   const header = {
//     type() {
//       return 0x03;
//     },
//     dataHash() {
//       return new Uint8Array([0, 1, 5]);
//     },
//     hash: new Uint8Array([8, 4, 7, 9])
//   };
//
//   const data = {
//     hash: new Uint8Array([0, 1, 5])
//   };
//
//   const n = new BlockNode(header, data, 'abcd');
//   t.throws(() => {
//     const bad = {
//       header: {
//         prevHash() { return new Uint8Array([8, 4, 7, 5]); }
//       }
//     }
//     n.checkPrevHash(bad);
//   }, ErrorType.hashMismatch(), 'BlockNode.checkPrevHash rejects mismatched hashes');
//
//   t.doesNotThrow(() => {
//     const good = {
//       header: {
//         prevHash() {
//           return new Uint8Array([8, 4, 7, 9]);
//         }
//       }
//     }
//     n.checkPrevHash(good);
//   }, 'BlockNode.checkPrevHash accepts matched hashes');
//
//   t.end();
// });

tap.test('BlockNode.checkPostDifficulty', (t) => {
  const header = {
    dataHash() {
      return new Uint8Array([0, 1, 5]);
    },
    timestamp() {
      return 5;
    },
  };

  const data = {
    hash: new Uint8Array([0, 1, 5]),
  };

  const n = new BlockNode(header, data, 'abcd', {
    MIN_POST_DIFFICULTY: 10,
    MAX_POST_DIFFICULTY: 40,
  });

  t.throws(() => {
    n.checkPostDifficulty({ timestamp() { return 4; } });
  }, ErrorType.timeTravel(), 'checkPostDifficulty checks timestamp ordering');

  t.throws(() => {
    n.checkPostDifficulty({
      header: {
        difficulty: 19,
      },
      timestamp() { return 15; },
    });
  }, ErrorType.insufficientDifficulty(), 'checkPostDifficulty rejects insufficient difficulty');

  t.doesNotThrow(() => {
    n.checkPostDifficulty({
      header: {
        difficulty: 21,
      },
      timestamp() { return 15; },
    });
  }, 'checkPostDifficulty accepts sufficient difficulty');
  t.end();
});

tap.test('BlockNode.checkThreadDifficulty', (t) => {
  const header = {
    dataHash() {
      return new Uint8Array([0, 1, 5]);
    },
    timestamp() {
      return 5;
    },
  };

  const data = {
    hash: new Uint8Array([0, 1, 5]),
  };

  const n = new BlockNode(header, data, 'abcd', {
    MIN_THREAD_DIFFICULTY: 24,
    MAX_THREAD_DIFFICULTY: 64,
    MAX_THREAD_COUNT: 255,
  });

  t.throws(() => {
    n.checkThreadDifficulty({ timestamp() { return 4; } }, 0);
  }, ErrorType.timeTravel(), 'checkThreadDifficulty checks timestamp ordering');

  t.throws(() => {
    n.checkThreadDifficulty({
      header: {
        difficulty: 25,
      },
      timestamp() { return 305; },
    }, 255, true);
  }, ErrorType.insufficientDifficulty(), 'checkThreadDifficulty rejects insufficient difficulty');

  t.doesNotThrow(() => {
    n.checkThreadDifficulty({
      header: {
        difficulty: 26,
      },
      timestamp() { return 305; },
    }, 255);
  }, 'checkThreadDifficulty accepts sufficient difficulty');
  t.end();
});
