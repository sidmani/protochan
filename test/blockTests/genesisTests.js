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

var Genesis = require('../../js/block/genesis.js');
var common = require('../testCommon.js');
var t = require('tap');
var ErrorType = require('../../js/error.js');

t.test('Genesis block validates data length', function(t) {
  let d_buf;
  // make sure that super constructor check is not failing
  d_buf = new ArrayBuffer(133);
  let view = new DataView(d_buf);
  view.setUint32(0, 0x0300801D);
  view.setUint32(75, 0xcefdab64);
  view.setUint8(132, 0x04);

  let header = common.validThreadHeaderFromData(d_buf);
  t.throws(function() { new Genesis(header, d_buf); }, ErrorType.Data.length());
  t.end();
});

t.test('Genesis block validates zero prevHash', function(t) {
  let d_buf = new ArrayBuffer(69);
  let view = new DataView(d_buf);
  view.setUint32(0, 0x0300401D);
  view.setUint8(68, 0x04);

  let header = common.validThreadHeaderFromData(d_buf);

  for (let i = 11; i < 43; i++) {
    header.data[i] = 1;
  }
  t.throws(function() { new Genesis(header, d_buf); }, ErrorType.Difficulty.insufficient());
  t.end();
});

t.test('Genesis block accepts valid data', function(t) {
  let d_buf = new ArrayBuffer(69);
  let view = new DataView(d_buf);
  view.setUint32(0, 0x0300401D);
  view.setUint8(68, 0x04);

  let header = common.validThreadHeaderFromData(d_buf);

  t.doesNotThrow(function() { new Genesis(header, d_buf); });
  t.end();
});
