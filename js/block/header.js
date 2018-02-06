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

"use strict";

var Util = require('../util.js');
var ErrorType = require('../error.js');

/**
 * The block header.
 */
class Header {
  /**
   * Create a header from an 80-byte ArrayBuffer.
   * @param {ArrayBuffer} buffer - The source buffer.
   */
  constructor(buffer) {
    // parameter validation
    if (!(buffer instanceof ArrayBuffer)) throw ErrorType.Parameter.type();

    // Assert that the buffer is exactly 80 bytes long
    if (buffer.byteLength !== 80) throw ErrorType.Data.length();

    this.data = new Uint8Array(buffer);
  }

  // For mining
  setNonce(value) {
    this.data[7] = value >> 24;
    this.data[8] = value >> 16;
    this.data[9] = value >> 8;
    this.data[10] = value;
  }

  // fastest way to increment a uint32 that's split by bytes (?)
  incrNonce() {
    if (this.data[10] < 0xff) {
      this.data[10] += 1;
    } else if (this.data[9] < 0xff) {
      this.data[9] += 1;
      this.data[10] = 0x00;
    } else if (this.data[8] < 0xff) {
      this.data[8] += 1;
      this.data[9] = 0x00;
      this.data[10] = 0x00;
    } else {
      this.data[7] += 1;
      this.data[8] = 0x00;
      this.data[9] = 0x00;
      this.data[10] = 0x00;
    }
  }

  /// Protocol version (uint16)
  protocolVersion() {
    return (this.data[0] << 8) + this.data[1];
  }

  /// Block type (uint8)
  blockType() {
    return this.data[2];
  }

  // Unix timestamp (uint32)
  timestamp() {
    return (this.data[3] << 24) + (this.data[4] << 16) + (this.data[5] << 8) + this.data[6];
  }

  // nonce (uint32)
  nonce() {
    return (this.data[7] << 24) + (this.data[8] << 16) + (this.data[9] << 8) + this.data[10];
  }

  // 32 bytes
  prevHash() {
    return this.data.subarray(11, 43);
  }

  // 32 bytes
  dataHash() {
    return this.data.subarray(43, 75);
  }

  // board id (uint32)
  board() {
    return (this.data[75] << 24) + (this.data[76] << 16) + (this.data[77] << 8) + this.data[78];
  }

  // additional flags
  reserved() {
    return this.data[79];
  }
}

module.exports = Header;
