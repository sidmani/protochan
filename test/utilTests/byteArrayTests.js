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
/* eslint-disable no-unused-vars */
const ByteArray = require('../../src/core/util/byteArray.js');
/* eslint-enable no-unused-vars */

tap.test('Uint8Array get/set longer integers', (t) => {
  const array = new Uint8Array([0xFF, 0xAB, 0xCD, 0xEF, 0x10]);
  t.equal(array.getUint32(1), 0xABCDEF10, 'getUint32');
  t.equal(array.getUint16(3), 0xEF10, 'getUint16');
  array.setUint32(0, 0x14151618);
  t.equal(array.getUint32(0), 0x14151618, 'setUint32');
  array.setUint16(3, 0x7173);
  t.equal(array.getUint16(3), 0x7173, 'setUint16');
  t.end();
});
