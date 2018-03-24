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
  constructor(socket, magic) {
    /* eslint-disable no-underscore-dangle */
    super(
      SocketConnection.extractIP(socket),
      SocketConnection.extractPort(socket),
      magic,
    );

    this.socket = socket;
    // event handling
    this.socket.onmessage = event => this.receive(event.data);
    this.socket.onclose = () => super.close();
    this.socket.onerror = e => Log.error(`SOCKET@${this.address}: ${e.message}`);
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
    const url = `ws://${ipv4.join('.')}:${port}`;
    const socket = new WebSocket(url);
    return new SocketConnection(socket, magic);
  }

  static extractIP(socket) {
    let ipv4;

    if (!socket.url) {
      ipv4 = socket._socket.remoteAddress.slice(7);
    } else {
      ipv4 = socket.url.slice(5).split(':')[0];
    }

    return new Uint8Array(ipv4
      .split('.')
      .map(s => parseInt(s, 10)));
  }

  static extractPort(socket) {
    if (!socket.url) {
      return socket._socket.remotePort;
    }
    return parseInt(socket.url.slice(5).split(':')[1], 10);
  }
};
