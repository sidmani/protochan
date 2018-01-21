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

module.exports.assert = function(condition, description) {
  if (!condition) {
    throw new Error(description)
  }
}

module.exports.assertArrayEquality = function(arr1, arr2) {
  if (arr1.length !== arr2.length) { throw new Error('Length mismatch.'); }
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) { throw new Error('Arrays are unequal.'); }
  }
}

// module.exports.assertBufferEquality = function(buf1, buf2) {
//   if (buf1.byteLength !== buf2.byteLength) {
//     throw new Error('Length mismatch.');
//   }
//   let arr1 = Uint32Array(buf1);
//   let arr2 = Uint32Array(buf2);
//   for (let i = 0; i < arr1.byteLength; i++) {
//     if (arr1[i] !== arr2[i]) { throw new Error('Arrays are unequal.'); }
//   }
// }
