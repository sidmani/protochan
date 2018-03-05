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

const Message = require('./message.js');
const ErrorType = require('../../error.js');

const Verack = require('./verack.js');
const Version = require('./version.js');
const Ping = require('./ping.js');
const Pong = require('./pong.js');

module.exports = class MessageFactory {
  // convenience
  static magic(data) {
    return Message.getUint32(data, 0);
  }
  // parameters -> message object
  static version(magic, version, services, timestamp) {
    return Version.create(magic, version, services, timestamp);
  }

  static verack(magic, timestamp) {
    return Verack.create(magic, timestamp);
  }

  static ping(magic, timestamp) {
    return Ping.create(magic, timestamp);
  }

  static pong(magic, timestamp) {
    return Pong.create(magic, timestamp);
  }

  static messageType(data) {
    return Message.getUint32(data, 4);
  }

  // message type getters
  static versionCommand() {
    return Version.COMMAND();
  }

  static verackCommand() {
    return Verack.COMMAND();
  }

  static pingCommand() {
    return Ping.COMMAND();
  }

  static pongCommand() {
    return Pong.COMMAND();
  }

  // data -> message object
  static create(data) {
    const command = Message.getUint32(data, 4);
    switch (command) {
      case Version.COMMAND(): return new Version(data);
      case Verack.COMMAND(): return new Verack(data);
      default: throw ErrorType.messageType();
    }
  }
};
