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

var HashMap = require('../../js/hash/hashMap.js');
var common = require('../testCommon.js');

module.exports = [
  { description: "HashMap sets and gets block",
    fn: function() {
      let block = common.validPost();
      let map = new HashMap();
      let hash = map.set(block);
      common.assert(map.get(hash) === block);
    }
  },
  { description: "HashMap.set refuses to set same object twice",
    dual: true,
    fn: function(shouldPass) {
      let block = common.validPost();
      let map = new HashMap();
      let hash = map.set(block);
      if (!shouldPass) {
        map.set(block);
      }
      common.assert(map.get(hash) === block);
    }
  },
  { description: "HashMap.setRaw validates hash type",
    dual: true,
    fn: function(shouldPass) {
      let block = common.validPost();
      let map = new HashMap();
      let hash;
      if (shouldPass) {
        hash = new Uint8Array([5, 4, 1]);
      } else {
        hash = [5, 4, 1];
      }

      map.setRaw(hash, block);
    }
  },
  { description: "HashMap.setRaw sets block",
    fn: function() {
      let block = common.validPost();
      let map = new HashMap();
      let hash = map.setRaw(new Uint8Array([5, 4, 3]), block);
      common.assert(map.get(new Uint8Array([5, 4, 3])) === block);
    }
  },
  { description: "HashMap.setRaw obeys overwrite flag",
    dual: true,
    fn: function(shouldPass) {
      let block = common.validPost();
      let map = new HashMap();
      let hash = map.setRaw(new Uint8Array([5, 4, 3]), block);
      map.setRaw(new Uint8Array([5, 4, 3]), block, shouldPass);
      common.assert(map.get(new Uint8Array([5, 4, 3])) === block);
    }
  },
  { description: "HashMap enumerates set objects",
    fn: function() {
      let block1 = common.validPost();
      let block2 = common.validPost();
      let block3 = common.validPost();

      let map = new HashMap();
      let hash1 = map.setRaw(new Uint8Array([5, 4, 3]), block1);
      let hash2 = map.setRaw(new Uint8Array([6, 2, 1]), block2);
      let hash3 = map.setRaw(new Uint8Array([5, 7, 8]), block3);

      let result = map.enumerate();
      common.assertJSArrayEquality(result, [block1, block2, block3]);
    }
  }
];
