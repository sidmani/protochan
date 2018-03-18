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

/* eslint-disable no-console */

const MIN_LOG_LEVEL = 1;
const levels = {
  0: 'VERBOSE',
  1: 'INFO',
  2: 'WARNING',
  3: 'ERROR',
  4: 'FATAL',
};

function timestamp() {
  return new Date().toISOString().replace('T', ' ').substr(0, 19);
}

function log(str, level) {
  if (MIN_LOG_LEVEL > level) { return; }
  console.log(`${timestamp()} | ${levels[level]} | ${str}`);
}

module.exports.verbose = function (str) {
  log(str, 0);
};

module.exports.info = function (str) {
  log(str, 1);
};

module.exports.warning = function (str) {
  log(str, 2);
};

module.exports.error = function (str) {
  log(str, 3);
};

module.exports.fatal = function (str) {
  log(str, 4);
};
