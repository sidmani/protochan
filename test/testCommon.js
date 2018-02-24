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
// var Post = require('../js/block/post.js');
var Header = require('../js/block/header.js');
var Hash = require('../js/hash/blake2s.js');
var MerkleTree = require('../js/hash/merkleTree.js');

module.exports.hash = function(data) {
  return Hash.digest(data);
}

module.exports.validThread = function(post) {
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

  return new Block(header, arr);
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

  let header = Header.createFrom(0, 1, 0, 0, new Uint8Array(32), Hash.digest(new Uint8Array(d_buf)), 0, 0);

  return new Genesis(header, arr);
}

module.exports.validHeaderFromData = validHeaderFromData = function(dataBuffer) {
  return Header.createFrom(0, 0, 0, 0, new Uint8Array(32), Hash.digest(new Uint8Array(dataBuffer)), 0, 0);
}

module.exports.validPostHeaderFromData = validPostHeaderFromData = function(dataBuffer) {
  return Header.createFrom(0, 1, 0, 0, new Uint8Array(32), Hash.digest(new Uint8Array(dataBuffer)), 0, 0);
}

module.exports.validThreadHeaderFromData = validThreadHeaderFromData = function(dataBuffer) {
  let arr = new Uint8Array(dataBuffer);
  let merkleRoot = new MerkleTree(arr.subarray(arr[0] + 1, arr.length - 1)).root.hash;
  return Header.createFrom(0, 0, 0, 0,
    new Uint8Array(32),
    merkleRoot, 0, 0);
}
