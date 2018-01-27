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

const POST_BLOCK_ID = 0x01;

var Util = require('../util.js');
var Block = require('./block.js');
var Hash = require('../hash/blake2s.js');

module.exports = class PostBlock extends Block {
  constructor(header, data) {
    super(header, data);
    Util.assert(header.blockType() === POST_BLOCK_ID, 'Header block type is incorrect.');

    // 0xffff between len and data so that data starts at
    // a byte index divisible by 4.
    Util.assert(this.data[2] === 0xff);
    Util.assert(this.data[3] === 0xff);

    // data length = 2b len + 2b padding + #b content + 1b final
    Util.assert(this.data.byteLength === this.contentLength() + 5);

    // last byte is 0xff
    Util.assert(this.data[this.data.byteLength - 1] === 0xff);

    // TODO: error correction if 0xff end byte is present but length is wrong
    // would require rechecking hash
  }

  // data is 2 bytes length, 0xff, 0xff, data, 0xff
  // big endian
  contentLength() {
    return (this.data[0] << 8) + this.data[1];
  }

  content() {
    let length = this.contentLength();
    return new DataView(this.data.buffer, 4, length);
  }

  prune() {
    // TODO: prune data
  }

  // XXX: no unit test
  thread() {
    // set when this block is added to a post chain
    return this.thread;
  }
}
