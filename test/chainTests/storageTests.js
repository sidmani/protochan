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

var Storage = require('../../js/chain/storage.js');
var Util = require('../../js/util.js');
var testCommon = require('../testCommon.js');

module.exports = [
  { description: "Storage stores and retrieves object",
    fn: function() {
      var block = testCommon.validBlock();
      var hashMap = new Storage();
      hashMap.push(new Uint8Array([0x00, 0x33, 0x5f]), block);
      Util.assert(hashMap.get(new Uint8Array([0x00, 0x33, 0x5f])) === block);
    }
  },
  { description: "Storage automatically sets index",
    fn: function() {
      var block = testCommon.validBlock();
      var hashMap = new Storage();
      hashMap.push(new Uint8Array([0x00, 0x33, 0x5f]), block);
      Util.assert(hashMap.getIdx(0) === block);
    }
  },
  {
    description: "Storage count is correct",
     fn: function() {
       var block = testCommon.validBlock();
       var hashMap = new Storage();
       hashMap.push(new Uint8Array([0x00, 0x33, 0x5f]), block);
       hashMap.push(new Uint8Array([0x05, 0x33, 0x5f]), block);
       Util.assert(hashMap.count() === 2);
    }
  },
  { description: "Storage returns undefined for nonexistent object",
    fn: function() {
      var hashMap = new Storage();
      Util.assert(hashMap.get(new Uint8Array([0x00, 0x33, 0x5f])) === undefined);
    }
  }
]
