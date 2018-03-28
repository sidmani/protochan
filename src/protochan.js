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

const Network = require('./core/network/network.js');
const Netaddr = require('./core/network/message/data/netaddr.js');
const Config = require('./core/config.js');
const Chain = require('./core/chain/chain.js');
const Header = require('./core/chain/header/header.js');

const genesis_header = new Header(new Uint8Array([
  0x00, 0x00,
  0x00,
  0x5A, 0xB8, 0x6F, 0x2B,
  0x00, 0x00, 0x00, 0x00,
  // prev hash
  0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00,
  // data hash
  163,
  5,
  94,
  148,
  159,
  80,
  170,
  146,
  123,
  159,
  150,
  83,
  31,
  241,
  153,
  0,
  158,
  84,
  51,
  202,
  195,
  49,
  220,
  187,
  233,
  106,
  157,
  166,
  161,
  212,
  34,
  57,
  // board
  0x13, 0x37, 0x13, 0x37,
  0x00,
]));

const genesis_data = new Uint8Array([
  0x06,
  0xA0,
  0xA3,
  0xA4,
  0xA8,
  0xC0,
]);

class Protochan {
  constructor() {
    this.network = new Network(Config, new Chain(genesis_header, genesis_data));
  }
}

const KNOWN_NETADDR2 = [
  [
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x0A, 0x00, 0x01, 0x40, 0x20, 0x91,
  ],
].map(arr => new Netaddr(new Uint8Array(arr)));

const p1 = new Protochan();

setTimeout(() => {
  p1.network.seed(KNOWN_NETADDR2);
}, 5000);
