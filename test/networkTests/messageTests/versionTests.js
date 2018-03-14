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
const Version = require('../../../src/core/network/message/types/version.js');

tap.test('Version', (t) => {
  t.equal(Version.COMMAND(), 0, 'Version.COMMAND is 0');
  t.equal(Version.PAYLOAD_LENGTH(), 8, 'Version.COMMAND is 8');

  const data = new Uint8Array([
    // header
    0x13, 0x37, 0x13, 0x37,
    0x00, 0x00, 0x00, 0x06,
    0xAF, 0x49, 0xC8, 0x9E,
    0x66, 0xD0, 0x5E, 0xF2,
    // payload
    0x00, 0x00, 0xEF, 0x01,
    0x00, 0x00, 0x00, 0x02,
  ]);

  const v = new Version(data);

  t.equal(v.version(), 0x0000EF01, 'Version returns correct version number');
  t.equal(v.rawServices(), 0x00000002, 'Version returns correct raw services');
  t.assert(v.services.bootstrap(), 'Version sets services');

  t.strictSame(Version.create(0x0000EF01, 0x00000002), data.subarray(16), 'Version.create works');
  t.end();
});
