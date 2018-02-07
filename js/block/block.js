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

var Util = require('../util.js');
var Header = require('./header.js');
var Hash = require('../hash/blake2s.js');
var ErrorType = require('../error.js');

module.exports = class Block {
  constructor(header, data) {
    if (!(header instanceof Header)) throw ErrorType.Parameter.type();
    if (!(data instanceof ArrayBuffer)) throw ErrorType.Parameter.type();

    // XXX: untested
    // Absolute max size of a block's databuffer is
    // 2^16-1 (uint16) - 80 (header) - 100 (any packet headers)  = 65355.
    if (data.byteLength >= 65355) throw ErrorType.Data.length();

    this.header = header;
    this.data = new Uint8Array(data);

    // set instance fields from data
    this.controlLength = this.data[0];
    this.contentLength = (this.data[1] << 8) + this.data[2];
    this.hash = Hash.digest(this.header.data);

    // TODO: move to the post and thread blocks
    // and replace with a merkle tree for the thread block?

    // Assert that the hash of the data is equal to the hash stored in the header
    if (!Util.arrayEquality(Hash.digest(this.data), header.dataHash())) throw ErrorType.Data.hash();

    // the separator must be at the index specified by the control length
    if (this.data[this.controlLength] !== 0x1D) throw ErrorType.Data.delimiter();

    // at least 3 control bytes (control length, content length)
    if (this.controlLength < 3) throw ErrorType.Data.controlLength();

    // control length, content length, control bytes, 0x1D, content bytes, 0x04
    if (this.data.byteLength !==
        this.contentLength // content bytes
      + this.controlLength // control bytes
      + 1 // separator
      + 1 // terminator
    ) throw ErrorType.Data.length();

    // last byte is 0x04 end-of-transmission
    if (this.data[this.data.byteLength - 1] !== 0x04) throw ErrorType.Data.delimiter();
  }
};
