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

const Queue = require('../util/queue.js');

module.exports = class Stream {
  constructor(
    fn = (obj, next) => next(obj),
    destructor = () => {},
  ) {
    this.fn = fn;
    this.destructor = destructor;
    this.children = [];
  }

  nextError(error) {
    this.children.forEach(child => child.nextError(error));
  }

  next(obj) {
    try {
      // execute fn on obj, and leave further calls up to fn
      this.fn(
        obj,
        o => this.propagate(o),
        e => this.nextError(e),
      );
    } catch (error) {
      this.nextError(error);
    }
  }

  // propagate the object without running any auxiliary functions
  propagate(obj) {
    this.children.forEach(child => child.next(obj));
  }

  destroy() {
    this.children.forEach(child => child.destroy());
    this.destructor();
    this.children = [];
  }

  attach(fn, destructor = () => {}) {
    const child = new Stream(fn, destructor);
    this.children.push(child);
    return child;
  }

  // operators
  on(fn) {
    return this.attach((obj, next) => {
      fn(obj);
      next(obj);
    });
  }

  filter(fn) {
    return this.attach((obj, next) => {
      if (fn(obj)) {
        next(obj);
      }
    });
  }

  map(fn) {
    return this.attach((obj, next) => next(fn(obj)));
  }

  flatmap(fn) {
    return this.attach((obj, next, err) => {
      // fn returns a stream
      fn(obj).on(next).error(err);
    });
  }

  first(n = 1) {
    let idx = 0;
    return this.attach((obj, next) => {
      if (idx < n) {
        next(obj);
      }
      idx += 1;
    });
  }

  debounce(interval, time) {
    let last = 0;
    return this.attach((obj, next) => {
      const now = time();
      if (now - last >= interval) {
        next(obj);
        last = now;
      }
    });
  }

  iterate() {
    return this.attach((obj, next) => {
      obj.forEach(next);
    });
  }

  accumulate(acc) {
    return this.attach((obj, next) => {
      next({ obj, acc });
    });
  }

  queue(dispense) {
    const queue = new Queue();
    let backlog = 0;
    const child = this.attach((obj) => {
      queue.enqueue(obj);
      if (backlog > 0) {
        dispense.next();
        backlog -= 1;
      }
    });

    dispense.on((count = 1) => {
      const num = Math.min(count, queue.length());
      backlog += Math.max(0, count - queue.length());
      for (let i = 0; i < num; i += 1) {
        child.propagate(queue.dequeue());
      }
    });

    return child;
  }

  zip(...streams) {
    const latest = [];

    streams.forEach((stream, idx) => {
      stream.on((obj) => { latest[idx] = obj; });
    });

    return this.attach((obj, next) => {
      next([obj, ...latest]);
    });
  }

  error(fn) {
    const child = this.attach((obj, next) => next(obj));
    child.nextError = fn;
    return child;
  }

  merge(...streams) {
    for (let i = 0; i < streams.length; i += 1) {
      streams[i].on(obj => this.next(obj));
    }
    return this;
  }

  // emit if the source does not emit every interval
  invert(interval, time) {
    let last = 0;
    let id;
    const child = this.attach(() => {
      last = time();
    }, () => clearInterval(id));

    id = setInterval(() => {
      if (time() - last > interval) {
        child.propagate();
      }
    }, interval);

    return child;
  }

  pipe(stream) {
    this.attach(obj => stream.next(obj));
    // this.next = obj => this.fn(obj, o => stream.next(o));
  }

  static every(interval, obj) {
    let id;
    const str = new Stream(
      (o, next) => next(o),
      () => clearInterval(id),
    );
    id = setInterval(() => {
      str.next(obj);
    }, interval);
    return str;
  }
};
