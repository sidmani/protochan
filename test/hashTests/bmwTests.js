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

var bmw = require('../../js/hash/lib/bmw.js');
var helper = require('../../js/hash/lib/helper.js');

var inputString = 'The great experiment continues.';
var outputString = '7b30b4f1ccd83692bc6a01b1f7e374b59b81da6b21421679ae59d84c4f73afec5a0857565b6ebc1b9ddf9da5e75bf1ecd0ba6f5a75b7926ba9278385fb83533c';
module.exports = [
  { description: 'BMW hash function uint8[] -> uint8[]',
    fn: function() { return helper.int8ArrayToHexString(bmw(helper.string2bytes(inputString), 0, 1)) === outputString; }
  }
];
