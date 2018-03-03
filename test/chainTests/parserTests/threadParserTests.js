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

const tap = require('tap');
const ThreadDataParser = require('../../../src/core/chain/parser/threadParser.js');
const ErrorType = require('../../../src/core/error.js');

tap.test('ThreadDataParser constructor', (t) => {
  t.throws(() => {
    const arr = new Uint8Array(71);
    return new ThreadDataParser(arr);
  }, ErrorType.dataLength(), 'ThreadDataParser rejects zero content length');

  t.throws(() => {
    const arr = new Uint8Array(71);
    arr[0] = 0x06; // 71 - 6 = 65
    return new ThreadDataParser(arr);
  }, ErrorType.dataLength(), 'ThreadDataParser rejects length not divisible by 64');

  t.doesNotThrow(() => {
    const arr = new Uint8Array(71);
    arr[0] = 0x07; // 71 - 7 = 64
    arr[60] = 0x05; // avoid duplication
    return new ThreadDataParser(arr);
  }, 'ThreadDataParser accepts valid length');

  t.end();
});

tap.test('ThreadDataParser methods', (t) => {
  const arr = new Uint8Array(132);
  arr[0] = 0x04;
  arr.fill(17, 36, 68);
  arr.fill(7, 68, 100);
  arr.fill(9, 100, 132);

  const parser = new ThreadDataParser(arr);
  t.equal(parser.numRecords, 2, 'ThreadDataParser sets correct number of threads');
  const expected = new Uint8Array(32);
  expected.fill(9, 0, 32);
  t.strictSame(parser.getPost(1), expected, 'ThreadDataParser returns correct post hash');

  const expectedThread = new Uint8Array(32);
  expectedThread.fill(7, 0, 32);
  t.strictSame(parser.getCorrespondingItem(expectedThread), expected, 'ThreadDataParser retrieves post from thread hash');

  expected.fill(7, 0, 32);
  t.strictSame(parser.getThread(1), expected, 'ThreadDataParser returns correct thread hash');

  expected.fill(17, 0, 32);
  t.strictSame(parser.getCorrespondingItem(new Uint8Array(32)), expected, 'ThreadDataParser retrieves genesis post from zero array');

  expected.fill(9, 0, 32);
  t.strictSame(parser.getCorrespondingItem(expected), expectedThread, 'ThreadDataParser gets thread from post hash');

  t.assert(parser.contains(expected), 'ThreadDataParser.contains works');

  t.assert(parser.containsPost(expected), 'ThreadDataParser.containsPost returns true for a post');

  t.equal(parser.containsThread(expected), false, 'ThreadDataParser.containsThread returns false for a post');

  expected.fill(7, 0, 32);
  t.equal(parser.containsPost(expected), false, 'Thread.containsPost returns false for a thread');

  t.equal(parser.containsThread(expected), true, 'Thread.containsThread returns true for a thread');

  const arr2 = new Uint8Array(196);
  arr2[0] = 0x04;
  arr2.fill(51, 36, 68);
  arr2.fill(7, 68, 100);
  arr2.fill(9, 100, 132);
  arr2.fill(18, 132, 164);
  arr2.fill(15, 164, 196);

  // { 0, 51, 7, 9, 18, 15 } | idx % 2 === 0 => { 0, 7, 18 }
  // { 0, 7, 18 } - { 0, 17, 7, 9 } = { 18 }

  const parser2 = new ThreadDataParser(arr2);
  const diff = parser2.subtractRecords(parser);
  const expectedDiff = new Uint8Array(32);
  expectedDiff.fill(18, 0, 32);
  t.strictSame(diff, [expectedDiff], 'Thread.subtractThreadRecords');
  t.end();
});
