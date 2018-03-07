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
/* eslint-disable no-unused-vars */
const ByteArray = require('../../util/byteArray.js');
/* eslint-enable no-unused-vars */

module.exports = class Message {
  static HEADER_LENGTH() {
    return 16;
  }

  constructor(data, expectedPayloadLength = 0) {
    if (data.byteLength < Message.HEADER_LENGTH() + expectedPayloadLength) {
      throw ErrorType.dataLength();
    }
    this.data = data;

    const payloadHash = Hash.digest(data.subarray(
      Message.HEADER_LENGTH(),
      Message.HEADER_LENGTH() + expectedPayloadLength,
    ));
    const evalChecksum = payloadHash.slice(0, 4).getUint32(0);
    if (evalChecksum !== this.checksum()) {
      throw ErrorType.dataHash();
    }
  }

  magic() {
    return this.data.getUint32(0);
  }

  command() {
    return this.data.getUint32(4);
  }

  timestamp() {
    return this.data.getUint32(8);
  }

  checksum() {
    return this.data.getUint32(12);
  }

  static set(data, magic, command, timestamp) {
    data.setUint32(0, magic);
    data.setUint32(4, command);
    data.setUint32(8, timestamp);
    const checksum = Hash.digest(data.slice(16)).slice(0, 4);
    data.set(checksum, 12);
  }

  static generic(magic, command, timestamp) {
    const data = new Uint8Array(Message.HEADER_LENGTH());
    Message.set(data, magic, command, timestamp);
    return new Message(data);
  }
};
