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
const Queue = require('../../src/core/util/queue.js');

tap.test('Queue', (t) => {
  const q = new Queue();

  t.equal(q.dequeue(), undefined, 'Queue.dequeue returns undefined when empty');

  q.enqueue(5);
  q.enqueue(8);

  t.equal(q.length(), 2, 'Queue.length works');
  t.equal(q.dequeue(), 5, 'Dequeue returns expected value');
  t.equal(q.length(), 1, 'Queue.length works');
  t.equal(q.peek(), 8, 'Queue.peek gets next without modifying queue');
  t.equal(q.dequeue(), 8, 'Dequeue returns expected value');
  t.equal(q.length(), 0, 'Queue.length works');
  t.equal(q.dequeue(), undefined, 'Dequeue returns undefined after empty');
  t.equal(q.length(), 0, 'Queue.length does not decrease below 0');


  t.end();
});
