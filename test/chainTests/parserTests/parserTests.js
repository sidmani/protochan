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

const tap = require('tap');
const DataParser = require('../../../src/core/chain/parser/parser.js');
const ErrorType = require('../../../src/core/error.js');

tap.test('DataParser', (t) => {
  const data = new Uint8Array(32);
  data[5] = 0x1C;

  tap.throws(() => new DataParser(data, 5), ErrorType.controlLength(), 'Parser throws on control length too long');

  data[5] = 0x1A;

  let parser;
  t.doesNotThrow(() => { parser = new DataParser(data, 5); }, 'Parser accepts valid control length');
  t.equal(parser.controlLength, 0x1A, 'Parser sets correct control length');
  t.equal(parser.contentLength, 0x01, 'Parser sets correct content length');
  t.equal(parser.offset, 0x05, 'Parser sets correct offset');
  t.equal(parser.data, data, 'Parser sets data');
  t.end();
});
