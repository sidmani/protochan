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
    Util.assert(header.blockType() === THREAD_BLOCK_ID);//

    // thread data comes in sets of 64 bytes (32 thread, 32 post)
    let threadDataLength = data.byteLength
    - this.controlLength()
    - 2; // separator and terminator

    Util.assert(threadDataLength >= 64 && threadDataLength % 64 === 0);//

    this.numThreads = threadDataLength / 64;

    // the first thread has a zero hash
    Difficulty.verify(this.getThread(0), 256);//

    this.map = new HashMap();

    // put all threads in data into a hashmap for easy lookup
    // there is probably a better way to do this (with indices)
    // XXX: check duplication
    for (let i = 0; i < this.numThreads; i++) {
      // no overwrites allowed, since that implies a hash collision
    //  console.log(this.getThread(i) + ' ' + this.getPost(i))
      this.map.setRaw(this.getThread(i), this.getPost(i));
    }

    // TODO: count # of items in the map and make sure it's
    // equal to numThreads
  }

  // data is pairs of 32-byte hashes
  // { thread hash, post hash}
  // first row is { 0, post hash } (genesis)
  getThread(index) {
    // NOTE: getThread(0) returns 32 zeroes
    // since the zeroth thread's id is the hash of this block
    // which obviously can't be stored in the block itself
    Util.assert(index < this.numThreads);
    return new Uint8Array(this.data.buffer, this.controlLength() + 1 + index*64, 32);
  }

  // TODO: optimize to use hashmap and not create extra arrays
  getPost(index) {
    Util.assert(index < this.numThreads);
    return this.data.subarray(this.controlLength() + 1 + index*64 + 32, this.controlLength() + 1 + index*64 + 64)
    // return new Uint8Array(this.data.buffer, this.controlLength() + 1 + index*64 + 32, 32);
  }

  // get the post associated with a particular thread
  getPostForThread(hash) {
    return this.map.get(hash);
  }

  // // the number of threads listed in this block
  // numThreads() {
  //   return this.data.byteLength / 64;
  // }

  prune() {
    // TODO: prune data
    // what can be pruned? write details on this
  }
};
