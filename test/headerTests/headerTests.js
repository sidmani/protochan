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
var common = require('../testCommon.js');

// prevHash
var prev_hash_result = new Uint8Array([ // random integers
  0xea, 0x38, 0xad, 0x19,
  0xea, 0x38, 0xad, 0x19,
  0xea, 0x38, 0xad, 0x19,
  0xea, 0x38, 0xad, 0x19,
  0xea, 0x38, 0xad, 0x19,
  0xea, 0x38, 0xad, 0x19,
  0xea, 0x38, 0xad, 0x19,
  0xea, 0x38, 0xad, 0x19,
]);

// dataHash
var data_hash_result = new Uint8Array([
  0xea, 0x38, 0xad, 0x19,
  0xea, 0x38, 0xad, 0x19,
  0xea, 0x38, 0xad, 0x19,
  0xea, 0x38, 0xad, 0x19,
  0xea, 0x38, 0xad, 0x19,
  0xea, 0x38, 0xad, 0x19,
  0xea, 0x38, 0xad, 0x19,
  0xea, 0x38, 0xad, 0x19,
]);

function validBuffer() {
  let valid_buffer = new ArrayBuffer(80);
  let view = new DataView(valid_buffer);

  // protocol version
  view.setUint16(0, 12345);
  // block type
  view.setUint8(2, 234);
  // timestamp
  view.setUint32(3, 274444555);
  // nonce
  view.setUint32(7, 777711889);
  for (let i = 0; i < 32; i++) {
    view.setUint8(11+i, prev_hash_result[i]);
  }

  for (let i = 0; i < 32; i++) {
    view.setUint8(43+i, data_hash_result[i]);
  }

  view.setUint32(75, 0x4e5be7e9);
  view.setUint8(79, 0x7c);
  return valid_buffer;
}


module.exports = [
  // these are all one-liners, so no need to use dual testing
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
      common.assert(h instanceof Header);
    }
  },
  { description: "Header sets nonce",
    fn: function() {
      var h = new Header(validBuffer());
      h.setNonce(0x5f4f3f2f);
      common.assert(h.nonce() === 0x5f4f3f2f);
    }
  },
  { description: "Header increments nonce",
    fn: function() {
      var h = new Header(validBuffer());
      h.setNonce(0x5f4f3fff);
      h.incrNonce();
      common.assert(h.nonce() === 0x5f4f4000);
    }
  },
  { description: "Header returns correct protocol version",
    fn: function() {
      var h = new Header(validBuffer());
      common.assert(h.protocolVersion() === 12345);
    }
  },
  { description: "Header returns correct block type",
    fn: function() {
      var h = new Header(validBuffer());
      common.assert(h.blockType() === 234);
    }
  },
  { description: "Header returns correct timestamp",
    fn: function() {
      var h = new Header(validBuffer());
      common.assert(h.timestamp() === 274444555);
    }
  },
  { description: "Header returns correct nonce",
    fn: function() {
      var h = new Header(validBuffer());
      common.assert(h.nonce() === 777711889);
    }
  },
  { description: "Header returns correct previous hash",
    fn: function() {
      var h = new Header(validBuffer());
      common.assertArrayEquality(h.prevHash(), prev_hash_result);
      // assertArrayEquality doesn't work since this is
      // comparing uint32s using the dataview
      // for (let i = 0; i < 8; i++) {
      //   common.assert(prevHash.getUint32(i*4) === prev_hash_result[i], 'incorrect hash byte');
      // }
    }
  },
  { description: "Header returns correct data hash",
    fn: function() {
      var h = new Header(validBuffer());
      common.assertArrayEquality(h.dataHash(), data_hash_result);
    }
  },
  { description: "Header returns correct board ID",
    fn: function() {
      var h = new Header(validBuffer());
      common.assert(h.board() === 0x4e5be7e9);
    }
  },
  { description: "Header returns correct reserved data",
      fn: function() {
        var h = new Header(validBuffer());
        common.assert(h.reserved() === 0x7c);
      }
  }
]
