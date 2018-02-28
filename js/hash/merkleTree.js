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

const ErrorType = require('../error.js');
const Hash = require('./blake2s.js');

module.exports = class MerkleTree {
  constructor(dataArr) {
    // array of uint8arrays
    let builtArray = dataArr;

    if (dataArr.length === 0) throw ErrorType.dataLength();

    this.depth = 1;

    do {
      const newArray = [];
      for (let i = 0; i < builtArray.length / 2; i += 1) {
        // pair the 2i and 2i+1 indices
        // if builtArray.length is odd, length/2 will have a 0.5
        // so the last index i*2+1 will be undefined
        // in that case, duplicate the previous index
        // TODO: optimize so it doesn't hash the same thing twice
        const item1 = Hash.digest(builtArray[i * 2]);
        const item2 = Hash.digest(builtArray[(i * 2) + 1] || builtArray[(i * 2)]);
        const concat = new Uint8Array(64);
        concat.set(item1, 0);
        concat.set(item2, 32);

        newArray.push(concat);
      }

      // builtArray now represents the next level of the tree
      builtArray = newArray;
      this.depth += 1;
    } while (builtArray.length > 1);

    this.root = Hash.digest(builtArray[0]);
  }

  // TODO: verify thread using intermediates and index
  // Verify that a thread or post is contained in this tree
  // get(intermediates) {
  //   return this.root.path(intermediates);
  //   // intermediates.length must equal depth - 1
  // }

  // verify(hash, intermediates, index) {
  //   // let idxArr = idx.toString(2).split('').map(num => parseInt(num));
  //   // while (idxArr.length < this.depth - 1) {
  //   //   idxArr.unshift(0);
  //   // }
  //   // while (intermediates.length > 0) {
  //   //     let concat = new Uint8Array(64);
  //   //     concat.set()
  //   // }
  // }
};
