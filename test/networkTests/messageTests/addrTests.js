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
const Addr = require('../../../src/core/network/message/types/addr.js');
const ErrorType = require('../../../src/core/error.js');

tap.test('Message', (t) => {
  t.equal(Addr.COMMAND(), 0x00000006, 'Addr.COMMAND is unchanged');

  const data = new Uint8Array([
    // header
    0x13, 0x37, 0x13, 0x37,
    0x00, 0x00, 0x00, 0x05,
    0xAF, 0x49, 0xC8, 0x9E,
    0xDE, 0x6A, 0xA4, 0x7D,
    // payload
    0x02, // address count
    // address 1
    0x00, 0x00, 0x00, 0x01,
    0xAB, 0xDD, 0xFE, 0x1A,
    0x79, 0x64, 0x78, 0x9A,
    0x33, 0xB7, 0xE5, 0xE9,
    0xEE, 0xF7, 0xA1, 0xD4,
    0x13, 0x37,
    // address 2
    0x00, 0x00, 0x00, 0x03,
    0x33, 0xB7, 0xE5, 0xE9,
    0x79, 0x64, 0x78, 0x9A,
    0xAB, 0xDD, 0xFE, 0x1A,
    0xEE, 0xF7, 0xA1, 0xD4,
    0x13, 0x37,
  ]);

  t.assert(!Addr.match(data), 'Addr.match returns false for non-matching data');

  data[7] = 0x06;
  t.assert(Addr.match(data), 'Addr.match returns true for matching data');

  t.throws(() => new Addr(data.subarray(0, 30)), ErrorType.dataLength(), 'Addr rejects insufficient data length based on address count');

  let a;
  t.doesNotThrow(() => { a = new Addr(data); }, 'Addr accepts valid data');

  t.equal(a.addressCount(), 2, 'Addr gets address count');
  t.equal(a.address(1).offset, 39, 'Addr gets address at index');

  const forEach = [];
  a.forEach(addr => forEach.push(addr));
  t.strictSame(forEach.map(addr => addr.offset), [17, 39], 'Addr.forEach iterates over all addresses');

  t.strictSame(Addr.create(forEach), data.subarray(16), 'Addr.create works');
  t.end();
});
