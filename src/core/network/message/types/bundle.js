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

const Message = require('../message.js');
/* eslint-disable no-unused-vars */
const ByteArray = require('../../../util/byteArray.js');
/* eslint-enable no-unused-vars */

module.exports = class Bundle extends Message {
  constructor(data, ObjectClass) {
    super(data, 2 + (data.getUint16(Message.HEADER_LENGTH()) * ObjectClass.BYTE_LENGTH()));
    this.ObjectClass = ObjectClass;
  }

  count() {
    return this.data.getUint16(Message.HEADER_LENGTH());
  }

  object(index) {
    return new this.ObjectClass(
      this.data,
      Message.HEADER_LENGTH()
       + 2
       + (index * this.ObjectClass.BYTE_LENGTH()),
    );
  }

  forEach(fn) {
    const count = this.count();
    for (let i = 0; i < count; i += 1) {
      fn(this.object(i));
    }
  }

  static create(objects, ObjectClass) {
    const payload = new Uint8Array(2 + (objects.length * ObjectClass.BYTE_LENGTH()));
    payload.setUint16(0, objects.length);
    objects.forEach((object, index) => {
      const addressData = object.data.subarray(
        object.offset,
        object.offset + ObjectClass.BYTE_LENGTH(),
      );
      payload.set(addressData, 2 + (ObjectClass.BYTE_LENGTH() * index));
    });
    return payload;
  }
};
