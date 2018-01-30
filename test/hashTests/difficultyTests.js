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
var common = require('../testCommon.js');

module.exports = [
  { description: "countLeadingZeroes counts number of zeroes in a single byte",
    fn: function() {
      var arr = new Uint8Array(32);
      arr[0] = 0b00011011;
      common.testAssert(Difficulty.countLeadingZeroes(arr) === 3);
      return true;
    }
  },
  { description: "countLeadingZeroes counts number of zeroes in multiple bytes",
    fn: function() {
      var arr = new Uint8Array(32);
      arr[0] = 0;
      arr[1] = 0;
      arr[2] = 0;
      arr[3] = 0b00001011;
      common.testAssert(Difficulty.countLeadingZeroes(arr) === 28);
      return true;
    }
  },
  { description: "countLeadingZeroes returns 0 for empty array",
    fn: function() {
      common.testAssert(Difficulty.countLeadingZeroes([]) === 0);
      return true;
    }
  },
  { description: "verifyDifficulty rejects invalid hash",
    shouldFail: true,
    fn: function() {
      Difficulty.verify(undefined, 4);
    }
  },
  { description: "verifyDifficulty rejects wrong length hash",
    shouldFail: true,
    fn: function() {
      Difficulty.verify(new Uint8Array(31), 4);
    }
  },
  { description: "verifyDifficulty accepts zero array", // XXX: this is pretty weird. code shouldn't allow this?
    fn: function() {
      Difficulty.verify(new Uint8Array(32), 4);
    }
  },
  { description: "verifyDifficulty rejects too few leading zeroes (single byte)",
    shouldFail: true,
    fn: function() {
      var arr = new Uint8Array(32);
      arr[0] = 0b00011011; // 3 leading zeroes
      Difficulty.verify(arr, 4);
    }
  },
  { description: "verifyDifficulty rejects too few leading zeroes (multiple bytes)",
    shouldFail: true,
    fn: function() {
      var arr = new Uint8Array(32);
      arr[0] = 0;
      arr[1] = 0;
      arr[2] = 0b00011001; // 19 leading zeroes
      Difficulty.verify(arr, 20);
    }
  },
  { description: "verifyDifficulty accepts enough leading zeroes (single byte)",
    fn: function() {
      var arr = new Uint8Array(32);
      arr[0] = 0b00000110; // 5 leading zeroes
      Difficulty.verify(arr, 3);
    }
  },
  { description: "verifyDifficulty accepts enough leading zeroes (multiple bytes)",
    fn: function() {
      var arr = new Uint8Array(32);
      arr[0] = 0;
      arr[1] = 0;
      arr[2] = 0;
      arr[3] = 0;
      arr[4] = 0b00000110; // 37 leading zeroes
      Difficulty.verify(arr, 37);
    }
  },
  { description: "Post validates delta-t type",
    dual: true,
    fn: function(shouldPass) {
      if (shouldPass) {
        Difficulty.requiredPostDifficulty(5);
      } else {
        Difficulty.requiredPostDifficulty('food')
      }
    }
  },
  { description: "Post validates delta-t value",
    dual: true,
    fn: function(shouldPass) {
      if (shouldPass) {
        Difficulty.requiredPostDifficulty(5);
      } else {
        Difficulty.requiredPostDifficulty(-2)
      }
    }
  },
  { description: "Post difficulty f(0) = 40",
    fn: function() {
      common.testAssert(Difficulty.requiredPostDifficulty(0) === 40);
    }
  },
  { description: "Post difficulty f(10) = 20",
    fn: function() {
      common.testAssert(Difficulty.requiredPostDifficulty(10) === 20);
    }
  },
  { description: "Post difficulty lim t -> ∞ = 10",
    fn: function() {
      common.testAssert(Difficulty.requiredPostDifficulty(999999999) === 10);
    }
  }
];
