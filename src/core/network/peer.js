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
const Message = require('./message/message.js');

// protocol components
const Handshake = require('./protocol/handshake.js');
const Echo = require('./protocol/echo.js');


module.exports = class Peer {
  constructor(connection, magic) {
    this.outgoing = new Stream();
    this.incoming = new Stream();

    // filter data by magic value
    connection.incoming
      .filter(data => Message.getMagic(data) === magic)
      .pipe(this.incoming);
    // convert { command, payload } to messages and send them
    this.outgoing
      .map(({ command, payload }) =>
        Message.create(magic, command, Date.now() / 1000, payload))
      .pipe(connection.outgoing);

    this.terminate = connection.terminate;

    // perform cleanup on terminate
    this.terminate.on(() => {
      this.outgoing.destroy();
      this.incoming.destroy();
    });
  }

  attach(component) {
    component(this);
  }

  init(localVersion, localServices) {
    // terminate connection if nothing received for 10s
    this.incoming.invert(10000, Date.now).pipe(this.terminate);

    // perform handshake
    return Handshake(
      this.incoming,
      this.outgoing,
      localVersion,
      localServices,
    ).on(() => {
      this.attach(Echo);
    });
  }
};
