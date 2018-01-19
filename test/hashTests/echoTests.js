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

var echo = require('../../js/hash/lib/echo.js');
var helper = require('../../js/hash/lib/helper.js');

var inputString = 'The great experiment continues.';
var outputString = 'b1db282b1672f3423c1e1bdf4496a8ddda0b6f483e92e9a8be2efbaab0ea230814f1f1485d919285deac13794dc215000eb39a47ac32bfc07299a0475049be2e';
module.exports = [
  { description: 'Echo hash function string -> string',
    fn: function() { return echo(inputString, 0, 0) === outputString; }
  },
  { description: 'Echo hash function uint8[] -> uint8[]',
    fn: function() { return helper.int8ArrayToHexString(echo(inputString, 0, 1)) === outputString; }
  },
  { description: 'Echo hash function uint32 -> uint32[]',
    fn: function() { return helper.int32ArrayToHexString(echo(inputString, 0, 2)) === outputString; }
  }
];
