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

const Services = require('./services.js');
/* eslint-disable no-unused-vars */
const ByteArray = require('../../../util/byteArray.js');
/* eslint-enable no-unused-vars */

module.exports = class NetAddress {
  static BYTE_LENGTH() {
    return 26;
  }

  constructor(data, offset = 0) {
    this.data = data;
    this.offset = offset;
    this.services = new Services(this.rawServices());
  }

  rawServices() {
    return this.data.getUint32(this.offset + 0);
  }

  IPv6() {
    return this.data.subarray(this.offset + 4, this.offset + 20);
  }

  IPv4() {
    return this.data.subarray(this.offset + 16, this.offset + 20);
  }

  port() {
    return this.data.getUint16(this.offset + 20);
  }

  timestamp() {
    return this.data.getUint32(this.offset + 22);
  }

  IPv4URL() {
    const ip = this.IPv4().join('.');
    const port = this.port();
    return `${ip}:${port}`;
  }

  static set(data, offset, services, ipv4, port, timestamp) {
    data.setUint32(offset + 0, services);
    data.setUint16(offset + 14, 0xFFFF);
    data.set(ipv4, offset + 16);
    data.setUint16(offset + 20, port);
    data.setUint32(offset + 22, timestamp);
  }
};
