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

"use strict";

var Block = require('../block/block.js');
var ErrorType = require('../error.js');

// Basic hashmap implementation
module.exports = class HashMap {
  constructor() {}

  set(obj) {
    if (typeof(obj.hash) !== 'function') throw ErrorType.Parameter.type();
    let hash = obj.hash();
    let str = HashMap.uint8ArrToHex(hash);
    if (this[str] !== undefined) throw ErrorType.HashMap.duplicate();
    this[str] = obj;
    return hash;
  }

  setRaw(hash, obj, overwrite) {
    if (!(hash instanceof Uint8Array)) throw ErrorType.Parameter.type();
    let str = HashMap.uint8ArrToHex(hash);
    if (this[str] !== undefined && !overwrite) throw ErrorType.HashMap.duplicate();
    this[str] = obj;
  }

  unset(obj) {
    if (typeof(obj.hash) !== 'function') throw ErrorType.Parameter.type();
    let hash = obj.hash();
    let str = HashMap.uint8ArrToHex(hash);
    this[str] = undefined;
  }

  get(hash) {
    if (!(hash instanceof Uint8Array)) throw ErrorType.Parameter.type();
    return this[HashMap.uint8ArrToHex(hash)];
  }

  enumerate() {
    // return array of objects in the order they were added
    return Object.keys(this).map(key => this[key]);
  }

  isEmpty() {
    return Object.keys(this).length === 0;
  }

  enumerateKeys() {
    return Object.keys(this);
  }

  // XXX: untested
  static uint8ArrToHex(arr) {
  	let str = '';
  	for (let i = 0; i < arr.byteLength; i++) {
  			str += (arr[i]<16?'0':'') + arr[i].toString(16);
  	}
  	return str;
  }
}
