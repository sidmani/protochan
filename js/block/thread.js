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
var HashMap = require('../hash/hashMap.js');
var Difficulty = require('../hash/difficulty.js');

module.exports = class ThreadBlock extends Block {
  constructor(header, data) {
    super(header, data);
    Util.assert(header.blockType() === THREAD_BLOCK_ID, 'Header block type is incorrect.');

    // Data comes in sets of 64 bytes (32 thread, 32 post)
    Util.assert(data.byteLength >= 64 && data.byteLength % 64 === 0, 'Data is malformed.');

    // the first thread has a zero hash
    Difficulty.verify(this.getThread(0), 256);

    this.map = new HashMap();

    // put all threads in data into a hashmap for easy lookup
    let count = this.numThreads();
    for (let i = 0; i < count; i++) {
      this.map.setRaw(this.getThread(i), this.getPost(i));
    }
  }

  // data is pairs of 32-byte hashes
  // { thread hash, post hash}
  // first row is { 0, post hash } (genesis)
  getThread(index) {
    // NOTE: getThread(0) returns 32 zeroes
    // since the zeroth thread's id is the hash of this block
    // which obviously can't be stored in the block itself
    Util.assert(index < this.data.byteLength / 64);
    return new Uint8Array(this.data.buffer, index*64, 32);
  }

  getPost(index) {
    Util.assert(index < this.data.byteLength / 64);
    return new Uint8Array(this.data.buffer, index*64 + 32, 32);
  }

  getPostForThread(hash) {
    return this.map.get(hash);
  }

  numThreads() {
    return (this.data.byteLength / 64);
  }

  prune() {
    // TODO: prune data
    // what can be pruned? write details on this
  }
};
