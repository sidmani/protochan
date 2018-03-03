
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

module.exports = class _Error extends Error {
  constructor(message, type) {
    super(message);
    this.type = type;
    Error.captureStackTrace(this, _Error);
  }

  static messageType() { return new _Error('Unknown message type.', 'MESSAGE_TYPE_UNKNOWN'); }
  static dataLength() { return new _Error('Length of data is incorrect.', 'DATA_LENGTH_INVALID'); }
  static dataHash() { return new _Error('Data hash does not match expected value.', 'DATA_HASH_MISMATCH'); }
  static controlLength() { return new _Error('Invalid control byte length.', 'DATA_CONTROL_LENGTH'); }
  static illegalNodeType() { return new _Error('Block of specified type cannot be inserted', 'CHAIN_ILLEGAL_TYPE'); }
  static wrongThread() { return new _Error('Thread ID mismatch.', 'CHAIN_THREAD_MISMATCH'); }
  static missingReference(ref) {
    const err = new _Error('Thread ID mismatch.', 'CHAIN_MISSING_REF');
    err.ref = ref;
    return err;
  }
  static hashMismatch() { return new _Error('Hashes were not equal as expected.', 'CHAIN_HASH_MISMATCH'); }
  static invalidChild() { return new _Error('Expected a child to exist, but no child was found.', 'INVALID_CHILD'); }
  static missingThread() { return new _Error('Thread was removed illegally.', 'CHAIN_THREAD_MISSING'); }
  static threadOrder() { return new _Error('Order of threads in thread block is illegal.', 'CHAIN_THREAD_ORDER'); }
  static unknownThread() { return new _Error('Thread record referenced nonexistent thread.', 'CHAIN_UNKNOWN_THREAD'); }
  static timeTravel() { return new _Error('Timestamp order is illegal.', 'CHAIN_TIME_TRAVEL'); }
  static parameterType() { return new _Error('Parameter type is incorrect.', 'PARAMETER_TYPE_INVALID'); }
  static insufficientDifficulty() { return new _Error('Data does not meet difficulty threshold.', 'DIFFICULTY_INSUFFICIENT'); }
  static duplicateKey() { return new _Error('Value is already set for that key.', 'HASHMAP_DUPLICATE_KEY'); }
  static internalConsistency() { return new _Error('Internal consistency exception.', 'INTERNAL_CONSISTENCY_EXCEPTION'); }
};
