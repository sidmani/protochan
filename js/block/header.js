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
  constructor(buffer) {
    Util.assert(buffer, 'Data does not exist.');
    Util.assert(buffer instanceof ArrayBuffer, 'Data is of wrong type.');

    // Assert that the buffer is exactly 80 bytes long
    Util.assert(buffer.byteLength === 80, 'Data is of wrong length.');

    this._data = new DataView(buffer);
    this.data = new Uint8Array(buffer);
  }

  /// Protocol version (uint16)
  protocolVersion() {
    return this._data.getUint16(0);
  }

  /// Block type (uint8)
  blockType() {
    return this._data.getUint8(2);
  }

  // Unix timestamp (uint32)
  timestamp() {
    return this._data.getUint32(3);
  }

  // nonce (uint32)
  nonce() {
    return this._data.getUint32(7);
  }

  // 32 bytes
  prevHash() {
    return new Uint8Array(this.data.buffer, 11, 32);
  }

  // 32 bytes
  dataHash() {
    return new Uint8Array(this.data.buffer, 43, 32);
  }

  // board id (uint32)
  board() {
    return this._data.getUint32(75);
  }

  // genesis block uses this for max thread count
  // for other blocks, can be used for additional flags
  reserved() {
    return this._data.getUint8(79);
  }
};
