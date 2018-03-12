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

const HashMap = require('../hash/hashMap.js');
const Peer = require('./peer.js');
const Stream = require('./stream.js');

const Netaddr = require('./message/dataTypes/netaddr.js');
const Exchange = require('./protocol/exchange.js');
const Addr = require('./message/types/addr.js');

const KNOWN_NETADDR = [
  new Netaddr([
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x6B, 0xAA, 0xC2, 0x0E, 0x00, 0x00]),
];

module.exports = class Network {
  static MAX_PEERS() { return 32; }

  constructor(magic, version, services) {
    this.incoming = new Stream();
    this.outgoing = new Stream();

    this.magic = magic;
    this.version = version;
    this.services = services;

    // KNOWN_NETADDR.forEach((address) => {
    //   this.known.set(address, address.IPv6());
    // });
  }

  attach(component) {
    component(this);
  }

  init() {
    const address = this.incoming
      // handle addr messages
      .filter(({ data }) => Addr.match(data))
      // create the message
      .map(({ data }) => new Addr(data))
      // iterate over netaddr in addr
      .iterate()
      // create an accumulator for known addresses
      .accumulate(new HashMap())
      // set known addresses ignoring duplicates
      .on(({ obj, acc }) => acc.set(obj, obj.IPv6()));

    address
      // create accumulator for target addresses
      .accumulate(new HashMap())
      // don't add to targets unless we're lacking peers
      .filter(({ acc }) => acc.size() < Network.MAX_PEERS())
      // set the latest address in the target hashmap
      .map(({ acc: targets, obj: { obj: addr, acc: known } }) => {
        targets.set(addr, addr.IPv6());
        return { addr, targets, known };
      })
      // attempt to connect to the latest peer
      .flatmap(({ addr, targets, known }) => this.connect(addr)
        .map(conn => ({ conn, targets }))
        .error(() => {
          targets.unset(addr.IPv6());
          known.unset(addr.IPv6());
        }))
      .on(({ conn, targets }) => {
        const peer = new Peer(conn, this.magic);

        peer.terminate.on(() => {
          targets.unset(conn.address.IPv6());
        });

        peer.init(this.version, this.services).on(() => {
          // pipe data, peer to incoming
          peer.incoming
            .map(data => ({ data, peer }))
            .pipe(this.incoming);
        });
      });
  }

  // connect(netaddr) {
  //   // first bit of services means that the node is running a websocket server
  //   if (netaddr.services.socketHost()) {
  //     // can directly connect to the address
  //   } else {
  //     // idk
  //     throw new Error();
  //   }
  // }
};
