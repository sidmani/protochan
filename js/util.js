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

module.exports.parseIntFromUint8Array = function(arr) {
  if (arr.byteLength > 4) { throw new TypeError('Array cannot fit in a 32-bit integer.'); }
  let result = 0;
  for (let i = 0; i < arr.byteLength; i++) {
    result |= arr[i] << ((arr.byteLength - i - 1) * 8);
  }
  return result;
}

module.exports.Uint8ArrayFromInt = function(val) {
  if (val >> 8 === 0) { // val fits in 1 byte
    return new Uint8Array([val]);
  } else if (val >> 16 === 0) { // fits in 2 bytes
    return new Uint8Array([
      (val >> 8)  & 0xff,
      (val)       & 0xff
    ]);
  } else if (val >> 24 === 0) { // fits in 3 bytes
    return new Uint8Array([
      (val >> 16) & 0xff,
      (val >> 8)  & 0xff,
      (val)       & 0xff
    ]);
  } else { // all 4 bytes
    return new Uint8Array([
      (val >> 24) & 0xff,
      (val >> 16) & 0xff,
      (val >> 8)  & 0xff,
      (val)       & 0xff
    ]);
  }
}
