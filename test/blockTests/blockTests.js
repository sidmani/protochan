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
var Header = require('../../js/block/header.js');
var Post = require('../../js/block/post.js');
var Thread = require('../../js/block/thread.js');
var Util = require('../../js/util.js');

module.exports = [
  { description: "Block rejects undefined header",
    fn: function() {
      try {
        var b = new Block(undefined, new ArrayBuffer(10));
        return false;
      } catch(e) {
        return true;
      }
    }
  },
  { description: "Block rejects header of wrong type",
    fn: function() {
      try {
        var b = new Block(new Array(), new ArrayBuffer(10));
        return false;
      } catch(e) {
        return true;
      }
    }
  },
  { description: "Block rejects undefined data",
    fn: function() {
      try {
        var b = new Block(new Header(new ArrayBuffer(80)), undefined);
        return false;
      } catch(e) {
        return true;
      }
    }
  },
  { description: "Block rejects data of wrong type",
    fn: function() {
      try {
        var b = new Block(new Header(new ArrayBuffer(80)), new Array());
        return false;
      } catch(e) {
        return true;
      }
    }
  },
  { description: "Block accepts valid header and data",
    fn: function() {
      var b = new Block(new Header(new ArrayBuffer(80)), new ArrayBuffer(30));
      Util.assert(b);
      Util.assert(b instanceof Block);
      return true;
    }
  },
  { description: "Post block rejects incorrect block type",
    fn: function() {
      try {
        let buf = new ArrayBuffer(80);
        (new DataView(buf)).setUint8(2, 0x00);
        var b = new Post(new Header(buf), new ArrayBuffer(30));
        return false;
      } catch (e) {
        return true;
      }
    }
  },
  { description: "Post block accepts correct block type",
    fn: function() {
      let buf = new ArrayBuffer(80);
      (new DataView(buf)).setUint8(2, 0x01);
      var b = new Post(new Header(buf), new ArrayBuffer(30));
      Util.assert(b);
      Util.assert(b instanceof Post);
      return true;
    }
  },
  { description: "Thread block rejects incorrect block type",
    fn: function() {
      try {
        let buf = new ArrayBuffer(80);
        (new DataView(buf)).setUint8(2, 0x02);
        var b = new Thread(new Header(buf), new ArrayBuffer(30));
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
      var b = new Thread(new Header(buf), new ArrayBuffer(30));
      Util.assert(b);
      Util.assert(b instanceof Thread);
      return true;
    }
  }
]
