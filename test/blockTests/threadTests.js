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

var Thread = require('../../js/block/thread/thread.js');
var common = require('../testCommon.js');
var t = require('tap');
var ErrorType = require('../../js/error.js');

t.test('Thread block validates block type', function(t) {
  let buf = new ArrayBuffer(69);
  let view = new DataView(buf);
  view.setUint32(0, 0x0300401D);
  view.setUint8(64, 0x06);
  view.setUint8(68, 0x04);

  let header = common.validThreadHeaderFromData(buf);
  header.data[2] = 0x01;
  t.throws(function() { new Thread(header, new Uint8Array(buf)); }, ErrorType.Block.type(), 'Thread block rejects wrong block type');
  header.data[2] = 0x00;
  t.doesNotThrow(function() { new Thread(header, new Uint8Array(buf)); }, 'Thread block accepts correct block type');
  t.end();
});

t.test('Thread block validates data length', function(t) {
  let buf = new ArrayBuffer(70);
  let view = new DataView(buf);
  view.setUint32(0, 0x0300411D);
  view.setUint8(64, 0x06);
  view.setUint8(69, 0x04);
  let header = common.validHeaderFromData(buf);
  t.throws(function() { new Thread(header, new Uint8Array(buf)); }, ErrorType.Data.length(), 'Thread block rejects wrong block type');
  t.end();
});


t.test('Thread block validates data hash', function(t) {
  let buf = new ArrayBuffer(69);
  let arr = new Uint8Array(buf);
  let view = new DataView(buf);
  view.setUint32(0, 0x0300401D);
  view.setUint8(64, 0x06);
  view.setUint8(68, 0x04);

  let header = common.validThreadHeaderFromData(buf);
  t.doesNotThrow(function() { new Thread(header, arr); }, 'Thread block accepts valid merkle hash');
  arr[64] = 0x05;
  t.throws(function() { new Thread(header, arr); }, ErrorType.Data.hash(), 'Thread block rejects invalid merkle hash');

  t.end();
});

t.test('Thread block validates zero genesis row', function(t) {
  let buf = new ArrayBuffer(133);
  let view = new DataView(buf);
  view.setUint32(0, 0x0300801D);
  view.setUint8(132, 0x04);
  view.setUint8(75, 0x04);
  let arr = new Uint8Array(buf);
  arr.fill(1, 5, 37);
  let header = common.validThreadHeaderFromData(buf);
  t.throws(function() { new Thread(header, arr); }, ErrorType.Difficulty.insufficient);
  t.end();
});

t.test('Thread block functions', function(t) {
  let buf = new ArrayBuffer(133);
  let view = new DataView(buf);
  view.setUint32(0, 0x0300801D);
  view.setUint8(132, 0x04);
  view.setUint8(75, 0x04);
  let arr = new Uint8Array(buf);
  arr.fill(17, 36, 68);
  arr.fill(7, 68, 100);
  arr.fill(9, 100, 132);

  let header = common.validThreadHeaderFromData(buf);
  let thread = new Thread(header, new Uint8Array(buf));
  t.equal(thread.numThreads, 2, 'Thread block sets correct number of threads');
  let expected = new Uint8Array(32);
  expected.fill(9, 0, 32);
  t.strictSame(thread.getPost(1), expected, 'Thread block returns correct post hash');

  // TODO: fix
  let expectedThread = new Uint8Array(32);
  expectedThread.fill(7, 0, 32);
  t.strictSame(thread.getCorrespondingItem(expectedThread), expected, 'Thread retrieves post from thread hash');

  expected.fill(7, 0, 32);
  t.strictSame(thread.getThread(1), expected, 'Thread block returns correct thread hash');

  expected.fill(17, 0, 32);
  t.strictSame(thread.getCorrespondingItem(new Uint8Array(32)), expected, 'Thread block retrieves genesis post from zero array');

  expected.fill(9, 0, 32);
  t.strictSame(thread.getCorrespondingItem(expected), expectedThread, 'Thread block thread from post hash');

  thread.prune();
  t.equal(thread.merkleTree.isPruned, true, 'Thread prunes merkle tree');
  t.equal(thread.isPruned(), true, 'Thread gets pruning status');
  t.end();
});
