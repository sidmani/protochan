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

const THREAD_BLOCK_ID = 0x00;

var Util = require('../util.js');
var Block = require('./block.js');

module.exports = class ThreadBlock extends Block {
  constructor(header, data) {
    super(header, data)
    Util.assert(header.blockType() === THREAD_BLOCK_ID, 'Header block type is incorrect.');
    Util.assert(data.byteLength >= 64 && data.byteLength % 64 === 0, 'Data is malformed.');

    Util.assert(this.data.getUint32(0) === 0 &&
                this.data.getUint32(4) === 0 &&
                this.data.getUint32(8) === 0 &&
                this.data.getUint32(12) === 0 &&
                this.data.getUint32(16) === 0 &&
                this.data.getUint32(20) === 0 &&
                this.data.getUint32(24) === 0 &&
                this.data.getUint32(28) === 0, 'Data is malformed.');
  }

  // data is pairs of 32-byte hashes
  // { thread hash, post hash}
  // first row is { 0, post hash } (genesis)
  getThread(index) {
    // index must not be zero
    // since the zeroth thread's id is the hash of this block
    // which obviously can't be stored in the block itself
    Util.assert(index < this.data.byteLength / 64 && index !== 0);
    return new DataView(this.data.buffer, index*64, 32)
  }

  getPost(index) {
    Util.assert(index < this.data.byteLength / 64);
    return new DataView(this.data.buffer, index*64 + 32, 32)
  }

  prune() {
    // TODO: prune data
  }
};
