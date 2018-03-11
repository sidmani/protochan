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
const Exchange = require('./exchange.js');

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
    this.scan = new Stream();

    this.magic = magic;
    this.version = version;
    this.services = services;

    this.peers = new HashMap(); // IPv6 to Peer
    this.known = new HashMap(); // IPv6 to NetAddr

    KNOWN_NETADDR.forEach((address) => {
      this.known.set(address, address.IPv6());
    });
  }

  attach(component) {
    component(this);
  }

  init() {
    // handle getaddr and addr messages
    this.attach(Exchange);
    this.scan
      // only scan when we we need more peers
      .filter(this.peers.size() < Network.MAX_PEERS())
      // get known peers that are not connected
      .map(() => this.known.difference(this.peers))
      // get n peers from end of available list
      .map(available => available.slice(this.peers.size() - Network.MAX_PEERS()))
      // iterate over array
      .iterate()
      // get netaddr from ipv6 address
      .map(ipv6 => this.known.get(ipv6))
      // try to connect to the peer
      .flatmap(netaddr => this.connect(netaddr))
      // create peer
      .on((connection) => {
        const peer = new Peer(connection, this.magic);
        this.peers.set(peer, connection.address.IPv6());

        peer.init(this.version, this.services).on(() => {
          // pipe data, peer to incoming
          peer.incoming
            .map(data => ({ data, peer }))
            .pipe(this.incoming);
        });

        peer.terminate.on(() => {
          // remove the peer
          this.peers.unset(peer.id());
          // scan for more peers
          this.scan.next();
        });
      });
    //

  }

  connect(netaddr) {
    // first bit of services means that the node is running a websocket server
    if (netaddr.services.socketHost()) {
      // can directly connect to the address
    } else {
      // idk
      throw new Error();
    }
  }
};
