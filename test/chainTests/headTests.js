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

  let head = new Head(config, blockMap, threadHash, 11);

  t.strictSame(head.thread, threadHash, 'Head sets thread');
  t.equal(head.pointer, undefined, 'Head sets pointer to undefined');
  t.equal(head.threadHeight, 11, 'Head sets thread height');
  t.equal(head.height, 0, 'Head sets height to 0');
  t.equal(head.unconfirmedPosts, 0, 'Head sets unconfirmed post count to 0');
  t.equal(head.strictTimestamp, 0, 'Head sets strict timestamp to 0');
  t.equal(head.work.compare(new Uint256(0)), 0, 'Head starts at 0 work');
  t.equal(head.sealed, false, 'Head starts unsealed');

  t.equal(head.timestamp(), 0, 'Head.timestamp returns 0 when pointer is undefined');

  head.seal();

  t.equal(head.sealed, true, 'Head.seal works');
  t.throws(function() { head.stageThread(); }, ErrorType.Head.resurrection(), 'Head.stageThread fails on sealed head');
  t.throws(function() { head.pushPost(); }, ErrorType.Head.resurrection(), 'Head.pushPost fails on sealed head');

  t.equal(Head.genesisScore(), 1, 'Head.genesisScore() is 1');
  t.end();
});

t.test('Head.checkPostDifficulty', function(t) {
  let originalPost = common.validGenesisPost();
  let config = new Config(originalPost);

  let threadHash = new Uint8Array(32);
  threadHash.fill(18, 0, 19);
  let blockMap = new HashMap();

  let head = new Head(config, blockMap, threadHash, 5);
  head.config.MIN_POST_DIFFICULTY = 10;
  head.config.MAX_POST_DIFFICULTY = 40;

  t.throws(function() { head.checkPostDifficulty(-1, 5); }, ErrorType.Parameter.invalid(), 'checkPostDifficulty rejects negative time difference');
  t.throws(function() { head.checkPostDifficulty(0, 81); }, ErrorType.Parameter.invalid(), 'checkPostDifficulty rejects zero time difference');
  t.throws(function() { head.checkPostDifficulty(10, 15); }, ErrorType.Difficulty.insufficient(), 'checkPostDifficulty rejects insufficient difficulty');
  t.doesNotThrow(function() { head.checkPostDifficulty(10, 20)}, 'checkPostDifficulty accepts sufficient difficulty');
  t.end();
});

t.test('Head.genesisPostChecks', function(t) {
  let originalPost = common.validGenesisPost();
  let config = new Config(originalPost);

  let threadHash = new Uint8Array(32);
  threadHash.fill(18, 0, 19);
  let blockMap = new HashMap();

  let head = new Head(config, blockMap, threadHash, 7);

  let regularPost = common.validPost();
  t.throws(function() { head.genesisPostChecks(regularPost); }, ErrorType.Parameter.type(), 'genesisPostChecks rejects regular post');

  new DataView(originalPost.header.data.buffer).setUint32(3, 0x5A7E6FBF);
  t.throws(function() { head.genesisPostChecks(originalPost); }, ErrorType.Parameter.invalid(), 'genesisPostChecks rejects post timestamped before 0x5A7E6FC0');

  new DataView(originalPost.header.data.buffer).setUint32(3, 0x5A7E6FFF);
  t.doesNotThrow(function() { head.genesisPostChecks(originalPost); },'genesisPostChecks accepts valid post');
  t.end();
});

t.test('Head.finalizePostInsertion', function(t) {
  let originalPost = common.validGenesisPost();
  let config = new Config(originalPost);
  new DataView(originalPost.header.data.buffer).setUint32(3, 0xab);
  let threadHash = new Uint8Array(32);
  let blockMap = new HashMap();

  let head = new Head(config, blockMap, threadHash, 14);
  head.height = 193;
  head.unconfirmedPosts = 5;
  head.finalizePostInsertion(originalPost, 97);
  t.equal(head.blockMap.get(originalPost.hash), originalPost, 'finalizePostInsertion set block in blockMap');
  t.strictSame(originalPost.thread, threadHash, 'finalizePostInsertion sets thread on inserted post');
  t.strictSame(head.pointer, originalPost.hash, 'finalizePostInsertion sets pointer to post.hash');
  t.equal(head.height, 194, 'finalizePostInsertion increments height');
  t.equal(head.strictTimestamp, 0xab, 'finalizePostInsertion sets strict timestamp');
  t.equal(head.unconfirmedPosts, 6, 'finalizePostInsertion increments unconfirmed post count');
  t.equal(head.work.compare(Uint256.exp2(97)), 0, 'finalizePostInsertion adds work');
  t.end();
});

t.test('Head.discardStage', function(t) {
  let originalPost = common.validGenesisPost();
  let config = new Config(originalPost);

  let threadHash = new Uint8Array(32);
  threadHash.fill(18, 0, 19);
  let blockMap = new HashMap();

  let head = new Head(config, blockMap, threadHash, 21);

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

  let head = new Head(config, blockMap, threadHash, 19);
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
  t.equal(head.strictTimestamp, 0, 'Head.commitThread does not modify strict timestamp');
  t.end();
});

t.test('Head.getBlockAtHead retrieves pointee block from map', function(t) {
  let originalPost = common.validGenesisPost();
  let config = new Config(originalPost);

  let threadHash = new Uint8Array(32);
  threadHash.fill(0x0f, 16, 32); // thread hash difficulty = 132
  let blockMap = new HashMap();
  blockMap.set(originalPost);

  let head = new Head(config, blockMap, threadHash, 84);
  head.pointer = originalPost.hash;
  t.equal(head.getBlockAtHead(), originalPost);
  t.end();
});
