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
const Peer = require('../../src/core/network/peer.js');
const Stream = require('../../src/core/network/stream.js');

const Message = require('../../src/core/network/message/message.js');
const Ping = require('../../src/core/network/message/types/ping.js');
const Pong = require('../../src/core/network/message/types/pong.js');
const Version = require('../../src/core/network/message/types/version.js');
const Verack = require('../../src/core/network/message/types/verack.js');

tap.test('Peer', (t) => {
  const stream = new Stream();
  let latest;
  const connection = {
    incoming: stream,
    outgoing: new Stream().on((data) => { latest = data; }),
    terminate: new Stream(),
  };

  const p = new Peer(connection, 0x13371337);

  stream.next(Message.create(0x13371337, Ping.COMMAND(), 5, Ping.create()));
  t.equal(latest, undefined, 'Peer does not respond to pings before handshake');
  let v;
  let s;
  p.init(3, 0x10000010).on(({ version, services }) => {
    v = version;
    s = services;
  });
  let msg = new Version(latest);
  t.equal(msg.command(), 0, 'Peer.handshake sends version message');
  t.equal(msg.version(), 3, 'Peer.handshake sends correct version');
  t.equal(msg.services(), 0x10000010, 'Peer.handshake sends correct service bitmask');
  stream.next(Message.create(0x13371337, Version.COMMAND(), 15, Version.create(2, 0x10100000)));
  t.equal(v, undefined, 'Peer doesn\'t return version before verack');
  stream.next(Message.create(0x13371337, Verack.COMMAND(), 15, Verack.create()));
  t.equal(v, 2, 'Peer sets version to minimum of both clients');
  t.equal(s, 0x10000000, 'Peer sets services to common only');
  stream.next(Message.create(0x13371337, Ping.COMMAND(), 5, Ping.create()));
  msg = new Pong(latest);
  t.equal(msg.command(), 3, 'Peer responds to ping after handshake is complete');

  connection.incoming.destroy();
  connection.outgoing.destroy();
  connection.terminate.next();
  t.end();
});
