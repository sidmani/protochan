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
var t = require('tap');
var ErrorType = require('../../js/error.js');

t.test('Head constructor', function(t) {
  let originalPost = common.validPost();
  new DataView(originalPost.header.data.buffer).setUint32(3, 18643);
  let threadHash = new Uint8Array(32);
  threadHash.fill(18, 0, 19);
  let map = new HashMap();
  let startingHeight = 177;
  t.throws(function() { new Head(new Array(5), threadHash, map, startingHeight); }, ErrorType.Parameter.type(), 'Head validates originalPost type');
  t.throws(function() { new Head(originalPost, new Array(32), map, startingHeight); }, ErrorType.Parameter.type(), 'Head validates threadHash type');
  t.throws(function() { new Head(originalPost, threadHash, new Array(15), startingHeight); }, ErrorType.Parameter.type(), 'Head validates map type');
  t.throws(function() { new Head(originalPost, threadHash, map, 'hello'); }, ErrorType.Parameter.type(), 'Head validates startingHeight type');
  t.throws(function() { new Head(originalPost, threadHash, map, -3); }, ErrorType.Parameter.invalid(), 'Head validates startingHeight value');

  let head = new Head(originalPost, threadHash, map, startingHeight);
  t.equal(head.height, 177, 'Head sets starting height');
  t.strictSame(head.thread, threadHash, 'Head sets this.thread');
  t.strictSame(originalPost.thread, threadHash, 'Head sets thread on original post');
  t.equal(map.get(originalPost.hash), originalPost, 'Head inserts original post into map');
  t.equal(head.timestamp, 18643, 'Head sets timestamp from original post');
  t.equal(head.unconfirmedPosts, 1, 'Head sets unconfirmed post count');
  t.end();
});

t.test('Head.pushPost', function(t) {
  let originalPost = common.validPost();
  let originalPostHash = originalPost.hash;
  let threadHash = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    threadHash[i] = i*7;
  }
  let map = new HashMap();
  let head = new Head(originalPost, threadHash, map, 177);

  t.throws(function() { head.pushPost(new Array(6)); }, ErrorType.Parameter.type(), 'Head.pushPost validates post type');

  let buf = new ArrayBuffer(41);
  let view = new DataView(buf);
  view.setUint32(0, 0x0300241D);
  view.setUint8(40, 0x04);

  let header = common.validPostHeaderFromData(buf);
  new DataView(header.data.buffer).setUint32(3, 2077354);
  for (let i = 11; i < 43; i++) {
    header.data[i] = i * 5;
  }

  t.throws(function() { head.pushPost(new Post(header, buf)); }, ErrorType.Data.hash(), 'Head.pushPost validates prevHash');

  for (let i = 11; i < 43; i++) {
    header.data[i] = originalPostHash[i-11];
  }
  let nextPost = new Post(header, buf);
  head.pushPost(nextPost);

  t.strictSame(nextPost.thread, threadHash, 'Head.pushPost sets thread on post');
  t.strictSame(head.pointer, nextPost.hash, 'Head.pushPost sets pointer');
  t.equal(head.unconfirmedPosts, 2, 'Head.pushPost increments unconfirmed post count');
  t.equal(head.timestamp, 2077354, 'Head.pushPost sets timestamp');
  t.equal(map.get(nextPost.hash), nextPost, 'Head.pushPost inserts new post into map');
  t.equal(head.height, 178, 'Head.pushPost increments height');
  t.end();
});

t.test('Head.discardStage', function(t) {
  let originalPost = common.validPost();
  let originalPostHash = originalPost.hash;
  let head = new Head(originalPost, new Uint8Array(32), new HashMap(), 177);
  head.stage = common.validThread(originalPost); // not undefined
  head.discardStage();
  t.equal(head.stage, undefined);
  t.end();
});

t.test('Head.commitThread', function(t) {
  let originalPost = common.validPost();
  let originalPostHash = originalPost.hash;
  let head = new Head(originalPost, new Uint8Array(32), new HashMap(), 177);
  head.stage = 5;
  t.throws(function() { head.commitThread(); }, ErrorType.State.invalid(), 'Head.commitThread validates stage');
  let threadHash = common.validThread(originalPost).hash;
  head.stage = threadHash;
  head.commitThread();
  t.equal(head.height, 178, 'Head.commitThread increments height');
  t.equal(head.unconfirmedPosts, 0, 'Head.commitThread resets unconfirmed post count');
  t.strictSame(head.pointer, threadHash, 'Head.commitThread sets pointer');
  t.equal(head.stage, undefined, 'Head.commitThread clears stage');
  t.end();
});

t.test('Head.getBlockAtHead retrieves head from map', function(t) {
  let originalPost = common.validPost();
  let originalPostHash = originalPost.hash;
  let map = new HashMap();
  let head = new Head(originalPost, new Uint8Array(32), map, 177);
  t.equal(head.getBlockAtHead(), originalPost);
  t.end();
});
