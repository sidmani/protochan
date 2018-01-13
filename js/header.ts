/// <reference path="util.ts" />

class BlockHeader {
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

class ThreadBlockHeader extends BlockHeader {
  static readonly BLOCK_TYPE: number = 0x00000000;
  constructor(_data: Uint8Array) {
    super();
    if (_data.byteLength !== 80) {
      throw new TypeError('Length of buffer is incorrect.');
    }

    this.data = _data;

    if (Util.parseIntFromUint8Array(this.blockType()) !== ThreadBlockHeader.BLOCK_TYPE) {
      throw new TypeError('Header data represents incorrect block type.');
    }
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

class PostBlockHeader extends BlockHeader {
  static readonly BLOCK_TYPE: number = 0x00000001;
  constructor(_data: Uint8Array) {
    super();
    if (_data.byteLength !== 80) {
      throw new TypeError('Length of buffer is incorrect.');
    }

    this.data = _data;

    if (Util.parseIntFromUint8Array(this.blockType()) !== PostBlockHeader.BLOCK_TYPE) {
      throw new TypeError('Header data represents incorrect block type.');
    }
  }

  postLength(): Uint8Array {
    return this.data.subarray(74, 76);
  }

  options(): Uint8Array {
    return this.data.subarray(76, 80);
  }
}
