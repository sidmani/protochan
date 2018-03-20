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
const Stream = require('../../../../src/core/network/stream.js');
const Handshake = require('../../../../src/core/network/protocol/component/handshake.js');
const Version = require('../../../../src/core/network/message/types/version.js');
const Verack = require('../../../../src/core/network/message/types/verack.js');
const Message = require('../../../../src/core/network/message/message.js');

// tap.test('Handshake', (t) => {
//   let v;
//   let s;
//   let conn;
//
//   let msg;
//   const translator = new Stream();
//   const c = {
//     incoming: new Stream(),
//     outgoing: new Stream(),
//     address: () => '111.222.333.444:5555',
//   };
//   c.outgoing.on((m) => { msg = m; });
//
//   Handshake.attach({ TRANSLATOR: translator }, 'foo', { version: 1, services: { mask: 0x10000010 } }).on((obj) => {
//     v = obj.version;
//     s = obj.services;
//   }).on(({ connection, version, services }) => {
//     v = version;
//     s = services;
//     conn = connection;
//   });
//   translator.next(c);
//
//   // t.equal(msg.command, 0, 'Handshake sends version on init');
//   msg = undefined;
//   c.incoming.next(Message.create(
//     0x13371337,
//     Version.COMMAND(),
//     11,
//     Version.create(4, 0x10100000, 3),
//   ));
//
//   t.equal(msg.command, 1, 'Handshake sends verack after receiving version');
//   t.equal(v, undefined, 'Handshake does not return version before verack');
//   c.incoming.next(Message.create(
//     0x13371337,
//     Verack.COMMAND(),
//     13,
//   ));
//
//   t.equal(v, 1, 'Handshake sets version to minimum of both clients');
//   t.strictSame(s.mask, 0x10100000, 'Handshake sets services to remote services');
//   t.equal(conn, c, 'Handshake returns connection');
//   t.end();
// });
