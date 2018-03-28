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

const Stream = require('@protochan/stream');
const Message = require('../message/message.js');
const Netaddr = require('../message/data/netaddr.js');
const Log = require('../../util/log.js').submodule('CONNECTION');

module.exports = class Connection {
  constructor(address, port, magic) {
    this.port = port; // as number (uint16)
    this.address = address; // as string
    this.transform = new Stream();
    this.incoming = this.transform
      // create uint8array from native array
      .map(arr => new Uint8Array(arr))
      // pass only messages with valid magic value
      .filter(data => Message.getMagic(data) === magic);
    this.outgoing = new Stream();
    this.outgoing
      // convert { command, payload } to uint8array
      .map(({ command, payload }) => Message.create(
        magic,
        command,
        Date.now() / 1000,
        payload,
      ))
      // convert uint8arr to native array
      .map(uint8array => Array.from(uint8array))
      // send the data
      .on(data => this.send(data));

    const log = Log.submodule(`@${address}: `);
    this.outgoing.on(data => log.verbose(`SEND ${log.message(data.command)}`));
    this.incoming.on(data => log.verbose(`RCV ${log.message(Message.getCommand(data))}`));

    this.terminate = new Stream();
  }

  close() {
    this.terminate.next();
    this.transform.destroy();
    this.outgoing.destroy();
    this.terminate.destroy();
  }

  receive(data) {
    this.transform.next(data);
  }

  netaddr(rawServices, time) {
    const data = new Uint8Array(Netaddr.BYTE_LENGTH());
    Netaddr.set(data, 0, rawServices, this.addressToArray(), this.port, time);
    return new Netaddr(data);
  }

  addressToArray() {
    return new Uint8Array(this.address
      .split('.')
      .map(s => parseInt(s, 10)));
  }
};
