
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

const Hash = require('../../hash/blake2s.js');
const Difficulty = require('../../hash/difficulty.js');
const ErrorType = require('../../error.js');
const HashMap = require('../../hash/hashMap.js');
/* eslint-disable no-unused-vars */
const ByteArray = require('../../util/byteArray.js');
/* eslint-enable no-unused-vars */

/**
 * The block header.
 */
class Header {
  /**
   * Create a header from an 80-byte ArrayBuffer.
   * @param {ArrayBuffer} buffer - The source buffer.
   */
  constructor(data) {
    // check length is at least 80 bytes
    if (data.byteLength < 80) {
      throw ErrorType.dataLength();
    }

    this.data = data;

    const hash = Hash.digest(data);
    this.hash = HashMap.uint8ArrToHex(hash);
    this.difficulty = Difficulty.countLeadingZeroes(hash);

    this.dataHash = HashMap.uint8ArrToHex(this.rawDataHash());
    this.prevHash = HashMap.uint8ArrToHex(this.rawPrevHash());
  }

  // Protocol version (uint16)
  protocolVersion() {
    return this.data.getUint16(0);
  }

  // Block type (uint8)
  type() {
    return this.data[2];
  }

  // Unix timestamp (uint32)
  timestamp() {
    return this.data.getUint32(3);
  }

  // nonce (uint32)
  nonce() {
    return this.data.getUint32(7);
  }

  // 32 bytes
  rawPrevHash() {
    return this.data.subarray(11, 43);
  }

  // 32 bytes
  rawDataHash() {
    return this.data.subarray(43, 75);
  }

  // board id (uint32)
  board() {
    return this.data.getUint32(75);
  }

  // additional flags
  reserved() {
    return this.data[79];
  }

  static create(
    protocolVersion,
    blockType,
    timestamp,
    nonce,
    prevHash,
    dataHash,
    board,
    reserved,
  ) {
    const data = new Uint8Array(80);
    // const data = new DataView(buffer);
    data.setUint16(0, protocolVersion);
    data[2] = blockType;
    data.setUint32(3, timestamp);
    data.setUint32(7, nonce);
    for (let i = 0; i < 32; i += 1) {
      data[i + 11] = prevHash[i];
      data[i + 43] = dataHash[i];
    }
    data.setUint32(75, board);
    data[79] = reserved;
    return new Header(data);
  }

  serialize() {
    return this.data;
  }

  static deserialize(data) {
    return new Header(data);
  }
}

module.exports = Header;
