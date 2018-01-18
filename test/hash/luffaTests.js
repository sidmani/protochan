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

var luffa = require('../../js/hash/lib/luffa.js');
var helper = require('../../js/hash/lib/helper.js');

var inputString = 'The great experiment continues.';
var outputString = 'ea531ce38473fc4bd508c5396194dd6201699d47e25bd4d6b0c5dc7ab0627831e01ea027ebe33d80f608f139aa9fd0c6d923f32de9b5d714026300ed1c9a2f48';
module.exports = [
  { description: 'Luffa hash function string -> string',
    fn: function() { return luffa(inputString, 0, 0) === outputString; }
  },
  { description: 'Luffa hash function uint8[] -> uint8[]',
    fn: function() { return helper.int8ArrayToHexString(luffa(inputString, 0, 1)) === outputString; }
  },
  { description: 'Luffa hash function uint32 -> uint32[]',
    fn: function() { return helper.int32ArrayToHexString(luffa(inputString, 0, 2)) === outputString; }
  }
];
