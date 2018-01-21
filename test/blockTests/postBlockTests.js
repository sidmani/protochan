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
var Post = require('../../js/block/post.js');
var Util = require('../../js/util.js');

module.exports = [
  { description: "Post block rejects incorrect block type",
    fn: function() {
      try {
        let buf = new ArrayBuffer(80);
        (new DataView(buf)).setUint8(2, 0x00);
        let d_buf = new ArrayBuffer(40);
        (new DataView(d_buf)).setUint32(0, 0x0024ffff);
        let p = new Post(new Header(buf), d_buf);
        return false;
      } catch (e) {
        return true;
      }
    }
  },
  { description: "Post block rejects malformed data length",
    fn: function() {
      let buf = new ArrayBuffer(80);
      (new DataView(buf)).setUint8(2, 0x01);
      let d_buf = new ArrayBuffer(40);
      // data is 40 - 4 = 36 bytes long. 0x0027 !== 36 base 10.
      (new DataView(d_buf)).setUint32(0, 0x0027ffff);
      try {
        let p = new Post(new Header(buf), d_buf);
        return false;
      } catch (e) {
        return true;
      }
    }
  },
  { description: "Post block accepts correct block type and data length",
    fn: function() {
      let buf = new ArrayBuffer(80);
      (new DataView(buf)).setUint8(2, 0x01);
      let d_buf = new ArrayBuffer(41);
      let view = new DataView(d_buf);
      view.setUint32(0, 0x0024ffff);
      view.setUint8(40, 0xff);
      let p = new Post(new Header(buf), d_buf);
      Util.assert(p);
      Util.assert(p instanceof Post);
      return true;
    }
  },
  { description: "Post block returns correct content length",
    fn: function() {
      let buf = new ArrayBuffer(80);
      (new DataView(buf)).setUint8(2, 0x01);
      let d_buf = new ArrayBuffer(41);
      let view = new DataView(d_buf);
      view.setUint32(0, 0x0024ffff);
      view.setUint8(40, 0xff);
      let p = new Post(new Header(buf), d_buf);
      Util.assert(p.contentLength() === 36);
      return true;
    }
  },
  { description: "Post block returns correct content",
    fn: function() {
      let buf = new ArrayBuffer(80);
      (new DataView(buf)).setUint8(2, 0x01);
      let d_buf = new ArrayBuffer(41);
      let view = new DataView(d_buf);
      view.setUint32(0, 0x0024ffff);
      view.setUint32(12, 0xcccccccc);
      view.setUint8(40, 0xff);
      let content = new Post(new Header(buf), d_buf).content();
      for (let i = 0; i < 9; i++) {
        Util.assert(content.getUint32(i*4) === (i===2?0xcccccccc:0));
      }
      return true;
    }
  }
];
