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
var Genesis = require('../js/block/genesis.js');
var Thread = require('../js/block/thread.js');
var GenesisPost = require('../js/block/genesisPost.js');
var Hash = require('../js/hash/blake2s.js');

module.exports.assert = assert = function(condition, description) {
  if (!condition) {
    throw new Error(description)
  }
}

module.exports.hash = function(data) {
  return Hash.digest(data);
}

module.exports.assertArrayEquality = function(arr1, arr2) {
  assert(arr1 instanceof Uint8Array);
  assert(arr2 instanceof Uint8Array);
  assert(arr1.byteLength === arr2.byteLength);
  for (let i = 0; i < arr1.byteLength; i++) {
    assert(arr1[i] === arr2[i]);
  }
}

module.exports.assertJSArrayEquality = function(arr1, arr2) {
  assert(arr1 instanceof Array);
  assert(arr2 instanceof Array);
  assert(arr1.length === arr2.length);
  for (let i = 0; i < arr1.length; i++) {
    assert(arr1[i] === arr2[i]);
  }
}

module.exports.validThread = function(post) {
  assert(post instanceof Post)
  let d_buf = new ArrayBuffer(69);
  let arr = new Uint8Array(d_buf);

  let view = new DataView(d_buf);
  view.setUint32(0, 0x0300401D);
  view.setUint8(68, 0x04);

  for (let i = 5; i < 37; i++) {
    arr[i] = 0x00;
  }
  let postHash = Hash.digest(post.header.data);

  for (let i = 37; i < 68; i++) {
    arr[i] = postHash[i-37];
  }

  let header = validThreadHeaderFromData(d_buf);

  return new Thread(header, arr);
}

module.exports.validPost = function() {
  let d_buf = new ArrayBuffer(41);
  let view = new DataView(d_buf);
  view.setUint32(0, 0x0300241D);
  view.setUint8(40, 0x04);

  let header = validPostHeaderFromData(d_buf);

  return new Post(header, new Uint8Array(d_buf));
};

module.exports.validGenesisPost = function() {
  let d_buf = new ArrayBuffer(10);
  let dataView = new DataView(d_buf);
  dataView.setUint32(0, 0x080000cc);
  dataView.setUint32(4, 0xefacadae);
  dataView.setUint8(8, 0x1D);
  dataView.setUint8(9, 0x04);
  let header = validPostHeaderFromData(d_buf);

  for (let i = 11; i < 43; i++) {
    header.data[i] = 0;
  }
  return new GenesisPost(header, new Uint8Array(d_buf));
};

module.exports.validGenesis = function(post) {
  assert(post instanceof GenesisPost)
  let d_buf = new ArrayBuffer(69);
  let view = new DataView(d_buf);
  view.setUint32(0, 0x0300401D); // control + separator
  view.setUint8(68, 0x04); //terminator
  let arr = new Uint8Array(d_buf);
  for (let i = 5; i < 37; i++) {
    arr[i] = 0x00;
  }

  let postHash = Hash.digest(post.header.data);

  for (let i = 37; i < 69; i++) {
    arr[i] = postHash[i-32];
  }

  let header = validThreadHeaderFromData(d_buf);

  return new Genesis(header, new Uint8Array(d_buf));
}

module.exports.validBlock = function() {
  var buf = new ArrayBuffer(128);

  return new Block(validHeaderFromData(buf), new Uint8Array(buf));
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

module.exports.validPostHeaderFromData = validPostHeaderFromData = function(dataBuffer) {
  let h = validHeaderFromData(dataBuffer);
  h.data[2] = 0x01;
  return h;
}

module.exports.validThreadHeaderFromData = validThreadHeaderFromData = function(dataBuffer) {
  let h = validHeaderFromData(dataBuffer);
  h.data[2] = 0x00;
  return h;
}
