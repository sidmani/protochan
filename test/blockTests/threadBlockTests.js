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

module.exports = [
  { description: "Thread block rejects incorrect block type",
    fn: function() {
      try {
        let buf = new ArrayBuffer(80);
        (new DataView(buf)).setUint8(2, 0x02);
        var b = new Thread(new Header(buf), new ArrayBuffer(192));
        return false;
      } catch (e) {
        return true;
      }
    }
  },
  { description: "Thread block accepts correct block type",
    fn: function() {
      let buf = new ArrayBuffer(80);
      (new DataView(buf)).setUint8(2, 0x00);
      var b = new Thread(new Header(buf), new ArrayBuffer(64));
      Util.assert(b);
      Util.assert(b instanceof Thread);
      return true;
    }
  },
  { description: "Thread block rejects non-zero genesis row",
    fn: function() {
      let d_buf = new ArrayBuffer(64);
      let arr = new Uint8Array(d_buf);
      arr.fill(9, 0, 16);
      try {
        let t = new Thread(new Header(new ArrayBuffer(80)), d_buf);
        return false;
      } catch (e) {
        return true;
      }
    }
  },
  { description: "Thread block returns correct post hash",
    fn: function() {
      let d_buf = new ArrayBuffer(64);
      let arr = new Uint8Array(d_buf);
      arr.fill(9, 32, 48);
      let t = new Thread(new Header(new ArrayBuffer(80)), d_buf);
      let firstThread = t.postData(0);
      for (let i = 0; i < 32; i++) {
          Util.assert(firstThread.getUint8(i) === (i<16?9:0));
      }
      return true;
    }
  },
  { description: "Thread block returns correct thread hash",
    fn: function() {
      let d_buf = new ArrayBuffer(128);
      let arr = new Uint8Array(d_buf);
      arr.fill(9, 64, 68);
      let t = new Thread(new Header(new ArrayBuffer(80)), d_buf);
      let firstThread = t.threadData(1);
      for (let i = 0; i < 32; i++) {
          Util.assert(firstThread.getUint8(i) === (i<4?9:0));
      }
      return true;
    }
  }
];
