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

module.exports.assert = assert = function(condition, description) {
  if (!condition) {
    throw new Error(description)
  }
}

module.exports.assertArrayEquality = function(arr1, arr2) {
  assert(arr1.length === arr2.length);
  for (let i = 0; i < arr1.length; i++) {
    assert(arr1[i] === arr2[i]);
  }
}

module.exports.assertDataViewEquality = function(d1, d2) {
  assert(d1.byteLength === d2.byteLength);
  for (let i = 0; i < d1.byteLength; i++) {
    assert(d1.getUint8(i) === d2.getUint8(i));
    // XXX: maybe use getUint32 to decrease # of comparisons?
  }
}

module.exports.time = function() {
  // XXX: is this the most efficient way?
  return Math.round((new Date()).getTime() / 1000);
}

module.exports.dataViewToUint8Array = function(view) {
  return new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
}

module.exports.uint8ArrToHex = function(arr) {
	let str = '';

	for (let i = 0; i < arr.byteLength; i++) {
		// if (arr[i] < 16) {
			str += (arr[i]<16?'0':'') + arr[i].toString(16);
		// }
		// else {
		// 	string += arr[i].toString(16);
		// }
	}
	return str;
}
