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

module.exports = class Peer {
  constructor(connection, network) {
    this.connection = connection;
    this.network = network;

    this.stream = this.connection.stream
      .filter(data => Factory.magic(data) === this.network.magic)
      .map(data => Factory.create(data));

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
        console.log(`${connection.id}: Received version message, setting version to ${this.version}`);
        this.send(Factory.verack(
          this.network.magic,
          Date.now() / 1000,
        ));
      });

    this.stream
      // accept nothing until we receive version and verack
      .after(
        msg => msg.command() === Factory.versionCommand(),
        msg => msg.command() === Factory.verackCommand(),
      )
      .on(() => console.log(`${connection.id}: Ready to transmit.`))
      // respond to ping commands
      .filter(msg => msg.command() === Factory.pingCommand())
      // ignore pings more often than every 3s
      .debounce(3000)
      // pong it
      .on((msg) => {
        console.log(`${connection.id}: Received ping @ ${msg.timestamp()}`);
        this.send(Factory.pong(
          this.network.magic,
          Date.now() / 1000,
        ));
      });
  }

  init() {
    const versionMessage = Factory.version(
      this.network.magic,
      this.network.version,
      0x00000000,
      Date.now() / 1000,
    );

    this.send(versionMessage);
  }

  id() {
    return this.connection.id;
  }

  send(message) {
    this.connection.send(message.data);
  }
};

// const streamA = new Stream();
// const streamB = new Stream();
//
// const connectionB = {
//   stream: streamB,
//   send(obj) { streamA.next(obj); },
//   id: 'B',
// };
// const connectionA = {
//   stream: streamA,
//   send(obj) { streamB.next(obj); },
//   id: 'A',
// };
//
// const networkA = {
//   magic: 0x13371337,
//   services: 0x10000000,
//   version: 2,
// };
//
// const networkB = {
//   magic: 0x13371337,
//   services: 0x00001000,
//   version: 1,
// };
//
// const p1 = new module.exports(connectionA, networkA);
// const p2 = new module.exports(connectionB, networkB);
// p1.init();
// p2.init();
//
// p2.send(Factory.ping(0x13371337, Date.now() / 1000));
