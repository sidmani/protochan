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

var Util = require('../util.js');
var Header = require('./header.js');
var Hash = require('../hash/blake2s.js');

module.exports = class Block {
  constructor(header, data) {
    Util.assert(header instanceof Header);
    Util.assert(data instanceof ArrayBuffer);

    // XXX: untested
    // Absolute max size of a block's databuffer is
    // 2^16-1 (uint16) - 80 (header) - 100 (any packet headers)  = 65355.
    Util.assert(data.byteLength < 65355);

    this.header = header;
    this.data = new Uint8Array(data);

    // Assert that the hash of the data is equal to the
    // hash stored in the header
    // TODO: move to the post and thread blocks
    // and replace with a merkle tree for the thread block?
    Util.assertArrayEquality(
      Hash.digest(this.data), header.dataHash()
    );
  }

  hash() {
    return Hash.digest(this.header.data);
  }
};
