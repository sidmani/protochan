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
var testCommon = require('../testCommon.js');

var Util = require('../../js/util.js');
var PostChain = require('../../js/chain/postChain.js');
var Hash = require('../../js/hash/blake2s.js');
var GenesisPost = require('../../js/block/genesisPost.js');
var HashMap = require('../../js/hash/hashMap.js');

module.exports = [
  { description: "PostChain validates originalPost",
    dual: true,
    fn: function(shouldPass) {
      let originalPost = testCommon.validGenesisPost();
      let thread = testCommon.validGenesis(originalPost);
      if (shouldPass) {
        new PostChain(originalPost, thread, new HashMap());
      } else {
        new PostChain(testCommon.validPost(), thread, new HashMap());
      }
    }
  },
  { description: "PostChain validates thread",
    dual: true,
    fn: function(shouldPass) {
      let originalPost = testCommon.validGenesisPost();
      let thread = testCommon.validGenesis(originalPost);
      if (shouldPass) {
        new PostChain(originalPost, thread, new HashMap());
      } else {
        new PostChain(originalPost, new Array(5), new HashMap());
      }
    }
  },
  { description: "PostChain.push checks prevHash",
    dual: true,
    fn: function(shouldPass) {
      let originalPost = testCommon.validGenesisPost();
      let thread = testCommon.validGenesis(originalPost);
      let chain = new PostChain(originalPost, thread, new HashMap());

      let post = testCommon.validPost();
      if (shouldPass) { // need to set prevHash to hash of OP
        let prevHash = Hash.digest(originalPost.header.data);
        for (let i = 11; i < 43; i++) {
          post.header.data[i] = prevHash[i-11];
        }
      }
      chain.push(post);
    }
  },
  { description: "postChain validates post hash against genesis block data",
    dual: true,
    fn: function(shouldPass) {
      let post = testCommon.validGenesisPost();
      let genesis = testCommon.validGenesis(post)
      if (!shouldPass) {
        post.header.data[15] = 0x05; // change a byte to break the hash
      }
      new PostChain(post, genesis, new HashMap());
    }
  }
];
