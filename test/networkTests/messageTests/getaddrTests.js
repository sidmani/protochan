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
const Getaddr = require('../../../src/core/network/message/types/getaddr.js');
const Hash = require('../../../src/core/hash/blake2s.js');
tap.test('Getaddr', (t) => {
  t.equal(Getaddr.COMMAND(), 0x00000005, 'Getaddr.COMMAND is 5');
  t.equal(Getaddr.PAYLOAD_LENGTH(), 1, 'Getaddr.PAYLOAD_LENGTH is 1');


  const data = new Uint8Array([
    // header
    0x13, 0x37, 0x13, 0x37,
    0x00, 0x00, 0x00, 0x06,
    0xAF, 0x49, 0xC8, 0x9E,
    0xA2, 0x8A, 0xC1, 0x9D,
    // payload
    0x03, // max address count
  ]);

  const g = new Getaddr(data);

  t.equal(g.maxAddr(), 3, 'Getaddr returns max address count');
  t.strictSame(Getaddr.create(0x03), new Uint8Array([0x03]), 'Getaddr.create works');
  t.end();
});
