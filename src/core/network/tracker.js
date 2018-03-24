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
const Stream = require('./stream.js');
const Log = require('../util/log.js');

module.exports = class Tracker {
  constructor() {
    this.known = new HashMap();
    this.connections = new HashMap();
    this.received = new Stream();
  }

  getAddresses(n = 1) {
    return this.known.enumerate().slice(this.known.size() - n);
  }

  track(netaddr, connection, onTerminate = () => {}) {
    // add to connections
    this.connections.set(connection, netaddr.IPv4());
    // add to known, allowing overwrites
    this.known.set(netaddr, netaddr.IPv4(), true);

    connection.terminate.on(() => {
      this.connections.unset(netaddr.IPv4());
      Log.warning(`TRACKER@${connection.address}: Connection terminated.`);
      onTerminate();
    });
  }

  addKnown(address) {
    this.known.set(address, address.IPv4());
    this.received.next(address);
  }

  connectedTo(netaddr) {
    return this.connections.contains(netaddr.IPv4());
  }
};
