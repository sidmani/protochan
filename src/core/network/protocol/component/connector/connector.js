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

const HashMap = require('../../../../hash/hashMap.js');

const MAX_INCOMING_CONNECTIONS = 100;

module.exports = class Connector {
  static id() { return 'CONNECTOR'; }
  static inputs() { return ['RECEIVER']; }

  static attach({
    RECEIVER: receiver,
  }) {
    // receive connection
    // if max connections not exceeded, pipe it to output
    return receiver
      // accumulate connections into hashmap
      .accumulate(new HashMap())
      // only add if we haven't hit connection limit
      .filter(({ acc }) => acc.size() < MAX_INCOMING_CONNECTIONS)
      .on(({ obj: connection, acc }) => {
        // checks duplicates
        acc.setStringified(
          connection,
          connection.address(),
        );

        connection.terminate.on(() => acc.unsetStringified(connection.address()));
      });

    // every 3 seconds, if max outgoing connections not exceeded
    // connect to a random connection in known
    // const dispense = new Stream();
    // known.queue(dispense).on((addr) => {
    //   const connection = Connector.connect(addr);
    //   numConnections += 1;
    //   connection.terminate.on(() => {
    //     numConnections -= 1;
    //     dispense.next();
    //   });
    //   connectionStream.next(connection);
    // });
    // dispense.next(8);
  }

  // static connect(addr) {
  //   if (addr.services.socketHost()) {
  //     const url = `ws://${addr.IPv4URL()}`;
  //     const socket = new WebSocket(url);
  //     return new SocketConnection(socket);
  //   }
  //   throw Error('Non-socket connections are not yet implemented.');
  //   // cannot initiate socket connection
  //   // case 1: this is socketHost
  //   // begin RTC signaling process?
  //   // case 2: both !socketHost
  //   // begin RTC signaling process
  // }
};
