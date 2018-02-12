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

var Header = require('./header.js');
var Hash = require('../hash/blake2s.js');
var ErrorType = require('../error.js');

module.exports = class Block {
  constructor(header, data) {
    if (!(header instanceof Header)) throw ErrorType.Parameter.type();
    if (!(data instanceof Uint8Array)) throw ErrorType.Parameter.type();

    // XXX: untested
    // Absolute max size of a block's databuffer is
    // 2^16-1 (uint16) - 80 (header) - 100 (any packet headers)  = 65355.
    if (data.byteLength >= 65355) throw ErrorType.Data.length();

    this.header = header;

    // set instance fields from data
    this.controlLength = data[0];
    this.contentLength = (data[1] << 8) + data[2];
    this.controlSector = data.subarray(0, this.controlLength);
    this.hash = Hash.digest(this.header.data);

    // the separator must be at the index specified by the control length
    if (data[this.controlLength] !== 0x1D) throw ErrorType.Data.delimiter();

    // at least 3 control bytes (1 control length, 2 content length)
    if (this.controlLength < 3) throw ErrorType.Data.controlLength();

    // control length, content length, control bytes, 0x1D, content bytes, 0x04
    if (data.byteLength !==
        this.contentLength // content bytes
      + this.controlLength // control bytes
      + 1 // separator
      + 1 // terminator
    ) throw ErrorType.Data.length();

    // last byte is 0x04 end-of-transmission
    if (data[data.byteLength - 1] !== 0x04) throw ErrorType.Data.delimiter();
  }

  // XXX: untested
  timestamp() {
    return this.header.timestamp();
  }

  serialize() {
    let data = new Uint8Array(80 + this.contentLength + this.controlLength + 2);
    data.set(this.header.serialize(), 0);
    data.set(this.controlSector, 80);
    data[80 + this.controlLength] = 0x1D;
    // subclass must set data here
    data[data.byteLength - 1] = 0x04;
    return data;
  }

  static deserialize(data) {
    let header = Header.deserialize(data);
    return new Block(header, data.subarray(80));
  }

  // static createFrom(header, control, content) {
  //   let data = new Uint8Array(control.byteLength + content.byteLength + 2);
  //   data.set(0, controlSector);
  //   data[control.byteLength] = 0x1D;
  //   data.set(control.byteLength + 1, content);
  //   data[data.byteLength - 1] = 0x04;
  //   return new Block(header, data);
  // }
};
