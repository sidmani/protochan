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

const Message = require('../message.js');
const Services = require('../data/services.js');
/* eslint-disable no-unused-vars */
const ByteArray = require('../../../util/byteArray.js');
/* eslint-enable no-unused-vars */

module.exports = class Version extends Message {
  static COMMAND() { return 0x00000000; }
  static PAYLOAD_LENGTH() { return 12; }

  constructor(data) {
    super(data, Version.PAYLOAD_LENGTH());
    this.services = new Services(this.rawServices());
  }

  version() {
    return this.data.getUint32(Message.HEADER_LENGTH());
  }

  rawServices() {
    return this.data.getUint32(Message.HEADER_LENGTH() + 4);
  }

  nonce() {
    return this.data.getUint32(Message.HEADER_LENGTH() + 8);
  }

  static create(version, services, nonce) {
    const data = new Uint8Array(Version.PAYLOAD_LENGTH());
    data.setUint32(0, version);
    data.setUint32(4, services);
    data.setUint32(8, nonce);
    return data;
  }
};
