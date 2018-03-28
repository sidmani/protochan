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

module.exports = class Outgoing {
  static id() { return 'OUTGOING'; }
  static inputs() { return []; }

  static attach(
    { TRACKER },
    s,
    { MAGIC, SOCKET_HOST_PORT, MAX_OUTGOING_CONNECTIONS },
    log,
  ) {
    const dispense = new Stream();
    // tracker.received guarantees unique addresses
    const queue = TRACKER.received
      .queue(dispense);

    const outgoing = queue
      // don't connect to the same address twice
      .filter((a) => {
        if (TRACKER.connectedTo(a)) {
          dispense.next();
          return false;
        }
        return true;
      })
      .map((address) => {
        // if the address points to a socket host
        if (address.services.socketHost()) {
          const connection = SocketConnection.createOutgoing(
            address.IPv4(),
            SOCKET_HOST_PORT,
            MAGIC,
          );
          log.verbose(`@${connection.address}: Attempting connection on port ${SOCKET_HOST_PORT}.`);

          TRACKER.track(address, connection, () => dispense.next());

          return connection;
        }
        throw Error('Non-socket connections are not yet implemented.');
      });

    dispense.next(MAX_OUTGOING_CONNECTIONS);
    return outgoing;
  }
};
