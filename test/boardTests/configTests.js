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

const Configuration = require('../../src/core/chain/config.js');
const tap = require('tap');

tap.test('Configuration constructor', (t) => {
  const data = {
    minPostDifficulty: 0xf5,
    maxPostDifficulty: 0xf6,
    minThreadDifficulty: 0xf7,
    maxThreadDifficulty: 0xf8,
    maxThreads: 0xf9,
  };

  const config = new Configuration(data);
  t.equal(config.MIN_POST_DIFFICULTY, 0xf5, 'Configuration sets minimum post difficulty');
  t.equal(config.MAX_POST_DIFFICULTY, 0xf6, 'Configuration sets maximum post difficulty');
  t.equal(config.MIN_THREAD_DIFFICULTY, 0xf7, 'Configuration sets min thread difficulty');
  t.equal(config.MAX_THREAD_DIFFICULTY, 0xf8, 'Configuration sets max thread difficulty');
  t.equal(config.MAX_THREAD_COUNT, 0xf9, 'Configuration sets max thread count');
  t.end();
});
