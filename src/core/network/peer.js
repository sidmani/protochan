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

const Factory = require('./message/factory.js');
const Stream = require('./stream.js');

module.exports = class Peer {
  constructor(connection, network) {
    this.connection = connection;
    this.network = network;
    this.outgoing = new Stream();

    // convert data to messages
    this.stream = this.connection.stream
      .filter(data => Factory.magic(data) === this.network.magic)
      .map(data => Factory.create(data));

    // for handlers that wait for the handshake to complete
    this.afterHandshake = this.stream.after(
      msg => msg.command() === Factory.versionCommand(),
      msg => msg.command() === Factory.verackCommand(),
    );

    // tell connection to send messages pushed to outgoing
    this.connection.attach(this.outgoing);

    this.attachHandshake();
    this.attachPong();
    this.attachPing();
    this.attachTerminator();
  }

  attachHandshake() {
    this.stream
      // get only version messages
      .filter(msg => msg.command() === Factory.versionCommand())
      // process the first message only
      .first()
      .on((msg) => {
        // set version to minimum of two versions
        this.version = Math.min(
          this.network.version,
          msg.version(),
        );

        // set available services to bitmask of both
        this.services = this.network.services & msg.services();
        this.send(Factory.verack(
          this.network.magic,
          Date.now() / 1000,
        ));
      });
  }

  attachPing() {
    // send a ping every 3 seconds if nothing sent or received
    this.afterHandshake
      .merge(this.outgoing)
      .invert(3000, Date.now)
      .on(() => {
        this.send(Factory.ping(
          this.network.magic,
          Date.now(),
        ));
      });
  }

  attachPong() {
    this.afterHandshake
      // respond to ping commands
      .filter(msg => msg.command() === Factory.pingCommand())
      // ignore pings more often than every 2.5s
      .debounce(2500, Date.now)
      // pong it
      .on(() => {
        this.send(Factory.pong(
          this.network.magic,
          Date.now() / 1000,
        ));
      });
  }

  attachTerminator() {
    // terminate the connection if nothing received for 10s
    this.afterHandshake
      .invert(10000, Date.now)
      .on(() => this.terminate());
  }

  terminate() {
    this.connection.terminate();
    this.outgoing.destroy();
  }

  init() {
    const versionMessage = Factory.version(
      this.network.magic,
      this.network.version,
      this.network.services,
      Date.now() / 1000,
    );

    this.send(versionMessage);
  }

  send(message) {
    this.outgoing.next(message.data);
  }

  id() {
    return this.connection.id;
  }
};
