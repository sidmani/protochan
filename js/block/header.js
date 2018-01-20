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

module.exports = class Header {
  constructor(data) {
    Util.assert(data, 'Data does not exist.');
    Util.assert(data instanceof Uint8Array, 'Data is of wrong type.');
    Util.assert(data.byteLength == 80, 'Data is of wrong length.');

    this.data = data;
  }

  /// Protocol version
  protocolVersion_raw() {
    return this.data.subarray(0, 1);
  }

  /// Block type
  blockType_raw() {
    return this.data.subarray(1, 2);
  }

  // Unix timstamp
  timestamp_raw() {
    return this.data.subarray(2, 6);
  }

  // nonce
  nonce_raw() {
    return this.data.subarray(6, 10);
  }

  prevHash() {
    return this.data.subarray(10, 42);
  }

  dataHash() {
    return this.data.subarray(42, 74);
  }

  reserved() {
    return this.data.subarray(75, 80);
  }
};
