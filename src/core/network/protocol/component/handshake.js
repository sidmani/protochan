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

const Version = require('../../message/types/version.js');
const Verack = require('../../message/types/verack.js');

module.exports = class Handshake {
  static id() { return 'HANDSHAKE'; }
  static inputs() { return ['TRANSLATOR']; }

  static attach({ TRANSLATOR: translator }, _, { version, services }) {
    return translator
      // send version command
      .on(({ outgoing }) => outgoing.next({
        command: Version.COMMAND(),
        payload: Version.create(version, services.mask),
      }))
      // handle version command
      .flatmap(connection => connection.incoming
        .filter(data => Version.getCommand(data) === Version.COMMAND())
        // try constructing a version msg from data
        .map(data => new Version(data))
        // process the first version message only
        .first()
        // send the verack message
        .on(() => connection.outgoing.next({
          command: Verack.COMMAND(),
        }))
        .map(msg => ({ connection, msg })))
      // handle verack
      .flatmap(({ connection, msg }) => connection.incoming
        .filter(data => Verack.getCommand(data) === Verack.COMMAND())
        .map(data => new Verack(data))
        .first()
        .map(() => ({
          connection,
          // set version to minimum of both peers
          version: Math.min(msg.version(), version),
          services: msg.services(),
        })));
  }
};
