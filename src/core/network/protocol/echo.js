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

const Ping = require('../message/types/ping.js');
const Pong = require('../message/types/pong.js');

module.exports = function (stream, network, outgoing) {
  // send a ping every 3 seconds if nothing sent or received
  stream.merge(outgoing)
    .invert(3000, Date.now)
    .on(() => {
      outgoing.next(Ping.generic(
        network.magic,
        Ping.COMMAND(),
        Date.now(),
      ));
    });

  stream.filter(data => Ping.match(data))
    // ignore pings more often than every 2.5s
    .debounce(2500, Date.now)
    // create the message
    .map(data => new Ping(data))
    // pong it
    .on(() => {
      outgoing.next(Pong.generic(
        network.magic,
        Pong.COMMAND(),
        Date.now() / 1000,
      ));
    });
};
