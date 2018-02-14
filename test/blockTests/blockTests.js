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

var Block = require('../../js/block/block.js');
var ErrorType = require('../../js/error.js');
var t = require('tap');

t.test('Block validates data separator byte', function(t) {
  let buf = new ArrayBuffer(10);
  let view = new DataView(buf);
  view.setUint32(0, 0x0300051E);
  view.setUint8(9, 0x04);
  let header = { data: new Uint8Array(80) };
  t.throws(function() { new Block(header, new Uint8Array(buf)); }, ErrorType.Data.delimiter());
  t.end();
});

t.test('Block validates number of control bytes', function(t) {
  let buf = new ArrayBuffer(10);
  let view = new DataView(buf);
  view.setUint32(0, 0x02061D00);
  view.setUint8(9, 0x04);
  let header = { data: new Uint8Array(80) };
  t.throws(function() { new Block(header, new Uint8Array(buf)); }, ErrorType.Data.controlLength());
  t.end();
});

t.test('Block validates data length', function(t) {
  let buf = new ArrayBuffer(11);
  let view = new DataView(buf);
  view.setUint32(0, 0x0300051D);
  view.setUint8(10, 0x04);
  let header = { data: new Uint8Array(80) };
  t.throws(function() { new Block(header, new Uint8Array(buf)); }, ErrorType.Data.length());
  t.end();
});

t.test('Block validates data terminator byte', function(t) {
  let buf = new ArrayBuffer(10);
  let view = new DataView(buf);
  view.setUint32(0, 0x0300051D);
  view.setUint8(9, 0x07);
  let header = { data: new Uint8Array(80) };
  t.throws(function() { new Block(header, new Uint8Array(buf)); }, ErrorType.Data.delimiter());
  t.end();
});

t.test('Block accepts valid header and data', function (t) {
  let buf = new ArrayBuffer(128);
  let view = new DataView(buf);
  view.setUint32(0, 0x03007B1D);
  view.setUint8(127, 0x04);
  let header = { data: new Uint8Array(80) };
  let b;
  t.doesNotThrow(function() { b = new Block(header, new Uint8Array(buf)); });
  t.assert(b instanceof Block);
  t.end();
});

t.test('Block serialization', function (t) {
  let buf = new ArrayBuffer(128);
  let view = new DataView(buf);
  view.setUint32(0, 0x03007B1D);
  view.setUint8(127, 0x04);
  const header = {
    data: new Uint8Array(80),
    serialize() {
      return this.data;
    }
  };
  let block = new Block(header, new Uint8Array(buf));
  let serialized = block.serialize();
  t.strictSame(serialized.subarray(80), new Uint8Array(buf), 'Block serializes data');
  let deserialized = Block.deserialize(serialized);
  deserialized.header = header; // replace header with mock
  t.strictSame(block, deserialized, 'Block deserializes data');
  t.end();
});

t.test('Block getters return correct values', function(t) {
  var buf = new ArrayBuffer(517);
  let view = new DataView(buf);
  view.setUint32(0, 0x0401FFEF);
  view.setUint32(4, 0x1D000000)
  view.setUint8(516, 0x04);

  let header = {
    data: new Uint8Array(80),
    timestamp() { return 85; },
  };

  var b = new Block(header, new Uint8Array(buf));
  let expectedHash = new Uint8Array([
    196, 253, 231, 106, 141, 104, 66, 44,
    95, 186, 253, 226, 80, 244, 146, 16,
    159, 178, 154, 198, 103, 83, 41, 46,
    17, 83, 170, 17, 173, 174, 26, 58
  ]);

  t.strictSame(b.hash, expectedHash, 'Block returns correct hash');
  t.equal(b.controlLength, 0x04, 'Block returns correct control length');
  t.equal(b.contentLength, 0x01FF, 'Block returns correct content length');
  t.equal(b.timestamp(), 85);
  t.end();
});
