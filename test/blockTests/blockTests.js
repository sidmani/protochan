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

var Block = require('../../js/block/block.js');
var Header = require('../../js/block/header.js');
var Post = require('../../js/block/post.js');
var Util = require('../../js/util.js');

module.exports = [
  { description: "Block rejects undefined header",
    shouldFail: true,
    fn: function() {
      new Block(undefined, new ArrayBuffer(64));
    }
  },
  { description: "Block rejects header of wrong type",
    shouldFail: true,
    fn: function() {
      new Block(new Array(), new ArrayBuffer(64));
    }
  },
  { description: "Block rejects undefined data",
    shouldFail: true,
    fn: function() {
      new Block(new Header(new ArrayBuffer(80)), undefined);
    }
  },
  { description: "Block rejects data of wrong type",
    shouldFail: true,
    fn: function() {
      new Block(new Header(new ArrayBuffer(80)), new Array());
    }
  },
  { description: "Block accepts valid header and data",
    fn: function() {
      var b = new Block(new Header(new ArrayBuffer(80)), new ArrayBuffer(128));
      Util.assert(b);
      Util.assert(b instanceof Block);
    }
  },
]
