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

const MerkleTree = require('../../src/core/hash/merkleTree.js');
const Hash = require('../../src/core/hash/blake2s.js');

const tap = require('tap');
const ErrorType = require('../../src/core/error.js');

tap.test('MerkleTree', (t) => {
  t.throws(() => new MerkleTree([]), ErrorType.dataLength(), 'Merkle tree rejects zero length array');

  const data = new Uint8Array(192);
  data.fill(1, 0, 32);
  data.fill(2, 32, 64);
  data.fill(3, 64, 96);
  data.fill(4, 96, 128);
  data.fill(5, 128, 160);
  data.fill(6, 160, 192);

  const level3 = [
    data.subarray(0, 32),
    data.subarray(32, 64),
    data.subarray(64, 96),
    data.subarray(96, 128),
    data.subarray(128, 160),
    data.subarray(160, 192),
  ];

  const concat31 = new Uint8Array(64);
  concat31.set(Hash.digest(level3[0]), 0);
  concat31.set(Hash.digest(level3[1]), 32);

  const concat32 = new Uint8Array(64);
  concat32.set(Hash.digest(level3[2]), 0);
  concat32.set(Hash.digest(level3[3]), 32);

  const concat33 = new Uint8Array(64);
  concat33.set(Hash.digest(level3[4]), 0);
  concat33.set(Hash.digest(level3[5]), 32);

  const level2 = [
    Hash.digest(concat31),
    Hash.digest(concat32),
    Hash.digest(concat33),
  ];

  const concat1 = new Uint8Array(64);
  concat1.set(level2[0], 0);
  concat1.set(level2[1], 32);

  const concat2 = new Uint8Array(64);
  concat2.set(level2[2], 0);
  concat2.set(level2[2], 32);

  const level1 = [
    Hash.digest(concat1),
    Hash.digest(concat2),
  ];

  const concat3 = new Uint8Array(64);
  concat3.set(level1[0], 0);
  concat3.set(level1[1], 32);

  const expectedRoot = Hash.digest(concat3);

  const tree = new MerkleTree(level3);

  t.strictSame(tree.root, expectedRoot, 'Merkle tree sets root correctly');
  // let expectedArr = new Uint8Array(32);
  // expectedArr.fill(3, 0, 32);
  // t.strictSame(
  // tree.get([level1[0], level2[1], level3[2]]),
  // expectedArr,
  // 'Merkle tree gets object from intermediate path');
  t.equal(tree.depth, 4, 'Tree sets depth');
  t.end();
});
