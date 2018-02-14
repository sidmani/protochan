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

'use strict';

const ErrorType = require('../error.js');

/**
 * The block header.
 */
class Header {
  /**
   * Create a header from an 80-byte ArrayBuffer.
   * @param {ArrayBuffer} buffer - The source buffer.
   */
  constructor(data) {
    // parameter validation
    if (!(data instanceof Uint8Array)) throw ErrorType.Parameter.type();

    // Assert that the array is exactly 80 bytes long
    if (data.byteLength !== 80) throw ErrorType.Data.length();

    this.data = data;
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
    // let sum = this.data[10] + 1;
    // console.log('sum: ' + sum);
    // this.data[10] = sum;
    // let sum2 = this.data[9] + Math.floor(sum / 256);
    // console.log('sum2: ' + sum2);
    // this.data[9] = sum2;
    // let sum3 = this.data[8] + Math.floor(sum2 / 256);
    // this.data[8] = sum3;
    // console.log('sum3: ' + sum3);
    // this.data[9] += Math.floor(sum3 / 256);
    // console.log('data9 ' + this.data[9]);
    // 235, 255, 255, 255
    // expect 236, 0, 0, 0
    // sum = 256
    // data[10] = 0
    // sum2 = 255 + 256/256 = 256
    // data[9] = 0
    // sum3 = 255 + 256/256 = 256
    // data[8] = 0
    // data[9] = 256/256 + 235 = 236
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

  // Protocol version (uint16)
  protocolVersion() {
    return ((this.data[0] << 8) ^ this.data[1]) >>> 0;
  }

  // Block type (uint8)
  blockType() {
    return this.data[2];
  }

  // Unix timestamp (uint32)
  timestamp() {
    return this.getUint32(3);
  }

  // nonce (uint32)
  nonce() {
    return this.getUint32(7);
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
    return this.getUint32(75);
  }

  // additional flags
  reserved() {
    return this.data[79];
  }

  getUint32(index) {
    return ((this.data[index] << 24)
    ^ (this.data[index + 1] << 16)
    ^ (this.data[index + 2] << 8)
    ^ this.data[index + 3]) >>> 0;
  }

  static createFrom(protocolVersion, blockType, timestamp, nonce, prevHash, dataHash, board, reserved) {
    const buffer = new ArrayBuffer(80);
    const data = new DataView(buffer);
    data.setUint16(0, protocolVersion);
    data.setUint8(2, blockType);
    data.setUint32(3, timestamp);
    data.setUint32(7, nonce);
    for (let i = 0; i < 32; i += 1) {
      data.setUint8(i + 11, prevHash[i]);
      data.setUint8(i + 43, dataHash[i]);
    }
    data.setUint32(75, board);
    data.setUint8(79, reserved);
    return new Header(new Uint8Array(data.buffer));
  }

  serialize() {
    return this.data;
  }

  static deserialize(data) {
    return new Header(data.subarray(0, 80));
  }
}

module.exports = Header;
