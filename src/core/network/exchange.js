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

const Getaddr = require('./message/types/getaddr.js');
const Addr = require('./message/types/addr.js');
const Stream = require('./stream.js');

const BROADCAST_COUNT = 256;

module.exports = function ({ incoming, outgoing, known }) {
  incoming
    // respond to getaddr messages
    .filter(({ data }) => Getaddr.match(data))
    // create the message
    .map(({ data, peer }) => ({ msg: new Getaddr(data), peer }))
    .on(({ msg, peer }) => {
      // get most recently updated addresses
      const addresses = known.enumerate().slice(this.size() - msg.maxAddr());
      // respond with the addresses
      peer.outgoing.next({
        command: Addr.COMMAND(),
        payload: Addr.create(addresses),
      });
    });

  incoming
    // handle addr messages
    .filter(({ data }) => Addr.match(data))
    // create the message
    .map(({ data }) => new Addr(data))
    // iterate over netaddr in addr
    .iterate()
    // add the address to known addresses
    .on(address => known.set(address, address.IPv6(), true));

  // broadcast latest addresses every 30 seconds
  Stream
    .every(30000)
    .map(() => known.enumerate().slice(-BROADCAST_COUNT))
    .on(addresses => outgoing.next({
      command: Addr.COMMAND(),
      payload: Addr.create(addresses),
    }));
};
