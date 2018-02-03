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
      let d_buf = new ArrayBuffer(39);
      let dataView = new DataView(d_buf);
      dataView.setUint32(0, 0x08001D00);
      dataView.setUint32(4, 0x000000ff); // maxThreads != 0

      dataView.setUint8(8, 0x29);
      dataView.setUint8(38, 0x04);
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
        dataView.setUint32(0, 0x08000000);
        dataView.setUint32(4, 0x000000ff);
        dataView.setUint8(8, 0x29);
        dataView.setUint8(9, 0x04);
      } else {
        d_buf = new ArrayBuffer(10);
        let dataView = new DataView(d_buf);
        dataView.setUint32(0, 0x07000100);
        dataView.setUint32(4, 0x0000ff29);
        dataView.setUint8(9, 0x04);
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
      dataView.setUint32(0, 0x080000cc);
      dataView.setUint32(4, 0x000000ff);
      dataView.setUint8(8, 0x29);
      dataView.setUint8(9, 0x04);

      if (shouldPass) {
        dataView.setUint8(4, 0xcd);
      } else {
        dataView.setUint8(4, 0xcb);
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
      dataView.setUint32(0, 0x080000cc);
      dataView.setUint32(4, 0xefac00ff);
      dataView.setUint8(8, 0x29);
      dataView.setUint8(9, 0x04);

      if (shouldPass) {
        dataView.setUint8(6, 0xad);
      } else {
        dataView.setUint8(6, 0xab);
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
      dataView.setUint32(0, 0x080000cc);
      dataView.setUint32(4, 0xefacad00);
      dataView.setUint8(8, 0x29);
      dataView.setUint8(9, 0x04);

      if (shouldPass) {
        dataView.setUint8(7, 0x01);
      } else {
        dataView.setUint8(7, 0x00);
      }

      let header = common.validPostHeaderFromData(d_buf);
      new GenesisPost(header, d_buf);
    }
  },
  { description: "Genesis post returns correct minimum post difficulty",
    fn: function() {
      let d_buf = new ArrayBuffer(10);
      let dataView = new DataView(d_buf);
      dataView.setUint32(0, 0x080000cc);
      dataView.setUint32(4, 0xefacadae);
      dataView.setUint8(8, 0x29);
      dataView.setUint8(9, 0x04);
      let header = common.validPostHeaderFromData(d_buf);
      let p = new GenesisPost(header, d_buf);
      common.assert(p.minPostDifficulty() === 0xcc);
    }
  },
  { description: "Genesis post returns correct maximum post difficulty",
    fn: function() {
      let d_buf = new ArrayBuffer(10);
      let dataView = new DataView(d_buf);
      dataView.setUint32(0, 0x080000cc);
      dataView.setUint32(4, 0xefacadae);
      dataView.setUint8(8, 0x29);
      dataView.setUint8(9, 0x04);
      let header = common.validPostHeaderFromData(d_buf);
      let p = new GenesisPost(header, d_buf);
      common.assert(p.maxPostDifficulty() === 0xef);
    }
  },
  { description: "Genesis post returns correct minimum thread difficulty",
    fn: function() {
      let d_buf = new ArrayBuffer(10);
      let dataView = new DataView(d_buf);
      dataView.setUint32(0, 0x080000cc);
      dataView.setUint32(4, 0xefacadae);
      dataView.setUint8(8, 0x29);
      dataView.setUint8(9, 0x04);
      let header = common.validPostHeaderFromData(d_buf);
      let p = new GenesisPost(header, d_buf);
      common.assert(p.minThreadDifficulty() === 0xac);
    }
  },
  { description: "Genesis post returns correct maximum thread difficulty",
    fn: function() {
      let d_buf = new ArrayBuffer(10);
      let dataView = new DataView(d_buf);
      dataView.setUint32(0, 0x080000cc);
      dataView.setUint32(4, 0xefacadae);
      dataView.setUint8(8, 0x29);
      dataView.setUint8(9, 0x04);
      let header = common.validPostHeaderFromData(d_buf);
      let p = new GenesisPost(header, d_buf);
      common.assert(p.maxThreadDifficulty() === 0xad);
    }
  },
  { description: "Genesis post returns correct maximum thread count",
    fn: function() {
      let d_buf = new ArrayBuffer(10);
      let dataView = new DataView(d_buf);
      dataView.setUint32(0, 0x080000cc);
      dataView.setUint32(4, 0xefacad9a);
      dataView.setUint8(8, 0x29);
      dataView.setUint8(9, 0x04);
      let header = common.validPostHeaderFromData(d_buf);
      let p = new GenesisPost(header, d_buf);
      common.assert(p.maxThreads() === 0x9a);
    }
  }
]
