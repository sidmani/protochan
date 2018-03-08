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

const Version = require('../message/types/version.js');
const Verack = require('../message/types/verack.js');

module.exports = function (stream, outgoing, localVersion, localServices) {
  const handshake = stream
    // get only version messages
    .filter(data => Version.match(data))
    // process the first message only
    .first()
    // try constructing a version msg from data
    .map(data => new Version(data))

    // send the verack message
    .on(() => {
      outgoing.next({
        command: Verack.COMMAND(),
        payload: Verack.create(),
      });
    })
    // resolve the available version and services
    .map((msg) => {
      const version = Math.min(
        localVersion,
        msg.version(),
      );

      const services = localServices & msg.services();
      return { version, services };
    })
    // must wait for verack before handshake is complete
    .wait(stream
      .filter(data => Verack.match(data))
      .map(data => new Verack(data)));

  // send version
  outgoing.next({
    command: Version.COMMAND(),
    payload: Version.create(localVersion, localServices),
  });

  return handshake;
};
