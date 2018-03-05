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
const Stream = require('../../src/core/network/stream.js');

tap.test('Stream.on', (t) => {
  const str = new Stream();

  const result = [];
  str.on((obj) => { result.push(obj); });

  str.next('foo');
  str.next('bar');
  str.next('baz');

  t.strictSame(result, ['foo', 'bar', 'baz'], 'Stream.on handles next object');
  t.end();
});

tap.test('Stream.filter', (t) => {
  const str = new Stream();

  const result = [];
  str.filter(obj => obj % 2 === 1)
    .on((obj) => { result.push(obj); });

  str.next(0);
  str.next(3);
  str.next(557);
  str.next(10);

  t.strictSame(result, [3, 557], 'Stream.filter excludes objects based on condition');
  t.end();
});

tap.test('Stream.after', (t) => {
  const str = new Stream();

  const result = [];
  // ignore all until both even and odd have been received
  str.after(obj => obj % 2 === 1, obj => obj % 2 === 0)
    .on((obj) => { result.push(obj); });

  str.next(2);
  str.next(4);
  str.next(5);
  str.next(4);
  str.next(7);

  t.strictSame(result, [5, 4, 7], 'Stream.after ignores objects until conditionals are met');
  t.end();
});

tap.test('Stream.discard', (t) => {
  const str = new Stream();

  const result = [];

  str.discard(3)
    .discard()
    .on((obj) => { result.push(obj); });

  str.next(2);
  str.next(4);
  str.next(5);
  str.next(4);
  str.next(7);
  str.next(1);

  t.strictSame(result, [7, 1], 'Stream.discard ignores first n objects');
  t.end();
});

tap.test('Stream.first', (t) => {
  const str = new Stream();

  const result = [];

  str.first(4)
    .on((obj) => { result.push(obj); });

  str.next(2);
  str.next(4);
  str.next(5);
  str.next(4);
  str.next(7);
  str.next(1);

  t.strictSame(result, [2, 4, 5, 4], 'Stream.first passes first n objects');
  t.end();
});

tap.test('Stream.map', (t) => {
  const str = new Stream();

  const result = [];

  str.map(obj => `${obj}`)
    .on((obj) => { result.push(obj); });

  str.next(2);
  str.next(4);
  str.next(5);
  str.next(4);

  t.strictSame(result, ['2', '4', '5', '4'], 'Stream.map works');
  t.end();
});
