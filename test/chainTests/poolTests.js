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
const Pool = require('../../src/core/chain/pool.js');

tap.test('Pool', (t) => {
  const p = new Pool();
  t.strictSame(p.getDependents(new Uint8Array([5])), [], 'Pool returns empty array if no dependents');
  const node1 = { hash: new Uint8Array([1]) };
  const node2 = { hash: new Uint8Array([2]) };
  const node3 = { hash: new Uint8Array([3]) };
  const node4 = { hash: new Uint8Array([4]) };
  const baseNode = { hash: new Uint8Array([255]) };
  // node1 and node 2 depend on hash [255]
  p.addDependent(node1, baseNode.hash);
  p.addDependent(node2, baseNode.hash);
  // node 3 depends on 2
  p.addDependent(node3, node2.hash);
  // node 4 depends on 1
  p.addDependent(node4, node1.hash);

  // dependents of [255] are node1, node2
  t.strictSame(p.getDependents(new Uint8Array([255])), [node1, node2]);

  // test a simple traversal (no reassignment)
  const simpleTraversal = [];
  p.traverse(baseNode, (next) => {
    simpleTraversal.push(next);
  });

  t.strictSame(simpleTraversal, [
    baseNode, // first node
    node2, // last dependent of first node
    node3,
    node1,
    node4,
  ], 'Traversal processes all dependents recursively');

  const complicatedTraversal = [];
  let firstPass = true;
  p.traverse(baseNode, (next) => {
    complicatedTraversal.push(next);
    if (next === node2 && firstPass) {
      firstPass = false;
      throw new Error('node 2 depends on node 4');
    }
  }, () => {
    p.addDependent(node2, node4.hash);
  });

  t.strictSame(complicatedTraversal, [
    baseNode,
    node2,
    node1,
    node4,
    node2,
    node3,
  ], 'Traversal works after further dependencies are resolved');

  p.recursivelyClearDependents(baseNode);
  t.equal(p.pool.size(), 0, 'Recursive clearing works');
  t.end();
});
