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

const ThreadDataParser = require('./threadDataParser.js');
const PostDataParser = require('./postDataParser.js');
const GenesisDataParser = require('./genesisDataParser.js');
const OriginalPostDataParser = require('./originalPostDataParser.js');
const BlockType = require('../type.js');

const DataParserTypeMap = {
  [BlockType.THREAD]: ThreadDataParser,
  [BlockType.POST]: PostDataParser,
  [BlockType.GENESIS]: GenesisDataParser,
  [BlockType.ORIGINAL_POST]: OriginalPostDataParser,
};

module.exports.create = function (type, data, offset = 0) {
  return new DataParserTypeMap[type](data, offset);
};
