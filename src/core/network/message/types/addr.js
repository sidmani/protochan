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
const Netaddr = require('../data/netaddr.js');

module.exports = class Addr extends Message {
  static COMMAND() { return 0x00000006; }

  static match(data) { return Message.getCommand(data) === Addr.COMMAND(); }

  constructor(data) {
    super(data, 1 + (data[Message.HEADER_LENGTH()] * Netaddr.BYTE_LENGTH()));
  }

  addressCount() {
    return this.data[Message.HEADER_LENGTH()];
  }

  address(index) {
    return new Netaddr(
      this.data,
      Message.HEADER_LENGTH()
       + 1
       + (index * Netaddr.BYTE_LENGTH()),
    );
  }

  forEach(fn) {
    const count = this.addressCount();
    for (let i = 0; i < count; i += 1) {
      fn(this.address(i));
    }
  }

  static create(addresses) {
    const payload = new Uint8Array(1 + (addresses.length * Netaddr.BYTE_LENGTH()));
    payload[0] = addresses.length;
    for (let i = 0; i < addresses.length; i += 1) {
      const addressData = addresses[i].data.subarray(
        addresses[i].offset,
        addresses[i].offset + Netaddr.BYTE_LENGTH(),
      );
      payload.set(addressData, 1 + (Netaddr.BYTE_LENGTH() * i));
    }
    return payload;
  }
};
