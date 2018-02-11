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


var common = require('../testCommon.js');
var HashMap = require('../../js/hash/hashMap.js');
var Head = require('../../js/chain/head.js');
var Post = require('../../js/block/post.js');
var Uint256 = require('../../js/util/uint256.js');
var Config = require('../../js/board/config.js');
var t = require('tap');
var ErrorType = require('../../js/error.js');

t.test('Head constructor', function(t) {
  let originalPost = common.validGenesisPost();
  let config = new Config(originalPost);

  let threadHash = new Uint8Array(32);
  threadHash.fill(18, 0, 19);
  let blockMap = new HashMap();

  let head = new Head(config, blockMap, threadHash);

  t.strictSame(head.thread, threadHash, 'Head sets thread');
  t.equal(head.pointer, undefined, 'Head sets pointer to undefined');
  t.equal(head.height, 0, 'Head sets height to 0');
  t.equal(head.unconfirmedPosts, 0, 'Head sets unconfirmed post count to 0');
  t.equal(head.strictTimestamp, 0, 'Head sets strict timestamp to 0');
  t.equal(head.work.compare(new Uint256(0)), 0, 'Head starts at 0 work');

  t.equal(head.timestamp(), 0, 'Head.timestamp returns 0 when pointer is undefined');
  t.end();
});

// t.test('Head.pushPost')
//
// t.test('Head.pushPost', function(t) {
//   let originalPost = common.validPost();
//   let originalPostHash = originalPost.hash;
//   let threadHash = new Uint8Array(32);
//   for (let i = 0; i < 32; i++) {
//     threadHash[i] = i*7;
//   }
//   let map = new HashMap();
//   let head = new Head(originalPost, threadHash, map, 177);
//
//   t.throws(function() { head.pushPost(new Array(6)); }, ErrorType.Parameter.type(), 'Head.pushPost validates post type');
//
//   let buf = new ArrayBuffer(41);
//   let view = new DataView(buf);
//   view.setUint32(0, 0x0300241D);
//   view.setUint8(40, 0x04);
//
//   let header = common.validPostHeaderFromData(buf);
//   new DataView(header.data.buffer).setUint32(3, 2077354);
//   for (let i = 11; i < 43; i++) {
//     header.data[i] = i * 5;
//   }
//
//   t.throws(function() { head.pushPost(new Post(header, new Uint8Array(buf))); }, ErrorType.Data.hash(), 'Head.pushPost validates prevHash');
//
//   for (let i = 11; i < 43; i++) {
//     header.data[i] = originalPostHash[i-11];
//   }
//   let nextPost = new Post(header, new Uint8Array(buf));
//   head.pushPost(nextPost);
//
//   t.strictSame(nextPost.thread, threadHash, 'Head.pushPost sets thread on post');
//   t.strictSame(head.pointer, nextPost.hash, 'Head.pushPost sets pointer');
//   t.equal(head.unconfirmedPosts, 2, 'Head.pushPost increments unconfirmed post count');
//   t.equal(head.timestamp, 2077354, 'Head.pushPost sets timestamp');
//   t.equal(map.get(nextPost.hash), nextPost, 'Head.pushPost inserts new post into map');
//   t.equal(head.height, 178, 'Head.pushPost increments height');
//   t.end();
// });
//
t.test('Head.discardStage', function(t) {
  let originalPost = common.validGenesisPost();
  let config = new Config(originalPost);

  let threadHash = new Uint8Array(32);
  threadHash.fill(18, 0, 19);
  let blockMap = new HashMap();

  let head = new Head(config, blockMap, threadHash);

  head.stage = common.validThread(originalPost); // not undefined
  head.discardStage();
  t.equal(head.stage, undefined);
  t.end();
});

t.test('Head.commitThread', function(t) {
  let originalPost = common.validGenesisPost();
  let config = new Config(originalPost);

  let threadHash = new Uint8Array(32);
  threadHash.fill(0x0f, 16, 32); // thread hash difficulty = 132
  let blockMap = new HashMap();

  let head = new Head(config, blockMap, threadHash);
  head.height = 177;
  head.unconfirmedPosts = 5;

  t.throws(function() { head.commitThread(); }, ErrorType.State.invalid(), 'Head.commitThread validates stage');

  head.stage = threadHash;

  head.commitThread();
  t.equal(head.height, 178, 'Head.commitThread increments height');
  t.equal(head.unconfirmedPosts, 0, 'Head.commitThread resets unconfirmed post count');
  t.strictSame(head.pointer, threadHash, 'Head.commitThread sets pointer');
  t.equal(head.stage, undefined, 'Head.commitThread clears stage');
  t.equal(head.work.compare(Uint256.exp2(132)), 0, 'Head.commitThread adds work');
  t.end();
});

t.test('Head.getBlockAtHead retrieves pointee block from map', function(t) {
  let originalPost = common.validGenesisPost();
  let config = new Config(originalPost);
  
  let threadHash = new Uint8Array(32);
  threadHash.fill(0x0f, 16, 32); // thread hash difficulty = 132
  let blockMap = new HashMap();
  blockMap.set(originalPost);

  let head = new Head(config, blockMap, threadHash);
  head.pointer = originalPost.hash;
  t.equal(head.getBlockAtHead(), originalPost);
  t.end();
});
