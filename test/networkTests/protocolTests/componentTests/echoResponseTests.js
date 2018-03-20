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

const tap = require('tap');
const EchoResponse = require('../../../../src/core/network/protocol/component/echo/echoResponse.js');
const Stream = require('../../../../src/core/network/stream.js');

tap.test('Echo response', (t) => {
  t.equal(EchoResponse.id(), 'ECHO_RESPONSE', 'id');
  t.strictSame(EchoResponse.inputs(), ['RECEIVER'], 'inputs');

  const receiver = new Stream();
  const result = [];

  EchoResponse.attach({ RECEIVER: receiver });
  const connection = {
    outgoing: new Stream(),
    address: () => '111.222.333.444:5555',
  };

  connection.outgoing.on(obj => result.push(obj));

  receiver.next({
    data: new Uint8Array([
      0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x02,
      0x00, 0x00, 0x00, 0x00,
      0x69, 0x21, 0x7A, 0x30,
    ]),
    connection,
  });

  t.strictSame(
    result,
    [{ command: 0x00000003 }],
    'EchoResponse returns pong on receiving ping',
  );

  t.end();
});
