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

var common = require('../testCommon.js');
var HashMap = require('../../js/hash/hashMap.js');
var Head = require('../../js/chain/head.js');

module.exports = [
  { description: "Head validates originalPost type",
    dual: true,
    fn: function(shouldPass) {
      let originalPost;
      let threadHash = new Uint8Array(32);
      let map = new HashMap();
      let startingHeight = 1;
      if (shouldPass) {
        originalPost = common.validPost();
      } else {
        originalPost = new Array(5);
      }

      new Head(originalPost, threadHash, map, startingHeight);
    }
  },
  { description: "Head validates threadHash type",
    dual: true,
    fn: function(shouldPass) {
      let originalPost = common.validPost();
      let threadHash;
      let map = new HashMap();
      let startingHeight = 1;
      if (shouldPass) {
        threadHash = new Uint8Array(32);
      } else {
        threadHash = new Array(10);
      }

      new Head(originalPost, threadHash, map, startingHeight);
    }
  },
  { description: "Head validates map type",
    dual: true,
    fn: function(shouldPass) {
      let originalPost = common.validPost();
      let threadHash = new Uint8Array(32);
      let map;
      let startingHeight = 1;
      if (shouldPass) {
        map = new HashMap();
      } else {
        map = new Array(10);
      }

      new Head(originalPost, threadHash, map, startingHeight);
    }
  },
  { description: "Head validates startingHeight type",
    dual: true,
    fn: function(shouldPass) {
      let originalPost = common.validPost();
      let threadHash = new Uint8Array(32);
      let map = new HashMap();
      let startingHeight;
      if (shouldPass) {
        startingHeight = 5;
      } else {
        startingHeight = 'hello';
      }

      new Head(originalPost, threadHash, map, startingHeight);
    }
  },
  { description: "Head validates startingHeight value",
    dual: true,
    fn: function(shouldPass) {
      let originalPost = common.validPost();
      let threadHash = new Uint8Array(32);
      let map = new HashMap();
      let startingHeight;
      if (shouldPass) {
        startingHeight = 0;
      } else {
        startingHeight = -3;
      }

      new Head(originalPost, threadHash, map, startingHeight);
    }
  },
  { description: "Head sets starting height",
    fn: function() {
      let head = new Head(common.validPost(), new Uint8Array(32), new HashMap(), 177);
      common.assert(head.height === 177);
    }
  },
  { description: "Head sets this.thread",
    fn: function() {
      let threadHash = new Uint8Array(32);
      for (let i = 0; i < 32; i++) {
        threadHash[i] = i*7;
      }
      let head = new Head(common.validPost(), threadHash, new HashMap(), 177);
      common.assertArrayEquality(threadHash, head.thread);
    }
  },
  { description: "Head sets thread on original post",
    fn: function() {
      let originalPost = common.validPost();
      let threadHash = new Uint8Array(32);
      for (let i = 0; i < 32; i++) {
        threadHash[i] = i*7;
      }
      let map = new HashMap();

      let head = new Head(originalPost, threadHash, map, 0);
      common.assertArrayEquality(originalPost.thread, threadHash);
    }
  },
  { description: "Head inserts original post into map",
    fn: function() {
      let originalPost = common.validPost();
      let threadHash = new Uint8Array(32);
      let map = new HashMap();

      let head = new Head(originalPost, threadHash, map, 0);
      common.assert(map.get(originalPost.hash()) === originalPost);
    }
  },
  { description: "Head sets timestamp from original post",
    fn: function() {
      let originalPost = common.validPost();
      let threadHash = new Uint8Array(32);
      let map = new HashMap();
      originalPost.header._data.setUint32(3, 18643);
      let head = new Head(originalPost, threadHash, map, 0);
      common.assert(head.timestamp === 18643);
    }
  },
  { description: "Head sets unconfirmed post count",
    fn: function() {
      let originalPost = common.validPost();
      let threadHash = new Uint8Array(32);
      let map = new HashMap();
      let head = new Head(originalPost, threadHash, map, 1077);
      common.assert(head.unconfirmedPosts === 1);
    }
  },
  { description: "Head.pushPost validates post type",
    dual: true,
    fn: function(shouldPass) {
      let originalPost = common.validPost();
      let originalPostHash = originalPost.hash();
      let head = new Head(originalPost, new Uint8Array(32), new HashMap(), 177);
      let nextPost;
      if (shouldPass) {
        nextPost = common.validPost();
        for (let i = 11; i < 43; i++) {
          nextPost.header.data[i] = originalPostHash[i-11];
        }
      } else {
        nextPost = new Array(6);
      }
      head.pushPost(nextPost);
    }
  },
  { description: "Head.pushPost validates prevHash",
    dual: true,
    fn: function(shouldPass) {
      let originalPost = common.validPost();
      let originalPostHash = originalPost.hash();
      let head = new Head(originalPost, new Uint8Array(32), new HashMap(), 177);
      let nextPost = common.validPost();
      if (shouldPass) {
        for (let i = 11; i < 43; i++) {
          nextPost.header.data[i] = originalPostHash[i-11];
        }
      } else {
        for (let i = 11; i < 43; i++) {
          nextPost.header.data[i] = i * 5;
        }
      }
      head.pushPost(nextPost);
    }
  },
  { description: "Head.pushPost sets thread on post",
    fn: function() {
      let threadHash = new Uint8Array(32);
      for (let i = 0; i < 32; i++) {
        threadHash[i] = i*7;
      }
      let originalPost = common.validPost();
      let originalPostHash = originalPost.hash();
      let head = new Head(originalPost, threadHash, new HashMap(), 177);
      let nextPost = common.validPost();
      for (let i = 11; i < 43; i++) {
        nextPost.header.data[i] = originalPostHash[i-11];
      }
      head.pushPost(nextPost);

      common.assertArrayEquality(nextPost.thread, threadHash);
    }
  },
  { description: "Head.pushPost sets head",
    fn: function() {
      let originalPost = common.validPost();
      let originalPostHash = originalPost.hash();
      let head = new Head(originalPost, new Uint8Array(32), new HashMap(), 177);
      let nextPost = common.validPost();
      for (let i = 11; i < 43; i++) {
        nextPost.header.data[i] = originalPostHash[i-11];
      }
      head.pushPost(nextPost);

      common.assertArrayEquality(head.head, nextPost.hash());
    }
  },
  { description: "Head.pushPost increments unconfirmed post count",
    fn: function() {
      let originalPost = common.validPost();
      let originalPostHash = originalPost.hash();
      let head = new Head(originalPost, new Uint8Array(32), new HashMap(), 177);
      let nextPost = common.validPost();
      for (let i = 11; i < 43; i++) {
        nextPost.header.data[i] = originalPostHash[i-11];
      }
      head.pushPost(nextPost);

      common.assert(head.unconfirmedPosts === 2);
    }
  },
  { description: "Head.pushPost sets timestamp",
    fn: function() {
      let originalPost = common.validPost();
      let originalPostHash = originalPost.hash();
      let head = new Head(originalPost, new Uint8Array(32), new HashMap(), 177);
      let nextPost = common.validPost();
      nextPost.header._data.setUint32(3, 2077354);
      for (let i = 11; i < 43; i++) {
        nextPost.header.data[i] = originalPostHash[i-11];
      }
      head.pushPost(nextPost);

      common.assert(head.timestamp === 2077354);
    }
  },
  { description: "Head.pushPost inserts new post into map",
    fn: function() {
      let originalPost = common.validPost();
      let originalPostHash = originalPost.hash();
      let map = new HashMap();
      let head = new Head(originalPost, new Uint8Array(32), map, 177);
      let nextPost = common.validPost();
      for (let i = 11; i < 43; i++) {
        nextPost.header.data[i] = originalPostHash[i-11];
      }
      head.pushPost(nextPost);

      common.assert(map.get(nextPost.hash()) === nextPost);
    }
  },
  { description: "Head.pushPost increments height",
    fn: function() {
      let originalPost = common.validPost();
      let originalPostHash = originalPost.hash();
      let head = new Head(originalPost, new Uint8Array(32), new HashMap(), 177);
      let nextPost = common.validPost();
      for (let i = 11; i < 43; i++) {
        nextPost.header.data[i] = originalPostHash[i-11];
      }
      head.pushPost(nextPost);

      common.assert(head.height === 178);
    }
  },
  { description: "Head.discardStage works",
    fn: function() {
      let originalPost = common.validPost();
      let originalPostHash = originalPost.hash();
      let head = new Head(originalPost, new Uint8Array(32), new HashMap(), 177);
      head.stage = common.validThread(originalPost); // not undefined
      head.discardStage();
      common.assert(head.stage === undefined);
    }
  },
  { description: "Head.commitThread validates stage",
    dual: true,
    fn: function(shouldPass) {
      let originalPost = common.validPost();
      let originalPostHash = originalPost.hash();
      let head = new Head(originalPost, new Uint8Array(32), new HashMap(), 177);

      if (shouldPass) {
        head.stage = common.validThread(originalPost);
      } else {
        head.stage = 5;
      }

      head.commitThread();
    }
  },
  { description: "Head.commitThread increments height",
    fn: function() {
      let originalPost = common.validPost();
      let originalPostHash = originalPost.hash();
      let head = new Head(originalPost, new Uint8Array(32), new HashMap(), 177);
      head.stage = common.validThread(originalPost);
      head.commitThread();
      common.assert(head.height === 178);
    }
  },
  { description: "Head.commitThread resets unconfirmed post count",
    fn: function() {
      let originalPost = common.validPost();
      let originalPostHash = originalPost.hash();
      let head = new Head(originalPost, new Uint8Array(32), new HashMap(), 177);
      head.stage = common.validThread(originalPost);
      common.assert(head.unconfirmedPosts === 1);
      head.commitThread();
      common.assert(head.unconfirmedPosts === 0);
    }
  },
  { description: "Head.commitThread sets head",
    fn: function() {
      let originalPost = common.validPost();
      let originalPostHash = originalPost.hash();
      let head = new Head(originalPost, new Uint8Array(32), new HashMap(), 177);
      let thread = common.validThread(originalPost);
      head.stage = thread;
      head.commitThread();
      common.assert(head.head === thread);
    }
  },
  { description: "Head.commitThread clears stage",
    fn: function() {
      let originalPost = common.validPost();
      let originalPostHash = originalPost.hash();
      let head = new Head(originalPost, new Uint8Array(32), new HashMap(), 177);
      let thread = common.validThread(originalPost);
      head.stage = thread;
      head.commitThread();
      common.assert(head.stage === undefined);
    }
  },
  { description: "Head.getBlockAtHead retrieves head from map",
    fn: function() {
      let originalPost = common.validPost();
      let originalPostHash = originalPost.hash();
      let map = new HashMap();
      let head = new Head(originalPost, new Uint8Array(32), map, 177);
      common.assert(head.getBlockAtHead() === originalPost);
    }
  }
]
