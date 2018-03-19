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

const Getaddr = require('../../message/types/getaddr.js');
const Addr = require('../../message/types/addr.js');

module.exports = class Exchange {
  static id() { return 'EXCHANGE'; }
  static inputs() {
    return ['RECEIVER'];
  }

  static attach({ RECEIVER: receiver }, _, { tracker }) {
    return receiver
      // handle getaddr messages
      .filter(({ data }) => Getaddr.getCommand(data) === Getaddr.COMMAND())
      // create the message
      .map(({ data, connection }) => ({
        count: new Getaddr(data).maxAddr(),
        connection,
      }))
      .on(({ count, connection }) => {
        // get n addresses
        const addresses = tracker.getAddresses(count);

        connection.outgoing.next({
          command: Addr.COMMAND(),
          payload: Addr.create(addresses),
        });
      });
  }
};
//
// module.exports = function (incoming, maxConnections, connect) {
//   const dispense = new Stream();
//   const connectionStream = incoming
//     // enqueue addresses with dispense trigger
//     .queue(dispense)
//     // attempt to connect to the latest peer
//     .flatmap(({ obj: addr, acc: known }) => connect(addr)
//       .error(() => {
//         // if connection failed, remove peer
//         known.unset(addr.IPv6());
//         // dispense next queued address
//         dispense.next();
//       }))
//     // dispense another address when the connection terminates
//     .on(conn => conn.terminate.pipe(dispense));
//   dispense.next(maxConnections);
//   return connectionStream;
// };
