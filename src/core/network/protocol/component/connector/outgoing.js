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

const WebSocket = require('isomorphic-ws');
const Stream = require('../../../stream.js');
const SocketConnection = require('../../../connection/socketConnection.js');

// XXX: global
const MAX_OUTGOING_CONNECTIONS = 5;

module.exports = class Outgoing {
  static id() { return 'OUTGOING'; }
  static inputs() { return []; }

  static attach(_, __, { tracker }) {
    const dispense = new Stream();
    // tracker.received guarantees unique addresses
    const t = tracker.recieved
      .queue(dispense)
      .map((address) => {
        if (address.services.socketHost()) {
          const url = `ws://${address.IPv4URL()}`;
          const socket = new WebSocket(url);
          return new SocketConnection(socket);
        }
        throw Error('Non-socket connections are not yet implemented.');
      });
    dispense.next(MAX_OUTGOING_CONNECTIONS);
    return t;
  }
};
