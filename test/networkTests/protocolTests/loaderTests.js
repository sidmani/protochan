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
const Loader = require('../../../src/core/network/protocol/loader.js');

tap.test('Loader.enableServices', (t) => {
  const loader = new Loader();

  let attachParams;
  const testService0 = {};

  const testService3 = {
    id() { return 'SERVICE_3'; },
    attach(param) {
      attachParams = param;
      return 5;
    },
  };

  const library = {
    0: testService0,
    3: testService3,
  };

  const services = {
    mask: 0b00001000,
    index(i) {
      return ((this.mask >> i) & 1) === 1;
    },
  };

  loader.enableServices(services, library);

  t.equal(loader.services.SERVICE_3, 5, 'Loader loads enabled service');
  t.equal(loader.services.SERVICE_0, undefined, 'Loader does not load disabled service');

  t.equal(attachParams, undefined, 'Loader does not pass any parameters to service.attach');
  t.end();
});

tap.test('Loader.resolve', (t) => {
  const library = {
    C: { inputs() { return ['B', 'D']; } },
    D: { inputs() { return ['B', 'A', 'E']; } },
    E: { inputs() { return []; } },
    A: { inputs() { return []; } },
    B: { inputs() { return ['A']; } },
  };
  const set = new Set();
  Loader.resolve('C', library, set);
  t.strictSame(Array.from(set.keys()), ['A', 'B', 'E', 'D', 'C'], 'resolve creates topological sort of dependency graph');
  t.throws(() => Loader.resolve('F', library, set), 'Loader throws error on unknown component id');
  const arr = Loader.resolveDependencies('C', library);
  t.strictSame(arr, ['A', 'B', 'E', 'D', 'C'], 'resolveDependencies returns array from resolved set');
  t.end();
});
