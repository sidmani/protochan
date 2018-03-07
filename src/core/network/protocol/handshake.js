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

module.exports = function (stream, host, outgoing, init) {
  init.on(() => {
    const versionMessage = Version.create(
      host.magic,
      host.version,
      host.services,
      Date.now() / 1000,
    );

    outgoing.next(versionMessage);
  });

  return stream
    // get only version messages
    .filter(data => Version.match(data))
    .map(data => new Version(data))
    // process the first message only
    .first()
    .map((msg) => {
      // set version to minimum of two versions
      const version = Math.min(
        host.version,
        msg.version(),
      );

      // set available services to bitmask of both
      const services = host.services & msg.services();

      outgoing.next(Verack.generic(
        host.magic,
        Verack.COMMAND(),
        host.timestamp,
      ));
      return { version, services };
    });
};
