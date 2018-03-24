// This file is a part of the protochan project.
// https://github.com/sidmani/protochan
// https://www.sidmani.com/?postid=3

// Copyright (c) 2018 Sid Mani
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software dwithout restriction, including without limitation the rights
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

const Connection = require('./connection.js');
const Log = require('../../util/log.js');
const WebSocket = require('isomorphic-ws');

module.exports = class SocketConnection extends Connection {
  constructor(socket, magic, address, port) {
    /* eslint-disable no-underscore-dangle */
    super(
      address || socket._socket.remoteAddress.slice(7),
      port || socket._socket.remotePort,
      magic,
    );

    this.socket = socket;
    // event handling
    this.socket.onmessage = event => this.receive(event.data);
    this.socket.onclose = () => super.close();
    this.socket.onerror = e => Log.error(`SOCKET@${address}: ${e.message}`);
  }

  send(data) {
    this.socket.send(data);
  }

  close() {
    this.socket.close();
    super.close();
  }

  static create(ipv4, port, magic) {
    // create socket (for outgoing)
    const joined = ipv4.join('.');
    const url = `ws://${joined}:${port}`;
    const socket = new WebSocket(url);
    return new SocketConnection(socket, magic, joined, port);
  }
};
