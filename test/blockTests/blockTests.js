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
var Block = require('../../js/block/block.js');
var ErrorType = require('../../js/error.js');
var t = require('tap');

t.test('Block validates header type', function(t) {
  let buf = new ArrayBuffer(10);
  let view = new DataView(buf);
  view.setUint32(0, 0x03000529);
  view.setUint8(9, 0x04);
  t.throws(function() { new Block(new Array(80), buf); }, ErrorType.Parameter.type());
  t.end();
});

t.test('Block validates data type', function(t) {
  let buf = new ArrayBuffer(64);
  let view = new DataView(buf);
  view.setUint32(0, 0x04003A29);
  view.setUint8(4, 0x29);
  view.setUint8(63, 0x04);
  let header = common.validHeaderFromData(buf);

  t.throws(function() { new Block(header, new Array()); }, ErrorType.Parameter.type());
  t.end();
});

t.test('Block validates data hash', function(t) {
  let buf = new ArrayBuffer(10);
  let view = new DataView(buf);
  view.setUint32(0, 0x03000529);
  view.setUint8(9, 0x04);
  let header = common.validHeaderFromData(buf);
  (new Uint8Array(buf))[5] = 0x05;

  t.throws(function() { new Block(header, buf); }, ErrorType.Data.hash());
  t.end();
});

t.test('Block validates data separator byte', function(t) {
  let buf = new ArrayBuffer(10);
  let view = new DataView(buf);
  view.setUint8(9, 0x04);
  view.setUint32(0, 0x03000528);
  let header = common.validHeaderFromData(buf);
  t.throws(function() { new Block(header, buf); }, ErrorType.Data.delimiter());
  t.end()
});

t.test('Block validates number of control bytes', function(t) {
  let buf = new ArrayBuffer(10);
  let view = new DataView(buf);
  view.setUint8(9, 0x04);
  view.setUint32(0, 0x02062900);
  let header = common.validHeaderFromData(buf);
  t.throws(function() { new Block(header, buf); }, ErrorType.Data.controlLength());
  t.end();
});

t.test('Block validates data length', function(t) {
  let buf = new ArrayBuffer(11);
  let view = new DataView(buf);
  view.setUint8(10, 0x04);
  view.setUint32(0, 0x03000529);
  let header = common.validHeaderFromData(buf);
  t.throws(function() { new Block(header, buf); }, ErrorType.Data.length());
  t.end();
});

t.test('Block validates data terminator byte', function(t) {
  let buf = new ArrayBuffer(10);
  let view = new DataView(buf);
  view.setUint8(9, 0x07);
  view.setUint32(0, 0x03000529);

  let header = common.validHeaderFromData(buf);
  t.throws(function() { new Block(header, buf); }, ErrorType.Data.delimiter());
  t.end();
});

t.test('Block accepts valid header and data', function (t) {
  let buf = new ArrayBuffer(128);
  let view = new DataView(buf);
  view.setUint32(0, 0x03007B29);
  view.setUint8(127, 0x04);
  let header = common.validHeaderFromData(buf);
  let b;
  t.doesNotThrow(function() { b = new Block(header, buf); });
  t.assert(b instanceof Block);
  t.end();
});

t.test('Block getters return correct values', function(t) {
  var buf = new ArrayBuffer(517);
  let view = new DataView(buf);
  view.setUint32(0, 0x0401FFEF);
  view.setUint32(4, 0x29000000)
  view.setUint8(516, 0x04);
  (new Uint8Array(buf)).fill(0x94, 5, 516);

  var header = common.validHeaderFromData(buf);
  var b = new Block(header, buf);

  t.strictSame(b.hash(), common.hash(header.data),
    'Block.hash() returns correct hash');
  t.equal(b.controlLength(), 0x04,
    'Block returns correct control length');
  t.equal(b.contentLength(), 0x01FF,
    'Block returns correct content length');

  let content = b.content();
  let expected_content = new Uint8Array(0x01FF);
  expected_content.fill(0x94, 0, 0x01FF);
  t.strictSame(content, expected_content,
    'Block returns correct content');
  t.end();
});
