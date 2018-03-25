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

const Log = require('../../util/log.js');

const localLog = Log.submodule('LOADER: ');

module.exports = class Loader {
  constructor(config) {
    this.components = {};
    this.config = config;
    this.services = {};
  }

  // load services
  enableServices(services, library) {
    localLog.verbose(`enabling services ${Log.hex(services, 8)}.`);
    for (let i = 0; i < 32; i += 1) {
      if (((services >> i) & 1) === 1) {
        this.services[library[i].id()] = library[i].attach(this.config);
        localLog.verbose(`attached service ${library[i].id()} (0x${(1 << i).toString(16).padStart(8, '0')})`);
      }
    }
  }

  static resolve(id, library, set) {
    const component = library[id];
    if (!component) {
      throw new Error('Unknown component identifier');
    }

    const inputs = component.inputs();
    for (let k = 0; k < inputs.length; k += 1) {
      Loader.resolve(inputs[k], library, set);
      set.add(inputs[k]);
    }
    set.add(id);
  }

  static resolveDependencies(ids, library) {
    const set = new Set();
    ids.forEach(id => Loader.resolve(id, library, set));
    return Array.from(set.keys());
  }

  // load components and dependencies
  loadComponents(ids, library) {
    localLog.verbose('loading components...');
    const dependencies = Loader.resolveDependencies(ids, library);
    dependencies.forEach((dependencyID) => {
      const component = library[dependencyID];
      const sublog = Log.submodule(`${dependencyID}`);
      this.components[dependencyID] = component
        .attach(
          this.components,
          this.services,
          this.config,
          sublog,
        )
        .error(e => sublog.error(`: ${e.message}`));

      localLog.verbose(`attached ${dependencyID} to network.`);
    });
  }
};
