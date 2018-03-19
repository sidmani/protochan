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
const Receiver = require('../../../../src/core/network/protocol/component/receiver.js');
const Stream = require('../../../../src/core/network/stream.js');

tap.test('Receiver', (t) => {
  t.equal(Receiver.id(), 'RECEIVER', 'id');
  t.strictSame(Receiver.inputs(), ['HANDSHAKE'], 'inputs');

  const hs = new Stream();

  const result = [];
  Receiver.attach({ HANDSHAKE: hs }).on(r => result.push(r));

  const connection1 = {
    incoming: new Stream(),
  };

  const connection2 = {
    incoming: new Stream(),
  };

  hs.next({ connection: connection1, services: {}, version: 1 });
  hs.next({ connection: connection2, services: {}, version: 1 });

  connection2.incoming.next('foo');
  connection1.incoming.next('bar');

  t.strictSame(
    result,
    [{ connection: connection2, data: 'foo' }, { connection: connection1, data: 'bar' }],
    'Receiver joins incoming data with source connection',
  );

  t.end();
});
