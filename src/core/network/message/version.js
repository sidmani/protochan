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

module.exports = class Version extends Message {
  static PAYLOAD_LENGTH() { return 12; }
  static COMMAND() { return 0x00000000; }

  constructor(data) {
    // 4b version
    // 4b services
    // 4b timestamp
    super(data, Version.PAYLOAD_LENGTH());
  }

  static create(
    magic,
    version,
    services,
    timestamp,
  ) {
    const payload = new Uint8Array(Version.PAYLOAD_LENGTH());
    Message.setUint32(payload, version, 0);
    Message.setUint32(payload, services, 4);
    Message.setUint32(payload, timestamp, 8);

    const data = Message.createData(
      magic,
      Version.COMMAND(),
      payload,
    );
    return new Version(data);
  }

  version() {
    return Message.getUint32(this.data, Message.HEADER_LENGTH());
  }

  services() {
    return Message.getUint32(this.data, Message.HEADER_LENGTH() + 4);
  }

  timestamp() {
    return Message.getUint32(this.data, Message.HEADER_LENGTH() + 8);
  }
};
