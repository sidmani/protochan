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
  { description: "GenesisPost validates zero prevHash",
    dual: true,
    fn: function(shouldPass) {
      let d_buf = new ArrayBuffer(41);
      let dataView = new DataView(d_buf);
      dataView.setUint32(0, 0x0024ffff);
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
  }
]
