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

var Util = require('../util.js');

module.exports.verify = function(hash, leadingZeroes) {
  Util.assert(hash);
  Util.assert(hash instanceof Array);
  Util.assert(hash.length === 32);

  Util.assert(leadingZeroes);
  Util.assert(typeof(leadingZeroes) === 'number');

  Util.assert(countLeadingZeroes(hash) >= leadingZeroes)
}

module.exports.verify_dataView = function(hash, leadingZeroes) {
  Util.assert(hash);
  Util.assert(hash instanceof DataView);
  Util.assert(hash.byteLength === 32);

  Util.assert(leadingZeroes);
  Util.assert(typeof(leadingZeroes) === 'number');

  Util.assert(countLeadingZeroes_dataView(hash) >= leadingZeroes)
}

// this function is used during PoW calculations.
// optimization is key
module.exports.countLeadingZeroes = countLeadingZeroes = function(arr) {
  let zeroes = 0;
  for (let i = 0; i < arr.length; i++) {
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

// this function is used mainly during verification
// since block headers return DataViews
module.exports.countLeadingZeroes_dataView = countLeadingZeroes_dataView = function(dView) {
  let zeroes = 0;
  for (let i = 0; i < dView.byteLength; i++) {
    if (dView.getUint8(i) === 0) {
      zeroes += 8;
    } else {
      let curr = dView.getUint8(i);
      let finalByteZeroes = 0;
      while (curr !== 0) {
        curr >>= 1;
        finalByteZeroes += 1;
      }
      return zeroes + (8-finalByteZeroes);
    }
  }
  return zeroes;
}
