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

const ErrorType = require('../error.js');

module.exports = class HashMap {
  constructor() {
    this.map = new Map();
  }

  set(obj, hash = obj.hash, overwrite = false) {
    this.setStringified(obj, HashMap.uint8ArrToHex(hash), overwrite);
  }

  setStringified(obj, str, overwrite = false) {
    if (this.map.has(str) && !overwrite) throw ErrorType.duplicateKey();
    this.map.set(str, obj);
  }

  unset(hash) {
    this.map.delete(HashMap.uint8ArrToHex(hash));
  }

  unsetStringified(hash) {
    this.map.delete(hash);
  }

  get(hash) {
    return this.map.get(HashMap.uint8ArrToHex(hash));
  }

  getStringified(hash) {
    return this.map.get(hash);
  }

  enumerate() {
    // return array of objects in the order they were added
    return Array.from(this.map.values());
  }

  size() {
    return this.map.size;
  }

  forEach(fn) {
    this.map.forEach(fn);
  }

  clear() {
    this.map.clear();
  }

  contains(hash) {
    return this.map.has(HashMap.uint8ArrToHex(hash));
  }

  containsStringified(keyStr) {
    return this.map.has(keyStr);
  }

  difference(otherMap, filter = () => true) {
    return Array.from(this.map.keys())
      .filter(key => !otherMap.containsStringified(key) &&
        filter(key, this.map.get(key)))
      .map(strKey => HashMap.hexToUint8Arr(strKey));
  }

  static uint8ArrToHex(arr) {
    return Array.from(arr)
      .map(val => val.toString(16).padStart(2, '0'))
      .join('');
  }

  static hexToUint8Arr(str) {
    if (!str) return new Uint8Array();
    const arr = [];
    for (let i = 0; i < str.length; i += 2) {
      arr.push(parseInt(str.substr(i, 2), 16));
    }
    return new Uint8Array(arr);
  }
};
