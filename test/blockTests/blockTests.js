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

module.exports = [
  { description: "Block validates header type",
    dual: true,
    fn: function(shouldPass) {
      let buf = new ArrayBuffer(10);
      let view = new DataView(buf);

      view.setUint32(0, 0x03000529);
      view.setUint8(9, 0x04);
      let header;
      if (shouldPass) {
        header = common.validHeaderFromData(buf);
      } else {
        header = new Array();
      }
      new Block(header, buf);
    }
  },
  { description: "Block validates data type",
    dual: true,
    fn: function(shouldPass) {
      let buf = new ArrayBuffer(64);
      let view = new DataView(buf);
      view.setUint32(0, 0x04003A29);
      view.setUint8(4, 0x29);
      view.setUint8(63, 0x04);
      let header = common.validHeaderFromData(buf);
      if (shouldPass) {
        new Block(header, buf);
      } else {
        new Block(header, new Array());
      }
    }
  },
  { description: "Block validates data hash",
    dual: true,
    fn: function(shouldPass) {
      let buf = new ArrayBuffer(10);
      let view = new DataView(buf);
      view.setUint32(0, 0x03000529);
      view.setUint8(9, 0x04);
      let header = common.validHeaderFromData(buf);
      // change a byte to break the hash
      if (!shouldPass) {
        (new Uint8Array(buf))[5] = 0x05;
      }
      new Block(header, buf);
    }
  },
  { description: "Block validates data separator byte",
    dual: true,
    fn: function(shouldPass) {
      let buf = new ArrayBuffer(10);
      let view = new DataView(buf);
      view.setUint8(9, 0x04);
      if (shouldPass) {
        view.setUint32(0, 0x03000529);
      } else {
        view.setUint32(0, 0x03000528);
      }

      let header = common.validHeaderFromData(buf);
      new Block(header, buf);
    }
  },
  { description: "Block validates number of control bytes",
    dual: true,
    fn: function(shouldPass) {
      let buf = new ArrayBuffer(10);
      let view = new DataView(buf);
      view.setUint8(9, 0x04);
      if (shouldPass) {
        view.setUint32(0, 0x03000529);
      } else {
        view.setUint32(0, 0x02062900);
      }

      let header = common.validHeaderFromData(buf);
      new Block(header, buf);
    }
  },
  { description: "Block validates data length",
    dual: true,
    fn: function(shouldPass) {
      let buf;
      if (shouldPass) {
        buf = new ArrayBuffer(10);
        let view = new DataView(buf);
        view.setUint8(9, 0x04);
        view.setUint32(0, 0x03000529);
      } else {
        buf = new ArrayBuffer(11);
        let view = new DataView(buf);
        view.setUint8(10, 0x04);
        view.setUint32(0, 0x03000529);
      }

      let header = common.validHeaderFromData(buf);
      new Block(header, buf);
    }
  },
  { description: "Block validates data terminator",
    dual: true,
    fn: function(shouldPass) {
      let buf = new ArrayBuffer(10);
      let view = new DataView(buf);
      if (shouldPass) {
        view.setUint8(9, 0x04);
      } else {
        view.setUint8(9, 0x07);
      }
      view.setUint32(0, 0x03000529);

      let header = common.validHeaderFromData(buf);
      new Block(header, buf);
    }
  },
  { description: "Block accepts valid header and data",
    fn: function() {
      var buf = new ArrayBuffer(128);
      let view = new DataView(buf);
      view.setUint32(0, 0x03007B29);
      view.setUint8(127, 0x04);
      var header = common.validHeaderFromData(buf);
      var b = new Block(header, buf);
      common.assert(b instanceof Block);
    }
  },
  { description: "Block.hash() returns correct hash",
    fn: function() {
      var buf = new ArrayBuffer(128);
      let view = new DataView(buf);
      view.setUint32(0, 0x03007B29);
      view.setUint8(127, 0x04);
      var header = common.validHeaderFromData(buf);
      var b = new Block(header, buf);
      common.assertArrayEquality(b.hash(), common.hash(header.data));
    }
  },
  { description: "Block returns correct control length",
    fn: function() {
      var buf = new ArrayBuffer(128);
      let view = new DataView(buf);
      view.setUint32(0, 0x04007AEF);
      view.setUint32(4, 0x29000000)
      view.setUint8(127, 0x04);
      var header = common.validHeaderFromData(buf);
      var b = new Block(header, buf);
      common.assert(b.controlLength() === 0x04);
    }
  },
  { description: "Block returns correct content length",
    fn: function() {
      var buf = new ArrayBuffer(128);
      let view = new DataView(buf);
      view.setUint32(0, 0x04007AEF);
      view.setUint32(4, 0x29000000)
      view.setUint8(127, 0x04);
      var header = common.validHeaderFromData(buf);
      var b = new Block(header, buf);
      common.assert(b.contentLength() === 0x7A);
    }
  },
  { description: "Block returns correct content",
    fn: function() {
      let buf = new ArrayBuffer(128);
      let view = new DataView(buf);
      view.setUint32(0, 0x04007AEF);
      view.setUint32(4, 0x29000000)
      view.setUint8(127, 0x04);

      (new Uint8Array(buf)).fill(0x94, 5, 127);
      let header = common.validHeaderFromData(buf);
      let b = new Block(header, buf);
      let content = b.content();
      common.assert(content.byteLength === 0x7A);
      for (let i = 5; i < 127; i++) {
        common.assert(content[i-5] === 0x94);
      }
    }
  }
]
