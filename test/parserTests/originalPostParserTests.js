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

const t = require('tap');
const OriginalPostDataParser = require('../../js/parser/originalPostParser.js');

t.test('OriginalPostDataParser constructor', (t) => {
  const data = new Uint8Array(32);
  data[19] = 0x05;
  const parser = new OriginalPostDataParser(data, 19);
  const expectedHash = new Uint8Array([
    224, 33, 30, 58, 246, 52, 222, 251,
    113, 188, 178, 129, 80, 174, 128, 81,
    251, 83, 53, 91, 253, 254, 235, 104,
    47, 76, 197, 16, 246, 141, 123, 40
  ]);

  t.strictSame(parser.hash, expectedHash, 'OriginalPostDataParser hashes data');

  t.end();
});
