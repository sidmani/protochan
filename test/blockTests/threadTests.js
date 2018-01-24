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

var Header = require('../../js/block/header.js');
var Thread = require('../../js/block/thread.js');
var Util = require('../../js/util.js');
var testCommon = require('../testCommon.js');

module.exports = [
  { description: "Thread block validates block type",
    dual: true,
    fn: function(shouldPass) {
      let d_buf = new ArrayBuffer(64);
      let header = testCommon.validHeaderFromData(d_buf);
      if (shouldPass) {
        header.data.setUint8(2, 0x00);
      } else {
        header.data.setUint8(2, 0x01);
      }
      new Thread(header, d_buf);
    }
  },
  { description: "Thread block validates zero genesis row",
    dual: true,
    fn: function(shouldPass) {
      let d_buf = new ArrayBuffer(64);
      if (shouldPass) {
        new Uint8Array(d_buf).fill(0, 0, 16);
      } else {
        new Uint8Array(d_buf).fill(9, 0, 16);
      }
      let header = testCommon.validThreadHeaderFromData(d_buf);
      new Thread(header, d_buf);
    }
  },
  { description: "Thread block returns correct post hash",
    fn: function() {
      let d_buf = new ArrayBuffer(64);
      let arr = new Uint8Array(d_buf);
      arr.fill(9, 32, 48);
      let header = testCommon.validThreadHeaderFromData(d_buf);
      let t = new Thread(header, d_buf);
      let firstThread = t.getPost(0);
      for (let i = 0; i < 32; i++) {
          Util.assert(firstThread.getUint8(i) === (i<16?9:0));
      }
    }
  },
  { description: "Thread block returns correct thread hash",
    fn: function() {
      let d_buf = new ArrayBuffer(128);
      let arr = new Uint8Array(d_buf);
      arr.fill(9, 64, 68);
      let header = testCommon.validThreadHeaderFromData(d_buf);
      let t = new Thread(header, d_buf);
      let firstThread = t.getThread(1);
      for (let i = 0; i < 32; i++) {
          Util.assert(firstThread.getUint8(i) === (i<4?9:0));
      }
    }
  }
];
