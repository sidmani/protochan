/// <reference path="header.ts" />

namespace Block {
  class ThreadBlock {
    header: Header;
    data: Uint8Array;

    constructor(_header: Header, _data: Uint8Array) {
      this.header = _header;
      this.data = _data;
    }
  }

  class PostBlock {
    header: Header;
    data: Uint8Array;

    constructor(_header: Header, _data: Uint8Array) {
      this.header = _header;
      this.data = _data;
    }
  }
}
