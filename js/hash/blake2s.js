// This file is a part of the protochan project.
// https://github.com/sidmani/protochan
// https://www.sidmani.com/?postid=3

// BLAKE2s hash function in pure Javascript
// Adapted from the reference implementation in RFC7693
// Ported to Javascript by DC - https://github.com/dcposch
// Released under CC0

// Modifications (c) 2018 Sid Mani
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

var Util = require('../util.js');

// Little-endian byte access.
// Expects a Uint8Array and an index
// Returns the little-endian uint32 at v[i..i+3]
function B2S_GET32 (v, i) {
  return v[i] ^ (v[i + 1] << 8) ^ (v[i + 2] << 16) ^ (v[i + 3] << 24);
}

// Mixing function G.
function B2S_G (a, b, c, d, x, y) {
  v[a] = v[a] + v[b] + x;
  v[d] = ROTR32(v[d] ^ v[a], 16);
  v[c] = v[c] + v[d];
  v[b] = ROTR32(v[b] ^ v[c], 12);
  v[a] = v[a] + v[b] + y;
  v[d] = ROTR32(v[d] ^ v[a], 8);
  v[c] = v[c] + v[d];
  v[b] = ROTR32(v[b] ^ v[c], 7);
}

// 32-bit right rotation
// x should be a uint32
// y must be between 1 and 31, inclusive
function ROTR32 (x, y) {
  return (x >>> y) ^ (x << (32 - y));
}

// Initialization Vector.
var BLAKE2S_IV = new Uint32Array([
  0x6A09E667, 0xBB67AE85, 0x3C6EF372, 0xA54FF53A,
  0x510E527F, 0x9B05688C, 0x1F83D9AB, 0x5BE0CD19]);

var SIGMA = new Uint8Array([
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
  14, 10, 4, 8, 9, 15, 13, 6, 1, 12, 0, 2, 11, 7, 5, 3,
  11, 8, 12, 0, 5, 2, 15, 13, 10, 14, 3, 6, 7, 1, 9, 4,
  7, 9, 3, 1, 13, 12, 11, 14, 2, 6, 5, 10, 4, 0, 15, 8,
  9, 0, 5, 7, 2, 4, 10, 15, 14, 1, 11, 12, 6, 8, 3, 13,
  2, 12, 6, 10, 0, 11, 8, 3, 4, 13, 7, 5, 15, 14, 1, 9,
  12, 5, 1, 15, 14, 13, 4, 10, 0, 7, 6, 3, 9, 2, 8, 11,
  13, 11, 7, 14, 12, 1, 3, 9, 5, 0, 15, 4, 8, 6, 2, 10,
  6, 15, 14, 9, 11, 3, 0, 8, 12, 2, 13, 7, 1, 4, 10, 5,
  10, 2, 8, 4, 7, 6, 1, 5, 15, 11, 9, 14, 3, 12, 13, 0]);

// Compression function. "last" flag indicates last block
var v = new Uint32Array(16);
var m = new Uint32Array(16);
function blake2sCompress (ctx, last) {
  var i = 0;
  for (i = 0; i < 8; i++) { // init work variables
    v[i] = ctx.h[i];
    v[i + 8] = BLAKE2S_IV[i];
  }

  v[12] ^= ctx.t; // low 32 bits of offset
  v[13] ^= (ctx.t / 0x100000000); // high 32 bits
  if (last) { // last block flag set ?
    v[14] = ~v[14];
  }

  for (i = 0; i < 16; i++) { // get little-endian words
    m[i] = B2S_GET32(ctx.b, 4 * i);
  }

  // ten rounds of mixing
  // uncomment the DebugPrint calls to log the computation
  // and match the RFC sample documentation
  // util.debugPrint('          m[16]', m, 32)
  for (i = 0; i < 10; i++) {
    B2S_G(0, 4, 8, 12, m[SIGMA[i * 16 + 0]], m[SIGMA[i * 16 + 1]]);
    B2S_G(1, 5, 9, 13, m[SIGMA[i * 16 + 2]], m[SIGMA[i * 16 + 3]]);
    B2S_G(2, 6, 10, 14, m[SIGMA[i * 16 + 4]], m[SIGMA[i * 16 + 5]]);
    B2S_G(3, 7, 11, 15, m[SIGMA[i * 16 + 6]], m[SIGMA[i * 16 + 7]]);
    B2S_G(0, 5, 10, 15, m[SIGMA[i * 16 + 8]], m[SIGMA[i * 16 + 9]]);
    B2S_G(1, 6, 11, 12, m[SIGMA[i * 16 + 10]], m[SIGMA[i * 16 + 11]]);
    B2S_G(2, 7, 8, 13, m[SIGMA[i * 16 + 12]], m[SIGMA[i * 16 + 13]]);
    B2S_G(3, 4, 9, 14, m[SIGMA[i * 16 + 14]], m[SIGMA[i * 16 + 15]]);
  }

  for (i = 0; i < 8; i++) {
    ctx.h[i] ^= v[i] ^ v[i + 8];
  }
}

// Creates a BLAKE2s hashing context
function blake2sInit () {
  var ctx = {
    h: new Uint32Array(BLAKE2S_IV), // hash state
    b: new Uint32Array(64), // input block
    c: 0, // pointer within block
    t: 0, // input count
  };
  ctx.h[0] ^= 0x01010020;
  return ctx;
}

// Updates a BLAKE2s streaming hash
// Requires hash context and Uint8Array (byte array)
function blake2sUpdate (ctx, input) {
  for (var i = 0; i < input.length; i++) {
    if (ctx.c === 64) { // buffer full ?
      ctx.t += ctx.c; // add counters
      blake2sCompress(ctx, false); // compress (not last)
      ctx.c = 0; // counter to zero
    }
    ctx.b[ctx.c++] = input[i];
  }
}

// Completes a BLAKE2s streaming hash
// Returns a Uint8Array containing the message digest
function blake2sFinal (ctx) {
  ctx.t += ctx.c; // mark last block offset
  while (ctx.c < 64) { // fill up with zeros
    ctx.b[ctx.c++] = 0;
  }
  blake2sCompress(ctx, true); // final block flag = 1

  // little endian convert and store
  var out = new Uint8Array(32);
  for (var i = 0; i < 32; i++) {
    out[i] = (ctx.h[i >> 2] >> (8 * (i & 3))) & 0xFF;
  }
  return out;
}

// Computes the BLAKE2S hash of Uint8Array array, and returns a Uint8Array
//
// Returns a n-byte Uint8Array
//
// Parameters:
// - input - the input bytes, as a Uint8Array
module.exports.digest = function blake2s(input) {
  Util.assert(input instanceof Uint8Array);
  var ctx = blake2sInit()
  blake2sUpdate(ctx, input)
  return blake2sFinal(ctx)
};
