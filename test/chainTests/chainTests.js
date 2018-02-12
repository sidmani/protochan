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
var Chain = require('../../js/chain/chain.js');
var Config = require('../../js/board/config.js');
var common = require('../testCommon.js');
var t = require('tap');

t.test('Chain constructor', function(t) {
  let post = common.validGenesisPost();
  let config = new Config(post);
  let chain = new Chain(config);

  t.equal(chain.threadPointer, undefined, 'Chain sets thread pointer to undefined');
  t.equal(chain.threadHeight, 0, 'Chain sets thread height to 0');

  t.end();
});

// t.test('Chain.finalizeThreadInsertion', function(t) {
//   let post = common.validGenesisPost();
//   let config = new Config(post);
//   let chain = new Chain(config);
//
//   let thread = common.validThread(post);
//
//   chain.finalizeThreadInsertion(thread);
// });

t.test('Chain convenience methods', function(t) {
  let post = common.validGenesisPost();
  let config = new Config(post);
  let chain = new Chain(config);

  chain.blockMap.setRaw(new Uint8Array([5, 4, 3]), 'foo');
  t.equal(chain.getBlock(new Uint8Array([5, 4, 3])), 'foo', 'Chain.getBlock returns object from blockMap');

  chain.headMap.setRaw(new Uint8Array([7, 2, 8]), 'foo');
  t.equal(chain.getHead(new Uint8Array([7, 2, 8])), 'foo', 'Chain.getBlock returns object from blockMap');
  t.end();
});
