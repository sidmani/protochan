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

const tap = require('tap');
const Netaddr = require('../../../src/core/network/message/data/netaddr.js');

tap.test('Netaddr', (t) => {
  t.equal(Netaddr.BYTE_LENGTH(), 22, 'Netaddr.BYTE_LENGTH returns 22');

  const data = new Uint8Array([
    0xAB, // offset this
    0x00, 0x00, 0x00, 0x01, // services
    0xAB, 0xDD, 0xFE, 0x1A,
    0x79, 0x64, 0x78, 0x9A,
    0x33, 0xB7, 0xE5, 0xE9,
    0xEE, 0xF7, 0xA1, 0xD4,
    0x13, 0x37,
  ]);

  const n = new Netaddr(data, 1);
  t.assert(n.services.socketHost(), 'Netaddr sets services');
  t.equal(n.rawServices(), 0x00000001, 'Netaddr.rawServices returns services as uint32');
  t.strictSame(n.IPv6(), new Uint8Array([
    0xAB, 0xDD, 0xFE, 0x1A,
    0x79, 0x64, 0x78, 0x9A,
    0x33, 0xB7, 0xE5, 0xE9,
    0xEE, 0xF7, 0xA1, 0xD4,
  ]), 'Netaddr.IPv6 works');
  t.strictSame(n.IPv4(), new Uint8Array([
    0xEE, 0xF7, 0xA1, 0xD4,
  ]), 'Netaddr.IPv4 works');
  t.equal(n.port(), 0x1337, 'Netaddr.port works');
  t.equal(n.IPv4URL(), '238.247.161.212:4919', 'Netaddr.IPv4URL works');


  const setData = new Uint8Array(24);
  Netaddr.set(setData, 2, 0xABCDEF44, new Uint8Array([
    0xEE, 0x78, 0xD2, 0x3B,
  ]), 0x1337);
  t.strictSame(setData, new Uint8Array([
    0x00, 0x00,
    0xAB, 0xCD, 0xEF, 0x44,
    0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0xFF, 0xFF,
    0xEE, 0x78, 0xD2, 0x3B,
    0x13, 0x37,
  ]), 'Netaddr.set works');
  t.end();
});
