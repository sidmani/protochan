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

var Storage = require('./storage.js');
var Util = require('../util.js');
var Hash = require('../hash/hash.js');
var Block = require('../block/block.js');
var Post = require('../block/post.js');
var Thread = require('../block/thread.js');
var Genesis = require('../block/genesis.js');
var Difficulty = require('../hash/difficulty.js');

module.exports = class Chain {
  constructor(genesis, genesisPost) {
    Util.assert(genesis);
    Util.assert(genesis instanceof Genesis);

    Util.assert(genesisPost);
    Util.assert(genesisPost instanceof Post);

    // if post contains additional settings, handle them here
    // check that genesis dataHash is equal to data
    this.threadStorage = Storage();
    // FIXME: sort out arrays vs dataviews
    // check that genesis post hash equals getPost(0)
    this.genesis = genesis;

    // this.map = new HashMap();
    //
    // this.head = undefined; // replace with hash array of genesis block
  }

  push(block, now) {
      Util.assert(block);
      Util.assert(block instanceof Block, 'Invalid block.');

      Util.assert(now);
      Util.assert(typeof(now) === 'number');

      // assert that block is no more than 1 second in the future.
      Util.assert(block.header.timestamp() <= now + 1);

      // assert that block board id is correct
      Util.assert(block.header.board() === this.board);

      // assert that data hash in header is as expected
      let calculatedDataHash = Hash.digest(Array.from(block.data));
      let storedDataHash = Array.from(block.header.dataHash());
      Util.assertArrayEquality(calculatedDataHash, storedDataHash);

      // assert that block points to head, otherwise we're missing blocks
      Util.assertArrayEquality(this.head, Array.from(block.header.prevHash()));

      // TODO: check that block matches difficulty requirement
      let blockHash = Hash.digest(block);

      // block is OK
      map.set(blockHash, block);
      this.head = blockHash;
  }
  //
  // validate() {
  //   let count = map.count();
  //   let prevBlock = ; // genesis
  //   for (let i = 1; i < count; i++) {
  //     let currentBlock = map.getIdx(i);
  //     Util.assertArrayEquality(Hash.digest(Array.from(prevBlock.header.buffer)), Array.from(currentBlock.header.prevHash()));
  //   }
  // }
}
