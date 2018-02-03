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

var Thread = require('../../js/block/thread.js');
var common = require('../testCommon.js');

module.exports = [
  { description: "Thread block validates block type",
    dual: true,
    fn: function(shouldPass) {
      let buf = new ArrayBuffer(133);
      let view = new DataView(buf);
      view.setUint32(0, 0x03008029);
      view.setUint8(132, 0x04);

      let header = common.validHeaderFromData(buf);
      if (shouldPass) {
        header.data[2] = 0x00;
      } else {
        header.data[2] = 0x01;
      }
      new Thread(header, buf);
    }
  },
  { description: "Thread block validates data length",
    dual: true,
    fn: function(shouldPass) {
      let buf;
      if (shouldPass) {
        buf = new ArrayBuffer(133);
        let view = new DataView(buf);
        view.setUint32(0, 0x03008029);
        view.setUint8(132, 0x04);
      } else {
        buf = new ArrayBuffer(134);
        let view = new DataView(buf);
        view.setUint32(0, 0x03008129);
        view.setUint8(133, 0x04);
      }
      let header = common.validThreadHeaderFromData(buf);
      new Thread(header, buf);
    }
  },
  { description: "Thread block validates zero genesis row",
    dual: true,
    fn: function(shouldPass) {
      let buf = new ArrayBuffer(133);
      let view = new DataView(buf);
      view.setUint32(0, 0x03008029);
      view.setUint8(132, 0x04);

      if (shouldPass) {
        new Uint8Array(buf).fill(0, 5, 37);
      } else {
        new Uint8Array(buf).fill(1, 5, 37);
      }
      let header = common.validThreadHeaderFromData(buf);
      new Thread(header, buf);
    }
  },
  { description: "Thread retrieves genesis post from zero array",
    fn: function() {
      let buf = new ArrayBuffer(133);
      let view = new DataView(buf);
      view.setUint32(0, 0x03008029);
      view.setUint8(132, 0x04);

      let arr = new Uint8Array(buf);
      arr.fill(17, 37, 69);

      let header = common.validThreadHeaderFromData(buf);
      let thread = new Thread(header, buf);

      let expected_thread_hash = new Uint8Array(32);
      expected_thread_hash.fill(0, 0, 32);

      let expected_post_hash = new Uint8Array(32);
      expected_post_hash.fill(17, 0, 32);
  //    console.log(thread.getPostForThread(expected_thread_hash));
      common.assertArrayEquality(expected_post_hash, thread.getPostForThread(expected_thread_hash));
    }
  },
  // TODO: test hashmapping of post-> thread
  { description: "Thread retrieves post from thread hash",
    fn: function() {
      let d_buf = new ArrayBuffer(128);
      let arr = new Uint8Array(d_buf);
      arr.fill(13, 64, 96);
      arr.fill(17, 96, 128);

      let header = common.validThreadHeaderFromData(d_buf);
      let thread = new Thread(header, d_buf);

      let expected_thread_hash = new Uint8Array(32);
      expected_thread_hash.fill(13, 0, 32);

      let expected_post_hash = new Uint8Array(32);
      expected_post_hash.fill(17, 0, 32);

      common.assertArrayEquality(expected_post_hash, thread.getPostForThread(expected_thread_hash));
    }
  },
  { description: "Thread block returns correct post hash",
    fn: function() {
      let d_buf = new ArrayBuffer(64);
      let arr = new Uint8Array(d_buf);
      arr.fill(9, 32, 48);
      let header = common.validThreadHeaderFromData(d_buf);
      let t = new Thread(header, d_buf);
      let firstThread = t.getPost(0);
      for (let i = 0; i < 32; i++) {
          common.assert(firstThread[i] === (i<16?9:0));
      }
    }
  },
  { description: "Thread block returns correct thread hash",
    fn: function() {
      let d_buf = new ArrayBuffer(128);
      let arr = new Uint8Array(d_buf);
      arr.fill(9, 64, 68);
      let header = common.validThreadHeaderFromData(d_buf);
      let t = new Thread(header, d_buf);
      let firstThread = t.getThread(1);
      for (let i = 0; i < 32; i++) {
          common.assert(firstThread[i] === (i<4?9:0));
      }
    }
  }
];
