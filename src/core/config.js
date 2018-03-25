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

const config = {
  // global constants
  MAGIC: 0x13371337,
  SERVICES: 0x00000001,
  VERSION: 1,
  // connection
  MAX_INCOMING_CONNECTIONS: 100,
  MAX_OUTGOING_CONNECTIONS: 8, // DO NOT CHANGE
  SOCKET_HOST_PORT: 8337,
  // echo
  ECHO_INTERVAL: 30000,
  ECHO_FLUX: 5000, // random change in echo period to avoid syncing
  // exchange
  EXCHANGE_GETADDR_COUNT: 0xFF,
  // terminator
  INACTIVE_TIMEOUT: 120000,
};

module.exports = Object.freeze(config);
