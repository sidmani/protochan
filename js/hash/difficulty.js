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

"use strict";

var ErrorType = require('../error.js');

module.exports.verify = function(hash, leadingZeroes) {
  if(!(hash instanceof Uint8Array)) throw ErrorType.Parameter.type();
  if(hash.byteLength !== 32) throw ErrorType.Data.length();

  if(typeof(leadingZeroes) !== 'number') throw ErrorType.Parameter.type();

  if(countLeadingZeroes(hash) < leadingZeroes) throw ErrorType.Difficulty.insufficient();
}

var countLeadingZeroes = function(arr) {
  let zeroes = 0;
  for (let i = 0; i < arr.byteLength; i++) {
    if (arr[i] === 0) {
      zeroes += 8;
    } else {
      let curr = arr[i];
      let finalByteZeroes = 0;
      while (curr !== 0) {
        curr >>= 1;
        finalByteZeroes += 1;
      }
      return zeroes + (8-finalByteZeroes);
    }
  }
  return zeroes;
};
module.exports.countLeadingZeroes = countLeadingZeroes;

// Posts use a simple exponential decay model over time for difficulty
// a good GPU gets 1-3GH/s and 2^40 = 1099 GH, 2^20 = 0.001 GH

// required post difficulty decays exponentially in time
// after each post. This vastly increases the difficulty of
// spamming.
// If someone wants to post every 5 seconds, they have to do about
// 128 times as much work as someone who posts every 10 seconds.

module.exports.requiredPostDifficulty = function(deltaT, minDiff, maxDiff) {
  let interval = maxDiff - minDiff;
  let k = Math.log((maxDiff/2-minDiff)/interval) / -10;
  return Math.round(minDiff + (interval) * Math.exp(-k * deltaT));
}

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

module.exports.requiredThreadDifficulty = function(deltaT, numPosts, maxThreads, minDiff, maxDiff) {
  let interval = maxDiff - minDiff;
  let c = Math.log(3/(2*interval)) / -300;
  let d = Math.log(3/(2*interval)) / -maxThreads;

  return Math.round(minDiff + interval/2*(Math.exp(-c*deltaT) + Math.exp(-d*numPosts)));
}

// since difficulties are on a log scale,
// they have to be added logarithmically
// here we use the identity log2(x + y) = log2(x) + log2(1 + y/x)
// therefore the sum of two difficulties a and b =
// a + log2(1 + 2^(b-a))
// of course, we can't exponentiate 2 to a power over 31
// so to make life easier, if b-a > 31, we
// approximate log2(1 + 2^(b-a)) ~= b-a
// module.exports.sumDifficulties(a, b) {
//   // if we're summing 8 and 8, difficulty is 9
//   // since 2^8 + 2^8 = 2^9
//   if (a === b) {
//     return a + 1;
//   }
//
//   // otherwise a must be less than b
//   if (a > b) {
//     let temp = a;
//     a = b;
//     b = temp;
//   }
//
//   // the difference is so great that a doesn't really matter
//   if (b-a > 31) {
//     return b;
//   }
// }
