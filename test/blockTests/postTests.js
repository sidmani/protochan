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

var Post = require('../../js/block/post.js');
var common = require('../testCommon.js');
var t = require('tap');
var ErrorType = require('../../js/error.js');

t.test('Post block validates block type', function(t) {
  let d_buf = new ArrayBuffer(41);
  let dataView = new DataView(d_buf);
  dataView.setUint32(0, 0x0300241D);
  dataView.setUint8(40, 0x04);
  let header = common.validHeaderFromData(d_buf);
  header.data[2] = 0x00;
  t.throws(function() { new Post(header, new Uint8Array(d_buf)); }, ErrorType.Block.type(), 'Post block rejects wrong block type');
  header.data[2] = 0x01;
  t.doesNotThrow(function() { new Post(header, new Uint8Array(d_buf)); }, 'Post block accepts correct block type');
  t.end();
});

t.test('Post validates data hash', function(t) {
  let buf = new ArrayBuffer(10);
  let view = new DataView(buf);
  view.setUint32(0, 0x0300051D);
  view.setUint8(9, 0x04);
  let header = common.validHeaderFromData(buf);
  let arr = new Uint8Array(buf);
  header.data[2] = 0x01;
  arr[5] = 0x05;

  t.throws(function() { new Post(header, arr); }, ErrorType.Data.hash());
  t.end();
});
