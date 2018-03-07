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
const Factory = require('../../src/core/network/message/factory.js');

tap.test('Peer', (t) => {
  const stream = new Stream();
  let latest;
  const connection = {
    stream,
    attach(s) {
      s.on((obj) => { latest = obj; });
    },
    terminate() {
      this.stream.destroy();
    },
  };

  const network = {
    magic: 0x13371337,
    services: 0x10000010,
    version: 1,
  };

  const p = new Peer(connection, network);
  stream.next(Factory.ping(0x13371337, 5).data);
  t.equal(latest, undefined, 'Peer does not respond to pings before handshake');
  p.init();
  let msg = Factory.create(latest);
  t.equal(msg.command(), 0, 'Peer.init sends version message');
  t.equal(msg.version(), 1, 'Peer.init sends correct version');
  t.equal(msg.services(), 0x10000010, 'Peer.init sends correct service bitmask');
  stream.next(Factory.version(0x13371337, 4, 0x10100000, 11).data);
  t.equal(p.version, 1, 'Peer sets version to minimum of both clients');
  t.equal(p.services, 0x10000000, 'Peer sets services to common only');
  msg = Factory.create(latest);
  t.equal(msg.command(), 1, 'Peer sends verack after receiving version');
  stream.next(Factory.verack(0x13371337, 19).data);
  stream.next(Factory.ping(0x13371337, 5).data);
  msg = Factory.create(latest);
  t.equal(msg.command(), 3, 'Peer responds to ping after handshake is complete');

  p.terminate();
  t.end();
});
