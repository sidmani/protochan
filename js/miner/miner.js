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

const Difficulty = require('../hash/difficulty.js');
const Hash = require('../hash/blake2s.js');
const ErrorType = require('../error.js');

module.exports = class Miner {
  constructor(data) {
    if (!(data instanceof Uint8Array)) {
      throw ErrorType.Parameter.type();
    }
    this.data = data;
  }

  setNonce(value) {
    this.data[7] = value >> 24;
    this.data[8] = value >> 16;
    this.data[9] = value >> 8;
    this.data[10] = value;
  }

  incrNonce() {
    if (this.data[10] < 0xff) {
      this.data[10] += 1;
    } else if (this.data[9] < 0xff) {
      this.data[9] += 1;
      this.data[10] = 0x00;
    } else if (this.data[8] < 0xff) {
      this.data[8] += 1;
      this.data[9] = 0x00;
      this.data[10] = 0x00;
    } else {
      this.data[7] += 1;
      this.data[8] = 0x00;
      this.data[9] = 0x00;
      this.data[10] = 0x00;
    }
  }

  mine(reqDiff, fromNonce = 0, toNonce = 0xffffffff) {
    this.setNonce(fromNonce);
    for (let i = fromNonce; i <= toNonce; i += 1) {
      if (Difficulty.countLeadingZeroes(Hash.digest(this.data)) >= reqDiff) { return; }
      this.incrNonce();
    }
    // TODO: error, no nonce value yielded the required difficulty.
    // should exit with an error.
    // the caller will adjust the timestamp or something and retry.
  }
};
