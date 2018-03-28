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

const Stream = require('@protochan/stream');
const SocketConnection = require('../../../connection/socketConnection.js');

module.exports = class Incoming {
  static id() { return 'INCOMING'; }
  static inputs() { return []; }

  static attach(
    { TRACKER },
    { SOCKET_HOST },
    { MAGIC, MAX_INCOMING_CONNECTIONS },
    log,
  ) {
    const connectionStream = new Stream();

    if (SOCKET_HOST) {
      SOCKET_HOST
        .map(socket => SocketConnection.createIncoming(socket, MAGIC))
        .pipe(connectionStream);
    }

    // terminate illegal connections
    connectionStream
    // XXX: broken
      .filter(connection =>
        // if we're already connected
        TRACKER.connectedToString(connection.address) ||
        // or if reached incoming connection limit
        TRACKER.connections.size() >= MAX_INCOMING_CONNECTIONS)
      .on(connection => connection.close());

    return connectionStream
    // XXX: broken
      .filter(c =>
        !TRACKER.connectedToString(c.address) &&
        TRACKER.connections.size() < MAX_INCOMING_CONNECTIONS)
      .on(c => log.verbose(`@${c.address}: Accepted connection.`));
  }
};
