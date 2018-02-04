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

var mode = 'debug';

var assert = function(condition, description) {
  if (!condition) {
    throw new Error(description)
  }
}
module.exports.assert = assert;

module.exports.assertArrayEquality = function(arr1, arr2) {
  assert(arr1.byteLength === arr2.byteLength);
  for (let i = 0; i < arr1.byteLength; i++) {
    assert(arr1[i] === arr2[i]);
  }
}

module.exports.time = function() {
  return Math.round(new Date().getTime() / 1000);
}

module.exports.log = function (str, level) {
  // levels:
  // 0: info
  // 1: debug
  // 2: warning
  // 3: error
  // 4: critical
  if (mode === 'debug') {
    console.log(str);
  }
}
