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
var common = require('../testCommon.js');

module.exports = [
  { description: "Genesis block validates data length",
    dual: true,
    fn: function(shouldPass) {
      let d_buf;

      // set the correct length (64) if should pass
      if (shouldPass) {
        d_buf = new ArrayBuffer(64);
      } else {
        // make sure that super constructor check is not failing
        d_buf = new ArrayBuffer(128);
      }

      let dataView = new DataView(d_buf);
      for (let i = 0; i < 32; i++) {
        dataView.setUint8(i, 0x00);
      }

      // end index is different for data, avoid overflow err
      if (shouldPass) {
        for (let i = 32; i < 64; i++) {
          dataView.setUint8(i, 0x01);
        }
      } else {
        for (let i = 32; i < 63; i++) {
          dataView.setUint8(i, 0x01);
        }
      }

      let header = common.validThreadHeaderFromData(d_buf);
      header.data[79] = 0xec; //nonzero max threads
      new Genesis(header, d_buf);
    }
  },
  // prevHash = 0 identifies this as a genesis block
  { description: "Genesis block validates zero prevHash",
    dual: true,
    fn: function(shouldPass) {
      let d_buf = new ArrayBuffer(64);
      let header = common.validThreadHeaderFromData(d_buf);
      header.data[79] = 0xec; //nonzero max threads

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
