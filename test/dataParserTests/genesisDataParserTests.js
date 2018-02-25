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
const GenesisDataParser = require('../../js/block/dataParser/genesisDataParser.js');
const ErrorType = require('../../js/error.js');

t.test('GenesisDataParser constructor', (t) => {
  t.throws(() => {
    const data = new Uint8Array(34);
    data[0] = 5;
    new GenesisDataParser(data);
  }, ErrorType.Data.controlLength(), 'GenesisDataParser rejects insufficient control length');

  const data = new Uint8Array(32);
  data[14] = 0x06; // ctrl length
  data[15] = 0x19; // min post diff
  data[16] = 0x04; // post diff range
  data[17] = 0xAE; // min thread diff
  data[18] = 0xEB; // post diff range
  data[19] = 0xEE; // max thread count - 1
  const parser = new GenesisDataParser(data, 14);
  const expectedHash = new Uint8Array([
    115, 144, 220, 144, 77, 222, 235, 237,
    89, 182, 93, 229, 132, 182, 241, 186,
    216, 30, 198, 236, 83, 146, 14, 80,
    164, 237, 175, 39, 25, 120, 253, 182
  ]);

  t.strictSame(parser.hash, expectedHash, 'GenesisDataParser hashes data');
  t.equal(parser.minPostDifficulty, 0x19, 'GenesisDataParser sets minimum post difficulty');
  t.equal(parser.maxPostDifficulty, 0x1D, 'GenesisDataParser sets maximum post difficulty from range');
  t.equal(parser.minThreadDifficulty, 0xAE, 'GenesisDataParser sets minimum thread difficulty');
  t.equal(parser.maxThreadDifficulty, 0x199, 'GenesisDataParser sets maximum thread difficulty from range');
  t.equal(parser.maxThreads, 0xEF, 'GenesisDataParser sets maximum thread count to value + 1');

  t.end();
});
