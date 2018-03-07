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
const Stream = require('../../../src/core/network/stream.js');
const Handshake = require('../../../src/core/network/protocol/handshake.js');
const Version = require('../../../src/core/network/message/types/version.js');

tap.test('Handshake', (t) => {
  const str = new Stream();
  let v;
  let s;
  const network = {
    magic: 0x13371337,
    services: 0x10000010,
    version: 1,
  };

  let msg;
  const outgoing = { next: (m) => { msg = m; } };

  Handshake(str, network, outgoing).on((obj) => {
    v = obj.version;
    s = obj.services;
  });

  str.next(Version.create(0x13371337, 4, 0x10100000, 11).data);
  t.equal(v, 1, 'Handshake sets version to minimum of both clients');
  t.equal(s, 0x10000000, 'Handshake sets services to common only');
  t.equal(msg.command(), 1, 'Peer sends verack after receiving version');
  t.end();
});
