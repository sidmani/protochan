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

var MerkleTree = require('../../js/hash/merkleTree.js');
var Hash = require('../../js/hash/blake2s.js');

var t = require('tap');
var ErrorType = require('../../js/error.js');

t.test('MerkleTree', function(t) {
  t.throws(function() { new MerkleTree([]); }, ErrorType.Data.length(), 'Merkle tree rejects zero length array');

  let data = new Uint8Array(192);
  data.fill(1, 0, 32);
  data.fill(2, 32, 64);
  data.fill(3, 64, 96);
  data.fill(4, 96, 128);
  data.fill(5, 128, 160);
  data.fill(6, 160, 192);

  let level3 = [
    data.subarray(0, 32),
    data.subarray(32, 64),
    data.subarray(64, 96),
    data.subarray(96, 128),
    data.subarray(128, 160),
    data.subarray(160, 192)
  ];

  let concat3_1 = new Uint8Array(64);
  concat3_1.set(Hash.digest(level3[0]), 0);
  concat3_1.set(Hash.digest(level3[1]), 32);

  let concat3_2 = new Uint8Array(64);
  concat3_2.set(Hash.digest(level3[2]), 0);
  concat3_2.set(Hash.digest(level3[3]), 32);

  let concat3_3 = new Uint8Array(64);
  concat3_3.set(Hash.digest(level3[4]), 0);
  concat3_3.set(Hash.digest(level3[5]), 32);

  let level2 = [
    Hash.digest(concat3_1),
    Hash.digest(concat3_2),
    Hash.digest(concat3_3)
  ];

  let concat1 = new Uint8Array(64);
  concat1.set(level2[0], 0);
  concat1.set(level2[1], 32);

  let concat2 = new Uint8Array(64);
  concat2.set(level2[2], 0);
  concat2.set(level2[2], 32);

  let level1 = [
    Hash.digest(concat1),
    Hash.digest(concat2)
  ];

  let concat3 = new Uint8Array(64);
  concat3.set(level1[0], 0);
  concat3.set(level1[1], 32);

  let expectedRoot = Hash.digest(concat3);

  let tree = new MerkleTree(level3);

  t.strictSame(tree.root, expectedRoot, 'Merkle tree sets root correctly');
  // let expectedArr = new Uint8Array(32);
  // expectedArr.fill(3, 0, 32);
  // t.strictSame(tree.get([level1[0], level2[1], level3[2]]), expectedArr, 'Merkle tree gets object from intermediate path');
  t.equal(tree.depth, 4, 'Tree sets depth');
  t.end();
});
