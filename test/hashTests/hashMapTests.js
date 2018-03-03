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

const HashMap = require('../../src/core/hash/hashMap.js');
const ErrorType = require('../../src/core/error.js');
const tap = require('tap');

tap.test('HashMap functions', (t) => {
  const block = { hash: new Uint8Array([1, 2, 7]) };
  const map = new HashMap();
  map.set(block);
  t.equal(map.get(block.hash), block, 'HashMap sets and gets block');
  t.throws(() => { map.set(block); }, ErrorType.duplicateKey(), 'HashMap refuses to set same object twice');
  map.unset(block);
  t.equal(map.get(block.hash), undefined, 'HashMap.unset removes object');

  map.set(block);
  map.unsetRaw(block.hash);
  t.equal(map.get(block.hash), undefined, 'HashMap.unset removes object');

  t.strictSame(HashMap.hexToUint8Arr(''), new Uint8Array());
  t.end();
});

tap.test('HashMap.set with specified hash', (t) => {
  const block = { hash: new Uint8Array([1, 2, 7]) };
  const map = new HashMap();
  t.throws(() => { map.set(block, [5, 4, 1]); }, ErrorType.parameterType(), 'HashMap.set validates hash type');
  map.set(block, new Uint8Array([5, 4, 3]));
  t.equal(map.get(new Uint8Array([5, 4, 3])), block, 'HashMap.set sets block');
  t.throws(() => { map.set('abc', new Uint8Array([5, 4, 3]), false); }, ErrorType.duplicateKey(), 'HashMap.set obeys false overwrite flag');
  t.doesNotThrow(() => { map.set('cde', new Uint8Array([5, 4, 3]), true); }, 'HashMap.setRaw obeys true overwrite flag');
  t.equal(map.get(new Uint8Array([5, 4, 3])), 'cde', 'HashMap.set overwrites existing value when overwrite flag is true');
  t.end();
});

tap.test('HashMap set functions', (t) => {
  const block1 = { hash: new Uint8Array([1, 2, 7]) };
  const block2 = { hash: new Uint8Array([6, 3, 9]) };
  const block3 = { hash: new Uint8Array([4, 1, 5]) };
  const blocks = [block1, block2, block3];

  const map = new HashMap();
  map.set(block1, new Uint8Array([5, 4, 3]));
  map.set(block2, new Uint8Array([6, 2, 1]));
  map.set(block3, new Uint8Array([5, 7, 8]));

  t.equal(map.contains(new Uint8Array([5, 4, 3])), true, 'HashMap.contains true for existing key');
  t.equal(map.contains(new Uint8Array([3, 4, 3])), false, 'HashMap.contains false for nonexistent key');

  const result = map.enumerate();
  t.strictSame(result, blocks, 'HashMap.enumerate returns correct array');
  let count = 0;
  map.forEach((value) => {
    t.strictSame(result[count], value, 'HashMap.forEach preserves order');
    count += 1;
  });
  t.equal(count, 3, 'HashMap.forEach iterates over all objects');

  const map2 = new HashMap();
  map2.set(block1, new Uint8Array([5, 4, 3]));
  map2.set(block2, new Uint8Array([6, 2, 1]));
  map2.set(block3, new Uint8Array([5, 8, 8]));

  const diff = map.difference(map2);
  t.equal(diff.length, 1, 'HashMap.difference length is correct');
  t.strictSame(diff[0], new Uint8Array([5, 7, 8]), 'HashMap.difference contents are correct');

  map2.unsetRaw(new Uint8Array([6, 2, 1]));

  const diff2 = map.difference(map2, key => key === '060201');
  t.equal(diff2.length, 1, 'HashMap.difference filtered length is correct');
  t.strictSame(diff2[0], new Uint8Array([6, 2, 1]), 'HashMap.difference filtered contents are correct');

  t.equal(map.size(), 3, 'HashMap returns correct size');
  map.clear();
  t.equal(map.size(), 0, 'HashMap.clear empties contents');
  t.end();
});
