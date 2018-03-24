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
const Connection = require('../../../src/core/network/connection/connection.js');

tap.test('Connection', (t) => {
  const c = new Connection('127.0.1.2', 8333, 0x13371337);

  let arr = [];

  t.equal(c.address, '127.0.1.2', 'Connection formats ip correctly');
  t.strictSame(c.netaddr(0xAABBCCDD, 0xFF3AB4A1).data, new Uint8Array([
    0xAA, 0xBB, 0xCC, 0xDD,
    0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0xFF, 0xFF,
    0x7F, 0x00, 0x01, 0x02,
    0x20, 0x8D,
    0xFF, 0x3A, 0xB4, 0xA1,
  ]), 'Connection generates netaddr');

  c.terminate.on(d => arr.push(d || 1));
  c.incoming.on(d => arr.push(d));
  c.outgoing.on(d => arr.push(d));

  c.receive([0x13, 0x37, 0x13, 0x37]);
  c.receive([0x13, 0x37, 0x13, 0x38]);

  t.strictSame(arr, [new Uint8Array([0x13, 0x37, 0x13, 0x37])], 'Connection.receive filters magic and creates uint8array');
  arr = [];
  c.close();
  c.incoming.next();
  c.outgoing.next();
  c.terminate.next();

  t.strictSame(arr, [1], 'Connection.close triggers terminate and destroys all streams');

  t.end();
});
