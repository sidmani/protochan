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

var Genesis = require('../../js/block/genesis.js');
var Header = require('../../js/block/header.js');
var Util = require('../../js/util.js');
var testCommon = require('../testCommon.js');
module.exports = [
  { description: "Genesis block validates data length",
    dual: true,
    fn: function(shouldPass) {
      let d_buf;
      if (shouldPass) {
        d_buf = new ArrayBuffer(64);
      } else {
        d_buf = new ArrayBuffer(63);
      }

      let dataView = new DataView(d_buf);
      for (let i = 0; i < 32; i++) {
        dataView.setUint8(i, 0x00);
      }

      if (shouldPass) {
        for (let i = 32; i < 64; i++) {
          dataView.setUint8(i, 0x01);
        }
      } else {
        for (let i = 32; i < 63; i++) {
          dataView.setUint8(i, 0x01);
        }
      }

      let header = testCommon.validThreadHeaderFromData(d_buf);

      new Genesis(header, d_buf);
    }
  },
  { description: "Genesis block validates zero prevHash",
    dual: true,
    fn: function(shouldPass) {
      let d_buf = new ArrayBuffer(64);
      let header = testCommon.validThreadHeaderFromData(d_buf);
      if (shouldPass) {
        for (let i = 11; i < 43; i++) {
          header.data[i] = 0;
        }
      } else {
        for (let i = 11; i < 43; i++) {
          header.data[i] = 1;
        }
      }
      new Genesis(header, d_buf);
    }
  }
];
