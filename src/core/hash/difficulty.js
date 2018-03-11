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

const countLeadingZeroes = function (arr) {
  let zeroes = 0;
  for (let i = 0; i < arr.byteLength; i += 1) {
    if (arr[i] === 0) {
      zeroes += 8;
    } else {
      let curr = arr[i];
      let finalByteZeroes = 0;
      while (curr !== 0) {
        curr >>= 1;
        finalByteZeroes += 1;
      }
      return zeroes + (8 - finalByteZeroes);
    }
  }
  return zeroes;
};
module.exports.countLeadingZeroes = countLeadingZeroes;

// Posts use a simple exponential decay model over time for difficulty
// If someone wants to post every 5 seconds, they have to do about
// 128 times as much work as someone who posts every 10 seconds.

module.exports.post = function (deltaT, config) {
  const minDiff = config.MIN_POST_DIFFICULTY;
  const maxDiff = config.MAX_POST_DIFFICULTY;
  const interval = maxDiff - minDiff;
  const k = Math.log(((maxDiff / 2) - minDiff) / interval) / -10;
  return Math.round(minDiff + (interval * Math.exp(-k * deltaT)));
};

// Threads use a combination of time decay and # of posts
// If there have been very few posts since the last thread was
// created, it will be much more difficult to create a new thread
// this encourages users to respond to threads instead of creating
// new ones

// f(t, n) = k1*e^-ct + k2*e^-dn + min_t
// f(0, 0) = max_t
// f(300, 0) = 3/4 * max_t
// f(0, maxThreads) = 3/4 * max_t
// f(300, maxThreads) = max_t/2
// f(∞, ∞) = min_t

module.exports.thread = function (deltaT, numPosts, config) {
  const maxThreads = config.MAX_THREAD_COUNT;
  const minDiff = config.MIN_THREAD_DIFFICULTY;
  const maxDiff = config.MAX_THREAD_DIFFICULTY;
  const interval = maxDiff - minDiff;
  const c = Math.log(3 / (2 * interval)) / -300;
  const d = Math.log(3 / (2 * interval)) / -maxThreads;

  return Math.round(minDiff + ((interval / 2) * (Math.exp(-c * deltaT) + Math.exp(-d * numPosts))));
};
