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

var Difficulty = require('../../js/hash/difficulty.js');
var ErrorType = require('../../js/error.js');
var t = require('tap');

t.test('countLeadingZeroes counts number of zeroes in a single byte', function(t) {
  var arr = new Uint8Array(32);
  arr[0] = 0b00011011;
  t.equal(Difficulty.countLeadingZeroes(arr), 3);
  t.end();
});

t.test('countLeadingZeroes counts number of zeroes in multiple bytes', function(t) {
  var arr = new Uint8Array(32);
  arr[0] = 0;
  arr[1] = 0;
  arr[2] = 0;
  arr[3] = 0b00001011;
  t.equal(Difficulty.countLeadingZeroes(arr), 28);
  t.end();
});

t.test('countLeadingZeroes returns 0 for empty array', function(t) {
  t.assert(Difficulty.countLeadingZeroes(new Uint8Array([])) === 0);
  t.end();
});

t.test('verifyDifficulty accepts zero array', function(t) {
  t.doesNotThrow(function() { Difficulty.verify(new Uint8Array(32), 4); });
  t.end();
});

t.test('verifyDifficulty rejects too few leading zeroes (single byte)', function(t) {
  let arr = new Uint8Array(32);
  arr[0] = 0b00011011; // 3 leading zeroes

  t.throws(function() { Difficulty.verify(arr, 4); }, ErrorType.Difficulty.insufficient());
  t.end()
});

t.test('verifyDifficulty rejects too few leading zeroes (multiple bytes)', function(t) {
  let arr = new Uint8Array(32);
  arr[0] = 0;
  arr[1] = 0;
  arr[2] = 0b00011001; // 19 leading zeroes
  t.throws(function() { Difficulty.verify(arr, 20); }, ErrorType.Difficulty.insufficient());
  t.end();
});

t.test('verifyDifficulty accepts enough leading zeroes (single byte)', function(t) {
  var arr = new Uint8Array(32);
  arr[0] = 0b00000110; // 5 leading zeroes
  t.doesNotThrow(function() { Difficulty.verify(arr, 3); });
  t.end()
});

t.test('verifyDifficulty accepts enough leading zeroes (multiple bytes)', function(t) {
  var arr = new Uint8Array(32);
  arr[0] = 0;
  arr[1] = 0;
  arr[2] = 0;
  arr[3] = 0;
  arr[4] = 0b00000110; // 37 leading zeroes
  t.doesNotThrow(function() { Difficulty.verify(arr, 37); });
  t.end()
});

t.test('Post difficulty function works', function(t) {
  t.equal(Difficulty.requiredPostDifficulty(0, 10, 40), 40,
  'Post difficulty f(0) = max difficulty');
  t.equal(Difficulty.requiredPostDifficulty(10, 10, 40), 20,
  'Post difficulty f(10) = max difficulty / 2');
  t.equal(Difficulty.requiredPostDifficulty(999999999,  10, 40), 10, 'Post difficulty = 10 when delta-t increases');
  t.end();
});

t.test('Thread difficulty function works', function(t) {
  t.equal(Difficulty.requiredThreadDifficulty(0, 0, 255, 24, 64), 64, 'Thread difficulty f(0 sec, 0 posts) = max difficulty');
  t.equal(Difficulty.requiredThreadDifficulty(300, 0, 255, 24, 64), 45, 'Thread difficulty f(300 sec, 0 posts) = 0.5*difficulty interval + minimum difficulty + 1');
  t.equal(Difficulty.requiredThreadDifficulty(0, 255, 255, 24, 64), 45, 'Thread difficulty f(0 sec, maxThread posts) = 0.5*difficulty interval + minimum difficulty + 1');
  t.equal(Difficulty.requiredThreadDifficulty(300, 255, 255, 24, 64), 26, 'Thread difficulty f(300 sec, maxThread posts) = minimum difficulty + 2');
  t.equal(Difficulty.requiredThreadDifficulty(99999999, 99999999, 255, 24, 64), 24, 'Thread difficulty equals minimum difficulty as inputs increase');
  t.end();
});
