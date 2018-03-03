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

const Hash = require('./blake2s.js');

// on 2chan and 4chan, a tripcode is the hash of a secret password
// the server replaces the password with the hash, allowing a user
// to prove their identity

// We don't have a server to mask the password.
// There are two possible methods of achieving this functionality:

// A) The first post using the code contains the hash,
// and every subsequent post contains the password for
// the previous hash and a new hash
// This means that a tripcode can be used as many times as
// a user wants, and requires n hashes on the nth use.
// This has the downside of requiring knowledge of the location
// of every previous use of the code.

// B) There is a single password, and it is hashed n times.
// On the first use, the nth hash is displayed
// every successive use displays the (n-i)th hash
// This means that a tripcode can have a fixed number of uses, which
// is good for security since forcing peers to perform an arbitrary
// number of hashes is dangerous
// A hash and the value (n-i) is enough to prove identity

// This implementation uses pattern (B).

// To prevent abuse of the system, we will require a difficulty
// on the resulting hash (?)

// TODO: implementation

const MAX_TRIPCODE_USES = 16;

const ErrorType = require('../error.js');

// module.exports = class Tripcode {
//   constructor(pwd) {
//     // parameter validation
//     if (typeof(pwd) !== 'string') throw ErrorType.Parameter.type();
//     // encode the string into a uint8array
//   //  let arr = ;
//
//     // hash it 16 times
//     this.hash = arr;
//     for (let i = 0; i < 16; i++) {
//       this.hash = Hash.digest(this.hash);
//     }
//   }
// }
