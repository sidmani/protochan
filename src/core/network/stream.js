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
  constructor() {
    this.nexts = [];
    this.nextErrors = [];
  }

  next(obj) {
    for (let i = 0; i < this.nexts.length; i += 1) {
      this.nexts[i](obj);
    }
  }

  nextError(error) {
    for (let i = 0; i < this.nextErrors.length; i += 1) {
      this.nextErrors[i](error);
    }
  }

  attach(fn) {
    const child = new Stream();
    this.nexts.push((obj) => {
      try {
        fn(obj, child);
      } catch (error) {
        child.nextError(error);
      }
    });

    this.nextErrors.push((error) => {
      child.nextError(error);
    });
    return child;
  }

  on(next) {
    return this.attach((obj, child) => {
      next(obj);
      child.next(obj);
    });
  }

  filter(next) {
    return this.attach((obj, child) => {
      if (next(obj)) {
        child.next(obj);
      }
    });
  }

  after(...conditionals) {
    const evaluated = [];
    return this.attach((obj, child) => {
      const result = conditionals.reduce((tot, cond, idx) => {
        if (evaluated[idx] || cond(obj)) {
          evaluated[idx] = true;
          return tot;
        }
        return false;
      }, true);

      if (result) {
        child.next(obj);
      }
    });
  }

  discard(n = 1) {
    let idx = 0;
    return this.attach((obj, child) => {
      if (idx >= n) {
        child.next(obj);
      }
      idx += 1;
    });
  }

  map(next) {
    return this.attach((obj, child) => {
      child.next(next(obj));
    });
  }

  first(n = 1) {
    let idx = 0;
    return this.attach((obj, child) => {
      if (idx < n) {
        child.next(obj);
      }
      idx += 1;
    });
  }

  debounce(interval) {
    let last = Date.now();
    return this.attach((obj, child) => {
      const now = Date.now();
      if (now - last >= interval) {
        child.next(obj);
        last = now;
      }
    });
  }

  error(next) {
    this.nextErrors.push(next);
  }

  merge(...streams) {
    for (let i = 0; i < streams.length; i += 1) {
      streams[i].on(obj => this.push(obj));
    }
    return this;
  }

  static merge(...streams) {
    const merged = new Stream();
    for (let i = 0; i < streams.length; i += 1) {
      streams[i].on(obj => merged.push(obj));
    }
    return merged;
  }
}
