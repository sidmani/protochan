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
var Util = require('../../js/util.js');

const valid_buffer = new ArrayBuffer(80);
const view = new DataView(valid_buffer);

// protocol version
view.setUint16(0, 12345);
// block type
view.setUint8(2, 234);
// timestamp
view.setUint32(3, 274444555);
// nonce
view.setUint32(7, 777711889);
// prevHash
var prev_hash_result = [ // random integers
  0xea38ad19,
  0x6d64a34a,
  0xb082cd1e,
  0x12d7794e,
  0x8274924f,
  0xa18d96eb,
  0x50f83b55,
  0x85a75ea1
];
for (let i = 0; i < 8; i++) {
  view.setUint32(11+4*i, prev_hash_result[i]);
}
// dataHash
var data_hash_result = [
  0x12209fd7,
  0xb2f995dd,
  0x48a87405,
  0x61932d67,
  0x0ab39744,
  0x9c2aeea6,
  0xa3c515c3,
  0x6e27d3f4
]
for (let i = 0; i < 8; i++) {
  view.setUint32(43+4*i, data_hash_result[i]);
}

view.setUint32(75, 0x4e5be7e9);

module.exports = [
  { description: "Header rejects undefined data",
    shouldFail: true,
    fn: function() {
      new Header(undefined);
    }
  },
  { description: "Header rejects data of wrong type",
    shouldFail: true,
    fn: function() {
      new Header(new Array());
    }
  },
  { description: "Header rejects data of wrong length",
    shouldFail: true,
    fn: function() {
      new Header(new ArrayBuffer(12));
    }
  },
  { description: "Header accepts properly typed data",
    fn: function() {
      var h = new Header(new ArrayBuffer(80));
      Util.assert(h);
      Util.assert(h instanceof Header);
    }
  },
  { description: "Header returns correct protocol version",
    fn: function() {
      var h = new Header(valid_buffer);
      Util.assert(h.protocolVersion() === 12345);
    }
  },
  { description: "Header returns correct block type",
    fn: function() {
      var h = new Header(valid_buffer);
      Util.assert(h.blockType() === 234);
    }
  },
  { description: "Header returns correct timestamp",
    fn: function() {
      var h = new Header(valid_buffer);
      Util.assert(h.timestamp() === 274444555);
    }
  },
  { description: "Header returns correct nonce",
    fn: function() {
      var h = new Header(valid_buffer);
      Util.assert(h.nonce() === 777711889);
    }
  },
  { description: "Header returns correct previous hash",
    fn: function() {
      var h = new Header(valid_buffer);
      var prevHash = h.prevHash();
      for (let i = 0; i < 8; i++) {
        Util.assert(prevHash.getUint32(i*4) === prev_hash_result[i], 'incorrect hash byte');
      }
    }
  },
  { description: "Header returns correct data hash",
    fn: function() {
      var h = new Header(valid_buffer);
      var dataHash = h.dataHash();
      for (let i = 0; i < 8; i++) {
        Util.assert(dataHash.getUint32(i*4) === data_hash_result[i], 'incorrect hash byte');
      }
    }
  },
  { description: "Header returns correct board ID",
    fn: function() {
      var h = new Header(valid_buffer);
      Util.assert(h.board() === 0x4e5be7e9);
    }
  }
]
