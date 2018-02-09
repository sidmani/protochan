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

var t = require('tap');
var Uint256 = require('../../js/util/uint256.js');

t.test('Uint256', function(t) {
  let num = new Uint256(0xfff7aea9);
  let expectedArr = new Uint8Array(32);
  expectedArr[31] = 0xa9;
  expectedArr[30] = 0xae;
  expectedArr[29] = 0xf7;
  expectedArr[28] = 0xff;
  t.strictSame(num.array, expectedArr, 'Uint256 sets initial value');
  num.add(new Uint256(0x57));
  expectedArr[31] = 0x00;
  expectedArr[30] = 0xaf;
  t.strictSame(num.array, expectedArr, 'Uint256 adds other value (8bit)');

  num.add(new Uint256(0xffff));
  expectedArr[31] = 0xff;
  expectedArr[30] = 0xae;
  expectedArr[29] = 0xf8;
  expectedArr[28] = 0xff;
  t.strictSame(num.array, expectedArr, 'Uint256 adds other value (16bit)');

  num.add(new Uint256(0xffe9c7d5));
  expectedArr[31] = 0xd4;
  expectedArr[30] = 0x76;
  expectedArr[29] = 0xe2;
  expectedArr[28] = 0xff;
  expectedArr[27] = 0x01;
  t.strictSame(num.array, expectedArr, 'Uint256 adds other value (32bit)');

  t.strictSame((new Uint256(expectedArr)).array, num.array, 'Uint256 sets input array');

  let copy = num.copy();
  t.notEqual(num.array, copy.array, 'Uint256.copy returns deep copy of array');
  t.strictSame(num.array, copy.array, 'Uint256.copy returns identical duplicate');

  let exp2_77 = Uint256.exp2(77);
  let expected = new Uint8Array(32);
  expected[9] = 0b00100000;
  t.strictSame(exp2_77.array, expected, 'Uint256 correctly exponentiates 2');
  t.end();
});
