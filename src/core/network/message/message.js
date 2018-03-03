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

const ErrorType = require('../../error.js');
const Hash = require('../../hash/blake2s.js');

module.exports = class Message {
  static HEADER_LENGTH() {
    return 12;
  }
  // 4 bytes magic #
  // 4 bytes command
  // 4 bytes checksum (first 4 bytes of hash(payload))
  // n bytes payload
  constructor(data, expectedPayloadLength = 0) {
    if (data.byteLength < Message.HEADER_LENGTH() + expectedPayloadLength) {
      throw ErrorType.dataLength();
    }
    this.data = data;

    const payloadHash = Hash.digest(data.subarray(
      Message.HEADER_LENGTH(),
      Message.HEADER_LENGTH() + expectedPayloadLength,
    ));
    const evalChecksum = Message.getUint32(payloadHash.slice(0, 4));
    if (evalChecksum !== this.checksum()) {
      throw ErrorType.dataHash();
    }
  }

  magic() {
    return Message.getUint32(this.data);
  }

  command() {
    return Message.getUint32(this.data, 4);
  }

  checksum() {
    return Message.getUint32(this.data, 8);
  }

  static getUint32(arr, index = 0) {
    return ((arr[index] << 24)
    ^ (arr[index + 1] << 16)
    ^ (arr[index + 2] << 8)
    ^ arr[index + 3]) >>> 0;
  }

  /* eslint-disable no-param-reassign */
  static setUint32(arr, value, index = 0) {
    arr[index + 0] = value << 24;
    arr[index + 1] = value << 16;
    arr[index + 2] = value << 8;
    arr[index + 3] = value;
  }
  /* eslint-enable no-param-reassign */

  static createData(magic, command, payload = new Uint8Array()) {
    const data = new Uint8Array(Message.HEADER_LENGTH() + payload.byteLength);
    Message.setUint32(data, magic, 0);
    Message.setUint32(data, command, 4);
    const checksum = Hash.digest(payload).slice(0, 4);
    data.set(checksum, 8);
    return data;
  }
};
