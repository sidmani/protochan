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
  str.on((obj) => { result.push(obj); }).map(() => 'abcd');
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

tap.test('Stream.flatmap', (t) => {
  const str = new Stream();
  const str2 = new Stream();

  const result = [];

  str.flatmap(() => str2).on(obj => result.push(obj));

  str.next();
  str.next();
  str2.next(2);
  str2.next(3);
  str2.next(4);
  str2.next(6);
  str2.next(7);
  str2.next(1);

  t.strictSame(result, [2, 2, 3, 3, 4, 4, 6, 6, 7, 7, 1, 1], 'Stream.flatmap');

  let errored;
  str.flatmap(() => { throw Error(); }).error(() => { errored = true; });
  str.next();
  t.assert(errored, 'Flatmap propagates errors from outer stream');

  let innerErrored;
  str.flatmap(() => str2.map(() => { throw Error(); }))
    .error(() => { innerErrored = true; });
  str.next();
  str2.next();
  t.assert(innerErrored, 'Flatmap propagates errors from inner stream');

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
  str.next(6);
  str.next(7);
  str.next(1);

  t.strictSame(result, [2, 4, 5, 6], 'Stream.first passes first n objects');
  t.end();
});

tap.test('Stream.debounce', (t) => {
  const str = new Stream();

  const result = [];

  let now = 1200;

  str.debounce(1000, () => now)
    .on(obj => result.push(obj));

  str.next(5);
  str.next(6);
  now = 1900;
  str.next(7);
  now = 3000;
  str.next(8);
  str.next(9);
  now = 6000;
  str.next(10);
  t.strictSame(result, [5, 8, 10], 'Stream.first allows only one object per time interval');
  t.end();
});

tap.test('Stream.iterate', (t) => {
  const str = new Stream();
  const result = [];

  str.iterate().on(obj => result.push(obj));
  str.next([8, 7, 42]);

  t.strictSame(result, [8, 7, 42], 'Stream.iterate works');
  t.end();
});

tap.test('Stream.accumulate', (t) => {
  const str = new Stream();

  const result = [];

  str.accumulate(result).on(({ acc, obj }) => acc.push(obj));

  str.next(2);
  str.next(3);
  str.next(4);
  str.next(6);
  str.next(7);
  str.next(1);

  t.strictSame(result, [2, 3, 4, 6, 7, 1], 'Stream.accumulate accumulates objects');
  t.end();
});

tap.test('Stream.queue', (t) => {
  const str = new Stream();
  const result = [];
  const dispense = new Stream();

  str.queue(dispense).on(obj => result.push(obj));

  str.next(5);
  str.next(8);
  str.next(1);

  t.strictSame(result, [], 'Stream.queue doesn\'t propagate without dispense');

  dispense.next(2);
  t.strictSame(result, [5, 8], 'Stream.queue dispenses objects');
  dispense.next(3);
  t.strictSame(result, [5, 8, 1], 'Stream.queue dispenses up to queue size');
  str.next(11);
  str.next(12);
  str.next(14);
  t.strictSame(result, [5, 8, 1, 11, 12], 'Stream.queue clears backlog when possible');
  t.end();
});

// tap.test('Stream.zip', (t) => {
//   const str = new Stream();
//   const str2 = new Stream();
//   const str3 = new Stream();
//
//   const result = [];
//   str.zip(str2, str3)
//     .on(obj => result.push(obj));
//
//   str2.next(5);
//   str2.next(3);
//   str3.next(4);
//   str.next(1);
//   str.next(8);
//   str3.next(11);
//   str.next(2);
//
//   t.strictSame(result, [[1, 3, 4], [8, 3, 4], [2, 3, 11]], 'Stream.zip combines latest into array');
//   t.end();
// });

tap.test('Stream.error', (t) => {
  const str = new Stream();

  let errored;
  str.filter(() => true)
    .on(() => { throw Error(); })
    .map(() => 'foo')
    .filter(() => true)
    .error(() => { errored = true; });

  str.next(5);
  t.assert(errored, 'Stream.error catches error');
  t.end();
});

tap.test('Stream.merge', (t) => {
  const str1 = new Stream();
  const str2 = new Stream();
  const str3 = new Stream();

  const result = [];
  str1.merge(str2, str3)
    .on((obj) => { result.push(obj); });

  str2.next(5);
  str1.next(7);
  str2.next(4);
  str3.next(18);
  str1.next(13);

  t.strictSame(result, [5, 7, 4, 18, 13], 'Stream.merge combines streams');
  t.end();
});

tap.test('Stream.invert', (t) => {
  const str = new Stream();

  let time = 0;
  const result = [];
  let index = 0;
  str.invert(10, () => time)
    .on(() => {
      if (index < 2) {
        result.push(true);
        index += 1;
      }
    });

  str.next(3);
  time = 25;
  const id = setTimeout(() => {
    str.destroy();
    t.strictSame(result, [true, true], 'Stream.invert emits when parent misses interval');
    t.end();
  }, 200);
  clearInterval(id);
});

tap.test('Stream.pipe', (t) => {
  const str = new Stream();
  const str2 = new Stream();

  const result = [];
  str.on(obj => result.push(obj));
  str2.pipe(str);

  str2.next(5);
  str2.next(4);

  t.strictSame(result, [5, 4], 'Stream.pipe propagates objects to destination stream');
  t.end();
});
