module.exports = class Header {
  constructor(data) {
    if (data.byteLength !== 80) {
      throw new TypeError('Length of buffer is incorrect.');
    }

    this.data = data;

    if (this.blockType() === undefined) { // validation should be moved somewhere else
      throw new TypeError('Unknown block type.');
    }
  }

  /// Protocol version
  protocolVersion_raw() {
    return this.data.subarray(0, 1);
  }

  /// Block type
  blockType_raw(): Uint8Array {
    return this.data.subarray(1, 2);
  }

  // Unix timestamp
  timestamp_raw(): Uint8Array {
    return this.data.subarray(2, 6);
  }

  // nonce
  nonce_raw(): Uint8Array {
    return this.data.subarray(6, 10);
  }

  prevHash(): Uint8Array {
    return this.data.subarray(10, 42);
  }

  dataHash(): Uint8Array {
    return this.data.subarray(42, 74);
  }

  reserved(): Uint8Array {
    return this.data.subarray(75, 80);
  }
};
