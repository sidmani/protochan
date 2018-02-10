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

module.exports.Data = {
  length: function() { return new Error('Length of data is incorrect.'); },
  hash: function() { return new Error('Data hash does not match expected value.'); },
  controlLength: function() { return new Error('Invalid control byte length.'); },
  delimiter: function() { return new Error('Malformed delimiter byte.'); }
};

module.exports.Chain = {
  wrongBoard: function() { return new Error('Board ID mismatch.'); },
  missingReference: function() { return new Error('Referenced block does not exist.')},
  hashMismatch: function() { return new Error('Hashes were not equal as expected.')}
}

module.exports.Block = {
  type: function() { return new Error('Block type is incorrect.'); },
  illegalControlValues: function() { return new Error('Control bytes contain illegal values.'); }
};

module.exports.Parameter = {
  type: function() { return new Error('Parameter type is incorrect.'); },
  invalid: function() { return new Error('Parameter value is invalid.'); }
};

module.exports.Difficulty = {
  insufficient: function() { return new Error('Data does not meet difficulty threshold.'); }
};

module.exports.HashMap = {
  duplicate: function() { return new Error('Value is already set for that key.'); }
};

module.exports.State = {
  invalid: function() { return new Error('Invalid object state.'); }
};
