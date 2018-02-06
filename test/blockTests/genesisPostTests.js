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
var GenesisPost = require('../../js/block/genesisPost.js');
var ErrorType = require('../../js/error.js');
var t = require('tap');

t.test('Genesis post validates zero prevHash', function(t) {
  let d_buf = new ArrayBuffer(39);
  let dataView = new DataView(d_buf);
  dataView.setUint32(0, 0x08001D00);
  dataView.setUint32(4, 0x000000ff); // maxThreads != 0

  dataView.setUint8(8, 0x1D);
  dataView.setUint8(38, 0x04);
  let header = common.validPostHeaderFromData(d_buf);

  // the correct index is [11, 42] inclusive
  // using 33 to 42 here so that there's no confusion with
  // the 0 to 32 zeros in the data's thread 0
  for (let i = 33; i < 43; i++) {
    header.data[i] = 1;
  }
  t.throws(function() { new GenesisPost(header, d_buf); }, ErrorType.Difficulty.insufficient());
  t.end();
});

t.test('Genesis post validates minimum control length', function(t) {
  let d_buf = new ArrayBuffer(10);
  let dataView = new DataView(d_buf);
  dataView.setUint32(0, 0x07000100);
  dataView.setUint32(4, 0x0000ff1D);
  dataView.setUint8(9, 0x04);
  let header = common.validPostHeaderFromData(d_buf);
  t.throws(function() { new GenesisPost(header, d_buf); }, ErrorType.Data.controlLength());
  t.end();
});

t.test('Genesis post validates max post difficulty greater than min post difficulty', function(t) {
  let d_buf = new ArrayBuffer(10);
  let dataView = new DataView(d_buf);
  dataView.setUint32(0, 0x080000cc);
  dataView.setUint32(4, 0xcb0000ff);
  dataView.setUint8(8, 0x1D);
  dataView.setUint8(9, 0x04);

  let header = common.validPostHeaderFromData(d_buf);
  t.throws(function() { new GenesisPost(header, d_buf); }, ErrorType.Block.illegalControlValues());
  t.end();
});

t.test('Genesis post validates max thread difficulty greater than min post difficulty', function(t) {
  let d_buf = new ArrayBuffer(10);
  let dataView = new DataView(d_buf);
  dataView.setUint32(0, 0x080000cc);
  dataView.setUint32(4, 0xefab00ff);
  dataView.setUint8(8, 0x1D);
  dataView.setUint8(9, 0x04);

  let header = common.validPostHeaderFromData(d_buf);
  t.throws(function() { new GenesisPost(header, d_buf); }, ErrorType.Block.illegalControlValues());
  t.end();
});

t.test('Genesis post validates max thread count > 0', function(t) {
  let d_buf = new ArrayBuffer(10);
  let dataView = new DataView(d_buf);
  dataView.setUint32(0, 0x080000cc);
  dataView.setUint32(4, 0xefacad00);
  dataView.setUint8(8, 0x1D);
  dataView.setUint8(9, 0x04);

  let header = common.validPostHeaderFromData(d_buf);
  t.throws(function() { new GenesisPost(header, d_buf); }, ErrorType.Block.illegalControlValues());
  t.end();
});

t.test('Genesis post accepts valid data', function(t) {
  let d_buf = new ArrayBuffer(10);
  let dataView = new DataView(d_buf);
  dataView.setUint32(0, 0x080000cc);
  dataView.setUint32(4, 0xefacad9a);
  dataView.setUint8(8, 0x1D);
  dataView.setUint8(9, 0x04);

  let header = common.validPostHeaderFromData(d_buf);
  t.doesNotThrow(function() { new GenesisPost(header, d_buf); });
  t.end()
});


t.test('Genesis post getters', function(t) {
  let d_buf = new ArrayBuffer(10);
  let dataView = new DataView(d_buf);
  dataView.setUint32(0, 0x080000cc);
  dataView.setUint32(4, 0xefacadae);
  dataView.setUint8(8, 0x1D);
  dataView.setUint8(9, 0x04);
  let header = common.validPostHeaderFromData(d_buf);
  let p = new GenesisPost(header, d_buf);

  t.equal(p.minPostDifficulty, 0xcc, 'Genesis post returns correct minimum post difficulty');
  t.equal(p.maxPostDifficulty, 0xef, 'Genesis post returns correct maximum post difficulty');
  t.equal(p.minThreadDifficulty, 0xac, 'Genesis post returns correct minimum thread difficulty');
  t.equal(p.maxThreadDifficulty, 0xad, 'Genesis post returns correct maximum thread difficulty');
  t.equal(p.maxThreads, 0xae, 'Genesis post returns correct maximum thread count');
  t.end();
});
