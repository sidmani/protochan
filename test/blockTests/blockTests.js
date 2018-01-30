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
  { description: "Block validates header",
    dual: true,
    fn: function(shouldPass) {
      let buf = new ArrayBuffer(64);
      let header;
      if (shouldPass) {
        header = common.validHeaderFromData(buf);
      } else {
        header = undefined;
      }
      new Block(header, buf);
    }
  },
  { description: "Block validates header type",
    dual: true,
    fn: function(shouldPass) {
      let buf = new ArrayBuffer(64);
      let header;
      if (shouldPass) {
        header = common.validHeaderFromData(buf);
      } else {
        header = new Array();
      }
      new Block(header, buf);
    }
  },
  { description: "Block validates data",
    dual: true,
    fn: function(shouldPass) {
      let buf = new ArrayBuffer(64);
      let header = common.validHeaderFromData(buf);
      if (shouldPass) {
        new Block(header, buf);
      } else {
        new Block(header, undefined);
      }
    }
  },
  { description: "Block validates data type",
    dual: true,
    fn: function(shouldPass) {
      let buf = new ArrayBuffer(64);
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
      let buf = new ArrayBuffer(64);
      let header = common.validHeaderFromData(buf);
      // change a byte to break the hash
      if (!shouldPass) {
        (new Uint8Array(buf))[5] = 0x05;
      }
      new Block(header, buf);
    }
  },
  { description: "Block accepts valid header and data",
    fn: function() {
      var buf = new ArrayBuffer(128);
      var header = common.validHeaderFromData(buf);
      var b = new Block(header, buf);
      common.testAssert(b);
      common.testAssert(b instanceof Block);
    }
  },
  { description: "Block.hash() returns correct hash",
    fn: function() {
      var buf = new ArrayBuffer(128);
      var header = common.validHeaderFromData(buf);
      var b = new Block(header, buf);
      common.assertArrayEquality(b.hash(), common.hash(header.data));
    }
  }
]
