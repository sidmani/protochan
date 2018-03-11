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

const Difficulty = require('../../src/core/hash/difficulty.js');
const tap = require('tap');

tap.test('countLeadingZeroes counts number of zeroes in a single byte', (t) => {
  const arr = new Uint8Array(32);
  arr[0] = 0b00011011;
  t.equal(Difficulty.countLeadingZeroes(arr), 3);
  t.end();
});

tap.test('countLeadingZeroes counts number of zeroes in multiple bytes', (t) => {
  const arr = new Uint8Array(32);
  arr[0] = 0;
  arr[1] = 0;
  arr[2] = 0;
  arr[3] = 0b00001011;
  t.equal(Difficulty.countLeadingZeroes(arr), 28);
  t.end();
});

tap.test('countLeadingZeroes returns 0 for empty array', (t) => {
  t.assert(Difficulty.countLeadingZeroes(new Uint8Array([])) === 0);
  t.end();
});

tap.test('Post difficulty function works', (t) => {
  const config = {
    MIN_POST_DIFFICULTY: 10,
    MAX_POST_DIFFICULTY: 40,
  };
  t.equal(
    Difficulty.post(0, config),
    40,
    'Post difficulty f(0) = max difficulty',
  );
  t.equal(
    Difficulty.post(10, config),
    20,
    'Post difficulty f(10) = max difficulty / 2',
  );
  t.equal(
    Difficulty.post(999999999, config),
    10,
    'Post difficulty = 10 when delta-t increases',
  );
  t.end();
});

tap.test('Thread difficulty function works', (t) => {
  const config = {
    MIN_THREAD_DIFFICULTY: 24,
    MAX_THREAD_DIFFICULTY: 64,
    MAX_THREAD_COUNT: 255,
  };
  t.equal(Difficulty.thread(0, 0, config), 64, 'Thread difficulty f(0 sec, 0 posts) = max difficulty');
  t.equal(Difficulty.thread(300, 0, config), 45, 'Thread difficulty f(300 sec, 0 posts) = 0.5*difficulty interval + minimum difficulty + 1');
  t.equal(Difficulty.thread(0, 255, config), 45, 'Thread difficulty f(0 sec, maxThread posts) = 0.5*difficulty interval + minimum difficulty + 1');
  t.equal(Difficulty.thread(300, 255, config), 26, 'Thread difficulty f(300 sec, maxThread posts) = minimum difficulty + 2');
  t.equal(Difficulty.thread(99999999, 99999999, config), 24, 'Thread difficulty equals minimum difficulty as inputs increase');
  t.end();
});
