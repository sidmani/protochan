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
      dataView.setUint32(0, 0x03002429);
      dataView.setUint8(40, 0x04);
      let header = common.validHeaderFromData(d_buf);
      if (shouldPass) {
        header.data[2] = 0x01;
      } else {
        header.data[2] = 0x00;
      }
      new Post(header, d_buf);
    }
  },
  { description: "Post block requires at least two control bytes",
    dual: true,
    fn: function(shouldPass) {
      let d_buf = new ArrayBuffer(41);
      let dataView = new DataView(d_buf);
      dataView.setUint8(40, 0x04);
      if (shouldPass) {
        dataView.setUint32(0, 0x03002429);
      } else {
        dataView.setUint32(0, 0x02252900);
      }
      let header = common.validPostHeaderFromData(d_buf);

      new Post(header, d_buf);
    }
  },
];
