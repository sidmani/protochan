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
        d_buf = new ArrayBuffer(69);
        let view = new DataView(d_buf);
        view.setUint32(0, 0x03004029);
        view.setUint8(68, 0x04);
      } else {
        // make sure that super constructor check is not failing
        d_buf = new ArrayBuffer(133);
        let view = new DataView(d_buf);
        view.setUint32(0, 0x03008029);
        view.setUint32(75, 0xcefdab64);
        view.setUint8(132, 0x04);
      }

      let header = common.validThreadHeaderFromData(d_buf);
      new Genesis(header, d_buf);
    }
  },
  // prevHash = 0 identifies this as a genesis block
  { description: "Genesis block validates zero prevHash",
    dual: true,
    fn: function(shouldPass) {
      let d_buf = new ArrayBuffer(69);
      let view = new DataView(d_buf);
      view.setUint32(0, 0x03004029);
      view.setUint8(68, 0x04);

      let header = common.validThreadHeaderFromData(d_buf);

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
