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
var GenesisPost = require('../../js/block/genesisPost.js');

module.exports = [
  { description: "Genesis post validates zero prevHash",
    dual: true,
    fn: function(shouldPass) {
      let d_buf = new ArrayBuffer(41);
      let dataView = new DataView(d_buf);
      dataView.setUint32(0, 0x0024ffff);
      dataView.setUint8(8, 0xff); // maxThreads != 0
      dataView.setUint8(40, 0xff);
      let header = common.validPostHeaderFromData(d_buf);

      // the correct index is [11, 42] inclusive
      // using 33 to 42 here so that there's no confusion with
      // the 0 to 32 zeros in the data's thread 0
      if (shouldPass) {
        for (let i = 33; i < 43; i++) {
          header.data[i] = 0;
        }
      } else {
        for (let i = 33; i < 43; i++) {
          header.data[i] = 1;
        }
      }
      new GenesisPost(header, d_buf);
    }
  },
  { description: "Genesis post validates minimum contentLength",
    dual: true,
    fn: function(shouldPass) {
      let d_buf;
      if (shouldPass) {
        d_buf = new ArrayBuffer(10);
        let dataView = new DataView(d_buf);
        dataView.setUint32(0, 0x0005ffff);
        dataView.setUint8(9, 0xff);
        dataView.setUint8(8, 0xff); // maxThreads != 0
      } else {
        d_buf = new ArrayBuffer(8);
        let dataView = new DataView(d_buf);
        dataView.setUint32(0, 0x0003ffff);
        dataView.setUint8(7, 0xff);
        dataView.setUint8(8, 0xff); // maxThreads != 0
      }
      let header = common.validPostHeaderFromData(d_buf);
      new GenesisPost(header, d_buf);
    }
  },
  { description: "Genesis post validates max post difficulty greater than min post difficulty",
    dual: true,
    fn: function(shouldPass) {
      let d_buf = new ArrayBuffer(10);
      let dataView = new DataView(d_buf);
      dataView.setUint32(0, 0x0005ffff);
      dataView.setUint8(4, 0xcc);
      dataView.setUint8(8, 0xff); // maxThreads != 0
      dataView.setUint8(9, 0xff);

      if (shouldPass) {
        dataView.setUint8(5, 0xcd);
      } else {
        dataView.setUint8(5, 0xcb);
      }

      let header = common.validPostHeaderFromData(d_buf);
      new GenesisPost(header, d_buf);
    }
  },
  { description: "Genesis post validates max thread difficulty greater than max post difficulty",
    dual: true,
    fn: function(shouldPass) {
      let d_buf = new ArrayBuffer(10);
      let dataView = new DataView(d_buf);
      dataView.setUint32(0, 0x0005ffff);
      dataView.setUint8(6, 0xcc);
      dataView.setUint8(8, 0xff); // maxThreads != 0
      dataView.setUint8(9, 0xff);

      if (shouldPass) {
        dataView.setUint8(7, 0xcd);
      } else {
        dataView.setUint8(7, 0xcb);
      }

      let header = common.validPostHeaderFromData(d_buf);
      new GenesisPost(header, d_buf);
    }
  },
  { description: "Genesis post validates max thread count > 0",
    dual: true,
    fn: function(shouldPass) {
      let d_buf = new ArrayBuffer(10);
      let dataView = new DataView(d_buf);
      dataView.setUint32(0, 0x0005ffff);
      dataView.setUint8(9, 0xff);

      if (shouldPass) {
        dataView.setUint8(8, 0x01);
      } else {
        dataView.setUint8(8, 0x00);
      }

      let header = common.validPostHeaderFromData(d_buf);
      new GenesisPost(header, d_buf);
    }
  },
  { description: "Genesis post returns correct minimum post difficulty",
    fn: function() {
      let d_buf = new ArrayBuffer(10);
      let dataView = new DataView(d_buf);
      dataView.setUint32(0, 0x0005ffff);
      dataView.setUint32(4, 0xcccdcecf);
      dataView.setUint8(8, 0xff); // maxThreads != 0
      dataView.setUint8(9, 0xff);
      let header = common.validPostHeaderFromData(d_buf);
      let p = new GenesisPost(header, d_buf);
      common.assert(p.minPostDifficulty() === 0xcc);
    }
  },
  { description: "Genesis post returns correct maximum post difficulty",
    fn: function() {
      let d_buf = new ArrayBuffer(10);
      let dataView = new DataView(d_buf);
      dataView.setUint32(0, 0x0005ffff);
      dataView.setUint32(4, 0xcccdcecf);
      dataView.setUint8(8, 0xff); // maxThreads != 0
      dataView.setUint8(9, 0xff);
      let header = common.validPostHeaderFromData(d_buf);
      let p = new GenesisPost(header, d_buf);
      common.assert(p.maxPostDifficulty() === 0xcd);
    }
  },
  { description: "Genesis post returns correct minimum thread difficulty",
    fn: function() {
      let d_buf = new ArrayBuffer(10);
      let dataView = new DataView(d_buf);
      dataView.setUint32(0, 0x0005ffff);
      dataView.setUint32(4, 0xcccdcecf);
      dataView.setUint8(8, 0xff); // maxThreads != 0
      dataView.setUint8(9, 0xff);
      let header = common.validPostHeaderFromData(d_buf);
      let p = new GenesisPost(header, d_buf);
      common.assert(p.minThreadDifficulty() === 0xce);
    }
  },
  { description: "Genesis post returns correct maximum thread difficulty",
    fn: function() {
      let d_buf = new ArrayBuffer(10);
      let dataView = new DataView(d_buf);
      dataView.setUint32(0, 0x0005ffff);
      dataView.setUint32(4, 0xcccdcecf);
      dataView.setUint8(8, 0xff); // maxThreads != 0
      dataView.setUint8(9, 0xff);
      let header = common.validPostHeaderFromData(d_buf);
      let p = new GenesisPost(header, d_buf);
      common.assert(p.maxThreadDifficulty() === 0xcf);
    }
  },
  { description: "Genesis post returns correct maximum thread count",
    fn: function() {
      let d_buf = new ArrayBuffer(10);
      let dataView = new DataView(d_buf);
      dataView.setUint32(0, 0x0005ffff);
      dataView.setUint32(4, 0xcccdcecf);
      dataView.setUint8(8, 0x9a); // maxThreads != 0
      dataView.setUint8(9, 0xff);
      let header = common.validPostHeaderFromData(d_buf);
      let p = new GenesisPost(header, d_buf);
      common.assert(p.maxThreads() === 0x9a);
    }
  }
]
