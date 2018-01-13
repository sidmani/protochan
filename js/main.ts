//////// generic block header (74 bytes)
// 1 byte protocol_version
// 1 byte block type
// 4 bytes timestamp
// 4 bytes nonce
// 32 bytes previous hash (board: board or genesis | thread: thread or board | post: post or thread)
// 32 bytes merkle hash of data

//////// thread block structure // 112 bytes
// header (bytes 0-73)
// 1 byte title length // 74
// 2 byte original post length // 75 76
// 3 bytes reserved (new thread options) 77-79
// --
// n1 bytes title
// n2 bytes original post
// 32 bytes thread id 1
// 32 bytes latest post 1
// ...

//////// post block structure
// header (bytes 0-73)
// 2 bytes post length
// 32 bytes previous post (any thread) or thread block
// 5 bytes reserved
//

class Block {
  protected data: Uint8Array;

  constructor() { }

  protocolVersion(): Uint8Array {
    return this.data.subarray(0, 1);
  }

  blockType(): Uint8Array {
    return this.data.subarray(1, 2);
  }

  timestamp(): Uint8Array {
    return this.data.subarray(2, 6);
  }

  nonce(): Uint8Array {
    return this.data.subarray(6, 10);
  }

  prevHash(): Uint8Array {
    return this.data.subarray(10, 42);
  }

  dataHash(): Uint8Array {
    return this.data.subarray(42, 74);
  }
}

class ThreadBlock extends Block {
  static readonly BLOCK_TYPE: number = 0;
  constructor(_data: Uint8Array) {
    super();
    if (_data.byteLength != 80) { throw new TypeError('Length of buffer is incorrect.'); }
    
    this.data = _data;
  }

  titleLength(): Uint8Array {
    return this.data.subarray(74, 75);
  }

  postLength(): Uint8Array {
    return this.data.subarray(75, 77);
  }

  options(): Uint8Array {
    return this.data.subarray(77, 80);
  }
}
