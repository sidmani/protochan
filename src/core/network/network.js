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

const Getaddr = require('./message/types/getaddr.js');

const KNOWN_NODES = [
  new Uint8Array([107, 170, 194, 14]), // node.protochan.com
];

module.exports = class Network {
  static MAX_PEERS() { return 10; }

  constructor(magic, version, services) {
    this.incoming = new Stream();
    this.outgoing = new Stream();

    this.magic = magic;
    this.version = version;
    this.services = services;

    this.peers = new HashMap();
    this.known = new HashMap();
  }

  addPeer(connection) {
    const peer = new Peer(connection, this.magic);
    this.peers.set(peer, connection.id);


    peer.init(this.version, this.services).on(() => {
      // pipe data, peer to incoming
      peer.incoming
        .map(data => ({ data, peer }))
        .pipe(this.incoming);
    });

    peer.terminate.on(() => {
      this.peers.unsetRaw(peer.id());
    });
  }

  peerExchange({ incoming, outgoing }) {
    incoming
      .filter(data => Getaddr.match(data))
      .map(data => new Getaddr(data).maxAddr())
      .map(maxAddr => this.known.enumerate().slice(this.known.count() - maxAddr))
      .map((addresses) => {
        outgoing.next({
          command: 0,
          payload: 0,
        });
      });
  }
};
