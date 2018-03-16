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
const Message = require('../../../src/core/network/message/message.js');
const ErrorType = require('../../../src/core/error.js');

tap.test('Message', (t) => {
  const data = new Uint8Array([
    0x13, 0x37, 0x13, 0x37,
    0x00, 0x00, 0x00, 0x02,
    0xAF, 0x49, 0xC8, 0x9E,
    0x68, 0x21, 0x7A, 0x30,
  ]);
  t.equal(Message.HEADER_LENGTH(), 16, 'HEADER_LENGTH is unchanged');
  t.equal(Message.getMagic(data), 0x13371337, 'Static getMagic works');
  t.equal(Message.getCommand(data), 0x00000002, 'Static getCommand works');

  t.throws(() => new Message(data, 1), ErrorType.dataLength(), 'Message rejects data of insufficient length');
  t.throws(() => new Message(data), ErrorType.dataHash(), 'Message rejects mismatched checksum');
  let m;
  data[12] = 0x69; // correct value
  t.doesNotThrow(() => { m = new Message(data); }, 'Message accepts valid data');

  t.equal(m.magic(), 0x13371337, 'Message.magic returns magic value');
  t.equal(m.command(), 0x00000002, 'Message.command returns command');
  t.equal(m.timestamp(), 0xAF49C89E, 'Message.timestamp returns timestamp');
  t.equal(m.checksum(), 0x69217A30, 'Message.checksum returns checksum');

  t.strictSame(Message.create(0x13371337, 0x00000002, 0xAF49C89E, new Uint8Array()), m.data, 'Message.create works');
  t.strictSame(Message.create(0x13371337, 0x00000002, 0xAF49C89E), m.data, 'Message.create fills in undefined payload');

  t.end();
});
