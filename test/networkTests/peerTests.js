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

const Ping = require('../../src/core/network/message/types/ping.js');
const Pong = require('../../src/core/network/message/types/pong.js');
const Version = require('../../src/core/network/message/types/version.js');
const Verack = require('../../src/core/network/message/types/verack.js');

tap.test('Peer', (t) => {
  const stream = new Stream();
  let latest;
  const connection = {
    stream,
    send(data) { latest = data; },
    terminate() {
      this.stream.destroy();
    },
  };

  const host = {
    magic: 0x13371337,
    services: 0x10000010,
    version: 3,
  };

  const p = new Peer(connection, host);

  stream.next(Ping.generic(0x13371337, Ping.COMMAND(), 5).data);
  t.equal(latest, undefined, 'Peer does not respond to pings before handshake');
  p.initialize();
  let msg = new Version(latest);
  t.equal(msg.command(), 0, 'Peer.init sends version message');
  t.equal(msg.version(), 3, 'Peer.init sends correct version');
  t.equal(msg.services(), 0x10000010, 'Peer.init sends correct service bitmask');
  stream.next(Version.create(0x13371337, 2, 0x10100000, 11).data);
  t.equal(p.version, 2, 'Peer sets version to minimum of both clients');
  t.equal(p.services, 0x10000000, 'Peer sets services to common only');
  msg = new Verack(latest);
  t.equal(msg.command(), 1, 'Peer sends verack after receiving version');
  stream.next(Verack.generic(0x13371337, Verack.COMMAND(), 19).data);
  stream.next(Ping.generic(0x13371337, Ping.COMMAND(), 5).data);
  msg = new Pong(latest);
  t.equal(msg.command(), 3, 'Peer responds to ping after handshake is complete');

  p.terminate.next();
  t.end();
});
