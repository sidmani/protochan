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

const Loader = require('./protocol/loader.js');
const Library = require('./protocol/library.js');
const Dependencies = require('./protocol/dependencies.js');
const Tracker = require('./tracker.js');

const Log = require('../util/log.js').submodule('NETWORK: ');

module.exports = class Network {
  constructor(config, chain) {
    this.tracker = new Tracker();

    this.loader = new Loader(config);
    this.loader.components.TRACKER = this.tracker;
    this.loader.components.CHAIN = chain;

    Log.info(`MAGIC=${Log.hex(config.MAGIC, 8)}, VERSION=${config.VERSION}, SERVICES=${Log.hex(config.SERVICES, 8)}`);

    // load services
    this.loader.enableServices(config.SERVICES, Library.services);

    // load global components
    this.loader.loadComponents(Dependencies, Library.components);

    Log.info('READY');
  }

  seed(addresses) {
    // send addr message containing bootstrap addresses
    Log.info('SEEDING...');
    addresses.forEach(address => this.tracker.addKnown(address));
  }
};
