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

module.exports = class SocketConnection extends Connection {
  constructor(socket, address) {
    /* eslint-disable no-underscore-dangle */
    if (address) {
      super(address.IPv4(), address.port(), true);
    } else {
      const a = socket._socket.remoteAddress;
      const port = socket._socket.remotePort;
      const ipv4 = new Uint8Array(a.slice(7)
        .split('.')
        .map(s => parseInt(s, 10)));
      super(ipv4, port, false);
    }

    this.socket = socket;
    // data transfer
    this.socket.onmessage = event => this.incoming.next(event.data);
    this.socket.onclose = super.close;
    this.outgoing.on(data => socket.send(data));
  }

  close() {
    this.socket.close();
    super.close();
  }
};
