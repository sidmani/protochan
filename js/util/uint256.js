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

module.exports = class Uint256 {
  constructor(value) {
    this.array = new Uint8Array(32);
    if (typeof(value) === 'number') {
      this.array[28] = value >> 24;
      this.array[29] = value >> 16;
      this.array[30] = value >> 8;
      this.array[31] = value;
    } else if (value instanceof Uint8Array) {
      this.array.set(0, value);
    }
  }

  add(other) {
    let carry = 0;
    for (let i = 31; i >= 0; i--) {
      let sum = this.array[i] + other.array[i] + carry;
      this.array[i] = sum;
      if (sum > 255) {
        carry = sum - 255;
      } else {
        carry = 0;
      }
    }
  }

  copy() {
    return new Uint256(this.array);
  }
}
