
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

module.exports.Data = {
  length() { return new Error('Length of data is incorrect.'); },
  hash() { return new Error('Data hash does not match expected value.'); },
  controlLength() { return new Error('Invalid control byte length.'); },
  delimiter() { return new Error('Malformed delimiter byte.'); },
};

module.exports.Chain = {
  illegalType() { return new Error('Block of specified type cannot be inserted'); },
  wrongBoard() { return new Error('Board ID mismatch.'); },
  missingReference() { return new Error('Referenced block does not exist.'); },
  hashMismatch() { return new Error('Hashes were not equal as expected.'); },
  missingThread() { return new Error('Thread was removed illegally.'); },
  threadOrder() { return new Error('Order of threads in thread block is illegal.'); },
  unknownThread() { return new Error('Thread record referenced nonexistent thread.'); },
  timeTravel() { return new Error('Timestamp order is illegal.'); },
};

module.exports.Head = {
  resurrection() { return new Error('Attempt to resurrect a buried thread.'); },
};

module.exports.Block = {
  type() { return new Error('Block type is incorrect.'); },
  illegalControlValues() { return new Error('Control bytes contain illegal values.'); },
};

module.exports.Parameter = {
  type() { return new Error('Parameter type is incorrect.'); },
  invalid() { return new Error('Parameter value is invalid.'); },
};

module.exports.Difficulty = {
  insufficient() { return new Error('Data does not meet difficulty threshold.'); },
};

module.exports.HashMap = {
  duplicate() { return new Error('Value is already set for that key.'); },
};

module.exports.State = {
  invalid() { return new Error('Invalid object state.'); },
  internalConsistency() { return new Error('Internal consistency exception.'); },
};
