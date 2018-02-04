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

var Hash = require('./blake2s.js');
var Util = require('../util.js');

class MerkleTree {
  constructor(data) {
    // pass in thread.content()
    Util.assert(data instanceof Uint8Array);

    // must be pairs of 32-byte hashes
    Util.assert(data.byteLength % 64 === 0);

    let count = data.byteLength / 64;

    // array of uint8arrays
    let builtArray = new Array();

    for (let i = 0; i < count; i++) {
      builtArray.push(data.subArray(i * 64, i * 64 + 64));
    }

    this.depth = 0;
    do {
      let newArray = new Array();
      // if there's an odd # of pairs, duplicate the final one
      if (builtArray.length % 2 === 1) {
        builtArray.push(builtArray[builtArray.length - 1]);
      }

      // remove this after unit tests
      Util.assert(builtArray.length % 2 === 0);

      for (let i = 0; i < builtArray.length/2; i++) {
        // pair the 2i and 2i+1 indices
        let pair = this.concat(builtArray[2*i], builtArray[2*i+1]);

        // add the hash of the concatenated pair to the new array
        newArray.push(Hash.digest(pair));
      }
      // builtArray now represents the next level of the tree
      builtArray = newArray;
      this.depth += 1;
    } while (builtArray.length > 1);

    this.root = builtArray[0];
  }

  concat(arr1, arr2) {
    let newArr = new Uint8Array(arr1.byteLength + arr2.byteLength);
    newArr.set(arr1, 0);
    newArr.set(arr2, arr1.byteLength);
    return newArr;
  }

  // Verify that a 64-byte thread/post pair is contained in this tree
  verify(pair, intermediates) {
    // intermediates.length must equal depth - 1
  }
}
