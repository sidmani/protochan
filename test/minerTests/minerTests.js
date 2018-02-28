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

const Miner = require('../../js/miner/miner.js');
const Hash = require('../../js/hash/blake2s.js');
const tap = require('tap');

tap.test('Miner produces a leading zero byte for 8 difficulty', (t) => {
  const data = new Uint8Array(80);

  const miner = new Miner(data);
  miner.mine(8);
  const hash = Hash.digest(data);
  t.equal(hash[0], 0);
  t.end();
});

tap.test('Header nonce methods', (t) => {
  const data = new Uint8Array(80);
  const m = new Miner(data);

  function getNonce(d) {
    return ((d[7] << 24)
    ^ (d[8] << 16)
    ^ (d[9] << 8)
    ^ d[10]) >>> 0;
  }

  m.setNonce(0x5f4f3f2f);
  t.equal(getNonce(data), 0x5f4f3f2f, 'Miner sets nonce');
  m.setNonce(0x5f4f3fff);
  m.incrNonce();
  t.equal(getNonce(data), 0x5f4f4000, 'Miner increments nonce');

  m.setNonce(0x55ffffff);
  m.incrNonce();
  t.equal(getNonce(data), 0x56000000, 'Miner increments nonce');

  m.setNonce(0x579effff);
  m.incrNonce();
  t.equal(getNonce(data), 0x579f0000, 'Miner increments nonce');

  t.end();
});
