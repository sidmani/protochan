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
    this.children.forEach((child) => {
      if (child) child.nextError(error);
    });
  }

  next(obj) {
    try {
      // execute fn on obj, and leave further calls up to fn
      this.fn(obj, o => this.propagate(o));
    } catch (error) {
      this.children.forEach(child => child.nextError(error));
    }
  }

  // propagate the object without running any auxiliary functions
  propagate(obj) {
    this.children.forEach(child => child.next(obj));
  }

  destroy() {
    this.children.forEach((child) => {
      child.destroy();
    });
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

  after(...conditionals) {
    const evaluated = [];
    return this.attach((obj, next) => {
      const result = conditionals.reduce((tot, cond, idx) => {
        if (evaluated[idx] || cond(obj)) {
          evaluated[idx] = true;
          return tot;
        }
        return false;
      }, true);

      if (result) {
        next(obj);
      }
    });
  }

  // discard until stream emits
  suppress(stream) {
    let ready = false;
    stream.on(() => { ready = true; });

    return this.attach((obj, next) => {
      if (ready) {
        next(obj);
      }
    });
  }

  // like suppress, except propagates the latest object
  wait(stream) {
    let ready = false;
    let latest;
    const child = this.attach((obj, next) => {
      if (ready) {
        next(obj);
      } else {
        latest = obj;
      }
    });
    stream.on(() => {
      if (!ready) {
        ready = true;
        child.next(latest);
      }
    });
    return child;
  }

  discard(n = 1) {
    let idx = 0;
    return this.attach((obj, next) => {
      if (idx >= n) {
        next(obj);
      }
      idx += 1;
    });
  }

  map(fn) {
    return this.attach((obj, next) => next(fn(obj)));
  }

  flatmap(fn) {
    return this.attach((obj, next) => {
      // fn returns a stream
      fn(obj).on(o2 => next(o2));
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

  error(fn) {
    const child = this.attach(() => {});
    child.nextError = fn;
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
    this.children.push(stream);
  }

  // propagate to a random child
  // random(count) {
  //   return this.attach((obj) => {
  //     for (let i = 0; i < Math.min(this.children.length, count);)
  //     const idx = Stream.randInt(0, this.children.length);
  //     if (this.children[idx]) {
  //       this.children[idx].next(obj);
  //     }
  //   });
  // }

  static randInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  // static every(interval, obj) {
  //   const str = new Stream();
  //   setInterval(() => {
  //     str.propagate(obj);
  //   }, interval);
  //   return str;
  // }
};
