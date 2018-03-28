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
const ExResp = require('../../../../src/core/network/protocol/component/exchange/exchangeResponse.js');
const Stream = require('@protochan/stream');

tap.test('ExchangeResponse', (t) => {
  t.equal(ExResp.id(), 'EXCHANGE_RESPONSE', 'id');
  t.strictSame(ExResp.inputs(), ['RECEIVER'], 'inputs');

  const result = [];
  let requestedCount;

  const tracker = {
    getAddresses(c) {
      requestedCount = c;
      const data1 = new Uint8Array(26);
      const data2 = new Uint8Array(27);
      data1.fill(5);
      data2.fill(3);
      return [{ data: data1, offset: 0 }, { data: data2, offset: 1 }];
    },
  };

  const connection = {
    outgoing: new Stream(),
    address: '000.111.222.333:4444',
  };

  connection.outgoing.on(a => result.push(a));

  const receiver = new Stream();

  ExResp.attach({ RECEIVER: receiver }, undefined, { tracker });

  receiver.next({
    data: new Uint8Array([
      // header
      0x13, 0x37, 0x13, 0x37,
      0x00, 0x00, 0x00, 0x05,
      0xAF, 0x49, 0xC8, 0x9E,
      44, 164, 178, 245,
      // payload
      0x02, // max address count
    ]),
    connection,
  });

  t.equal(requestedCount, 2, 'Address count requested from tracker is correct');

  const expectedPayload = new Uint8Array(54);
  expectedPayload[1] = 2;
  expectedPayload.fill(5, 2, 28);
  expectedPayload.fill(3, 28, 54);
  t.strictSame(result, [{
    command: 0x00000006,
    payload: expectedPayload,
  }]);
  t.end();
});
