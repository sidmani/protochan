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

/* eslint-disable global-require */

const COMPONENTS = {};

[
  require('./component/connector/outgoing.js'),
  require('./component/connector/incoming.js'),
  require('./component/connector/connector.js'),
  require('./component/translator.js'),
  require('./component/handshake.js'),
  require('./component/receiver.js'),
  require('./component/terminator.js'),
  require('./component/exchange.js'),
  require('./component/echo/echoRequest.js'),
  require('./component/echo/echoResponse.js'),
  require('./component/known.js'),
].forEach((component) => {
  COMPONENTS[component.id()] = component;
});

const SERVICES = {};
[
  require('./service/socketHost.js'),
].forEach((service) => {
  SERVICES[service.index()] = service;
});

module.exports.components = COMPONENTS;
module.exports.services = SERVICES;
