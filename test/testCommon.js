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
var Post = require('../js/block/post.js');
var Header = require('../js/block/header.js');
var Block = require('../js/block/block.js');
var Hash = require('../js/hash/blake2s.js');

module.exports.validPost = function() {
  let h_buf = new ArrayBuffer(80);
  let h_arr = new Uint8Array(h_buf);
  arr[2] = 1;
  //(new DataView(buf)).setUint8(2, 0x01);

  let d_buf = new ArrayBuffer(41);
  let view = new DataView(d_buf);
  view.setUint32(0, 0x0024ffff);
  view.setUint8(40, 0xff);

  let hash = Hash.digest(new Uint8Array(d_buf));
  console.log(hash);
  // let hash = new Uint8Array(
  //   [84, 130, 61, 129, 27, 123, 26, 180,
  //   119, 159, 229, 70, 48, 228, 231, 89,
  //   146, 144, 143, 141, 119, 38, 248, 88,
  //   37, 62, 188, 89, 173, 87, 140, 2]);
  for (let i = 43; i < 75; i++) {
    h_arr[i] = hash[i-43];
  }

  return new Post(new Header(h_buf), d_buf);
};

module.exports.validBlock = function() {
  var buf = new ArrayBuffer(128);

  return new Block(validHeaderFromData(buf), buf);
};

module.exports.validHeaderFromData = validHeaderFromData = function(dataBuffer) {
  let h_buf = new ArrayBuffer(80);
  let h_arr = new Uint8Array(h_buf);
  let hash = Hash.digest(new Uint8Array(dataBuffer));
  for (let i = 43; i < 75; i++) {
    h_arr[i] = hash[i-43];
  }

  return new Header(h_buf);
}
