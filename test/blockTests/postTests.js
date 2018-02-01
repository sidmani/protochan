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

module.exports = [
  { description: "Post block validates block type",
    dual: true,
    fn: function(shouldPass) {
      let d_buf = new ArrayBuffer(41);
      let dataView = new DataView(d_buf);
      dataView.setUint32(0, 0x0024ffff);
      dataView.setUint8(40, 0xff);
      let header = common.validHeaderFromData(d_buf);
      if (shouldPass) {
        header.data[2] = 0x01;
      } else {
        header.data[2] = 0x00;
      }
      new Post(header, d_buf);
    }
  },
  { description: "Post block validates data length",
    dual: true,
    fn: function(shouldPass) {
      let d_buf = new ArrayBuffer(41);
      let dataView = new DataView(d_buf);
      dataView.setUint8(40, 0xff);
      if (shouldPass) {
        dataView.setUint32(0, 0x0024ffff);
      } else {
        dataView.setUint32(0, 0x0025ffff);
      }
      let header = common.validPostHeaderFromData(d_buf);

      new Post(header, d_buf);
    }
  },
  { description: "Post block validates data padding",
    dual: true,
    fn: function(shouldPass) {
      let d_buf = new ArrayBuffer(41);
      let dataView = new DataView(d_buf);
      dataView.setUint8(40, 0xff);
      if (shouldPass) {
        dataView.setUint32(0, 0x0024ffff);
      } else {
        dataView.setUint32(0, 0x0024fccf);
      }
      let header = common.validPostHeaderFromData(d_buf);

      new Post(header, d_buf);
    }
  },
  { description: "Post block validates data terminator",
    dual: true,
    fn: function(shouldPass) {
      let d_buf = new ArrayBuffer(41);
      let dataView = new DataView(d_buf);
      dataView.setUint32(0, 0x0024ffff);
      if (shouldPass) {
        dataView.setUint8(40, 0xff);
      } else {
        dataView.setUint8(40, 0xee);
      }
      let header = common.validPostHeaderFromData(d_buf);

      new Post(header, d_buf);
    }
  },
  { description: "Post block accepts correct block type and data length",
    fn: function() {
      let d_buf = new ArrayBuffer(41);
      let view = new DataView(d_buf);
      view.setUint32(0, 0x0024ffff);
      view.setUint8(40, 0xff);

      let header = common.validPostHeaderFromData(d_buf);

      let p = new Post(header, d_buf);
      common.assert(p instanceof Post);
    }
  },
  { description: "Post block returns correct content length",
    fn: function() {
      let d_buf = new ArrayBuffer(41);
      let view = new DataView(d_buf);
      view.setUint32(0, 0x0024ffff);
      view.setUint8(40, 0xff);

      let header = common.validPostHeaderFromData(d_buf);

      let p = new Post(header, d_buf);
      common.assert(p.contentLength() === 36);
    }
  },
  { description: "Post block returns correct content",
    fn: function() {
      let d_buf = new ArrayBuffer(41);
      let view = new DataView(d_buf);
      view.setUint32(0, 0x0024ffff);
      view.setUint32(12, 0xcccccccc);
      view.setUint8(40, 0xff);

      let header = common.validPostHeaderFromData(d_buf);

      let content = new Post(header, d_buf).content();
      for (let i = 0; i < 9; i++) {
        common.assert(content.getUint32(i*4) === (i===2?0xcccccccc:0));
      }
    }
  }
];
