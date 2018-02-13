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

var MerkleTree = require('../../js/hash/merkleTree/merkleTree.js');
var MerkleLeaf = require('../../js/hash/merkleTree/merkleLeaf.js');
var MerkleNode = require('../../js/hash/merkleTree/merkleNode.js');
var Hash = require('../../js/hash/blake2s.js');

var t = require('tap');
var ErrorType = require('../../js/error.js');

t.test('MerkleLeaf', function(t) {
  let data = new Uint8Array(64);
  let leaf = new MerkleLeaf(data);
  let hash = Hash.digest(data);
  t.strictSame(leaf.hash, hash, 'Leaf returns correct data hash');
  t.strictSame(leaf.path(), data, 'Leaf returns data for path');
  t.strictSame(leaf.index(), data, 'Leaf returns data for index');
  leaf.prune();
  t.equal(leaf.data, true, 'Leaf clears data on prune');
  t.end();
});

t.test('MerkleNode (2 children)', function(t) {
  let dataA = new Uint8Array(64);
  dataA.fill(1, 0, 64);
  let childA = new MerkleLeaf(dataA);
  let dataB = new Uint8Array(64);
  dataB.fill(2, 0, 64);
  let childB = new MerkleLeaf(dataB);
  let node = new MerkleNode(childA, childB);

  let concat = new Uint8Array(64);
  let hashA = Hash.digest(dataA);
  let hashB = Hash.digest(dataB);
  concat.set(hashA, 0);
  concat.set(hashB, 32);

  t.equal(childA.sibling, childB, 'Node sets sibling on childA');
  t.equal(childB.sibling, childA, 'Node sets sibling on childB');
  t.strictSame(node.hash, Hash.digest(concat), 'Node returns correct hash');
  t.strictSame(node.path([hashB]), dataB, 'Node returns correct data for path');
  t.equal(node.path([]), undefined, 'Node returns undefined for empty path');
  t.strictSame(node.index([0, 0]), dataA, 'Node returns childA for 0 index');
  t.strictSame(node.index([1, 0]), dataB, 'Node returns childB for 1 index');
  node.prune();
  t.equal(childA.data, true, 'Node prunes childA');
  t.equal(childB.data, true, 'Node prunes childB');

  t.end();
});

t.test('MerkleNode (1 child)', function(t) {
  let dataA = new Uint8Array(64);
  dataA.fill(1, 0, 64);
  let childA = new MerkleLeaf(dataA);

  let concat = new Uint8Array(64);
  let hashA = Hash.digest(dataA);
  concat.set(hashA, 0);
  concat.set(hashA, 32);
  let node = new MerkleNode(childA);

  t.equal(childA.sibling, undefined, 'Node does not set sibling for childA');
  t.strictSame(node.hash, Hash.digest(concat), 'Node returns  hash of duplicated child hash');
  t.strictSame(node.path([hashA]), dataA, 'Node returns correct data for path');
  t.strictSame(node.index([0]), dataA, 'Node returns childA for 0 index');
  t.equal(node.index([1, 0]), undefined, 'Node returns undefined for 1 index');
  node.prune();
  t.equal(childA.data, true, 'Node prunes childA');

  t.end();
});

t.test('MerkleTree', function(t) {
  t.throws(function() { new MerkleTree(new Uint8Array(65)); }, ErrorType.Data.length(), 'Merkle tree rejects wrong data length');
  t.throws(function() { new MerkleTree(new Uint8Array(0)); }, ErrorType.Data.length(), 'Merkle tree rejects zero length array');
  t.throws(function() { new MerkleTree(new Uint8Array(64)); }, ErrorType.HashMap.duplicate(), 'Merkle tree rejects duplicate hashes');

  let data = new Uint8Array(192);
  data.fill(1, 0, 32);
  data.fill(2, 32, 64);
  data.fill(3, 64, 96);
  data.fill(4, 96, 128);
  data.fill(5, 128, 160);
  data.fill(6, 160, 192);

  let level3 = [
    Hash.digest(data.subarray(0, 32)),
    Hash.digest(data.subarray(32, 64)),
    Hash.digest(data.subarray(64, 96)),
    Hash.digest(data.subarray(96, 128)),
    Hash.digest(data.subarray(128, 160)),
    Hash.digest(data.subarray(160, 192))
  ];

  let concat3_1 = new Uint8Array(64);
  concat3_1.set(level3[0], 0);
  concat3_1.set(level3[1], 32);

  let concat3_2 = new Uint8Array(64);
  concat3_2.set(level3[2], 0);
  concat3_2.set(level3[3], 32);

  let concat3_3 = new Uint8Array(64);
  concat3_3.set(level3[4], 0);
  concat3_3.set(level3[5], 32);

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

  let tree = new MerkleTree(data);

  t.strictSame(tree.root.hash, expectedRoot, 'Merkle tree sets root correctly');
  let expectedArr = new Uint8Array(32);
  expectedArr.fill(3, 0, 32);
  t.strictSame(tree.index(2), expectedArr, 'Merkle tree gets object at index');
  t.strictSame(tree.get([level1[0], level2[1], level3[2]]), expectedArr, 'Merkle tree gets object from intermediate path');

  t.equal(tree.indexOf(expectedArr), 2, 'Merkle tree gets index of object');

  t.equal(tree.depth, 4);
  tree.prune();
  t.equal(tree.index(2), true, 'Merkle tree prunes data');
  t.equal(tree.isPruned, true, 'Merkle tree sets isPruned');
  t.end();
});

t.test('Merkle Tree.difference', function(t) {
  let data1 = new Uint8Array(192);
  data1.fill(1, 0, 32);
  data1.fill(2, 32, 64);
  data1.fill(3, 64, 96);
  data1.fill(4, 96, 128);
  data1.fill(5, 128, 160);
  data1.fill(6, 160, 192);
  let tree1 = new MerkleTree(data1);

  let data2 = new Uint8Array(192);
  data2.fill(3, 0, 32);
  data2.fill(2, 32, 64);
  data2.fill(1, 64, 96);
  data2.fill(7, 96, 128);
  data2.fill(9, 128, 160);
  data2.fill(4, 160, 192);
  let tree2 = new MerkleTree(data2);

  let expected = [
    new Uint8Array(32),
    new Uint8Array(32)
  ];

  expected[0].fill(5, 0, 32);
  expected[1].fill(6, 0, 32);
  t.strictSame(tree1.difference(tree2), expected, 'Merkle Tree.difference');
  expected.pop(); // remove 6 array
  t.strictSame(tree1.difference(tree2, function(key, index) {
    return index % 2 === 0;
  }), expected, 'Merkle Tree.difference with filter');
  t.end();
});
