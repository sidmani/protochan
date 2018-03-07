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

const Stream = require('./stream.js');

// protocol components
const Handshake = require('./protocol/handshake.js');
const Terminate = require('./protocol/terminate.js');
const Echo = require('./protocol/echo.js');
const Message = require('./message/message.js');
const Version = require('./message/types/version.js');

module.exports = class Peer {
  constructor(connection, network) {
    this.connection = connection;
    this.network = network;
    this.outgoing = new Stream();

    // convert data to messages
    this.stream = this.connection.stream
      .filter(data => Message.getMagic(data) === this.network.magic);

    // send data of messages pushed to outgoing
    this.outgoing.on(msg => this.connection.send(msg.data));

    // attach protocol components
    const handshake = this.import(Handshake);

    // update version and services on receipt
    handshake.on(({ version, services }) => {
      this.version = version;
      this.services = services;
    });

    // terminate connection if nothing received for 10s
    this.import(Terminate);

    // send and respond to pings
    this.import(Echo, this.stream.wait(handshake));
  }

  import(component, stream = this.stream) {
    return component(
      stream,
      this.network,
      this.outgoing,
      this.terminate,
    );
  }

  init() {
    const versionMessage = Version.create(
      this.network.magic,
      this.network.version,
      this.network.services,
      Date.now() / 1000,
    );

    this.outgoing.next(versionMessage);
  }

  terminate() {
    this.outgoing.destroy();
    this.stream.destroy();
    this.connection.terminate();
  }

  id() {
    return this.connection.id;
  }
};
