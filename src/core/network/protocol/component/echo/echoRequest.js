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

'use strict';

const Ping = require('../../../message/types/ping.js');
const Log = require('../../../../util/log.js');

module.exports = class EchoRequest {
  static id() { return 'ECHO_REQUEST'; }
  static inputs() { return ['HANDSHAKE']; }

  static attach({ HANDSHAKE: handshake }) {
    // adjust the period randomly to prevent syncing
    const random = Math.floor(Math.random() * 10000) - 5000;

    // send a ping every 20 seconds if nothing sent or received
    handshake.flatmap(({ connection }) =>
      connection.incoming
        .merge(connection.outgoing)
        .invert(20000 + random, Date.now)
        .map(() => connection))
      .on((connection) => {
        Log.verbose(`ECHO@${connection.address()}: =>PING`);
        connection.outgoing.next({
          command: Ping.COMMAND(),
        });
      });
  }
};
