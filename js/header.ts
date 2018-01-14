/// <reference path="util.ts" />
namespace Block {
  export enum Type {
    Thread  = 0,
    Post    = 1
  }

  export class Header {
    private data: Uint8Array;

    constructor(_data: Uint8Array) {
      if (_data.byteLength !== 80) {
        throw new TypeError('Length of buffer is incorrect.');
      }

      this.data = _data;

      if (this.blockType() === undefined) { // validation should be moved somewhere else
        throw new TypeError('Unknown block type.');
      }
    }

    /// Protocol version
    protocolVersion_raw(): Uint8Array {
      return this.data.subarray(0, 1);
    }

    protocolVersion(): number {
      return Util.parseIntFromUint8Array(this.protocolVersion_raw());
    }

    /// Block type
    blockType_raw(): Uint8Array {
      return this.data.subarray(1, 2);
    }

    blockType(): Type {
      return Util.parseIntFromUint8Array(this.blockType_raw());
    }

    // Unix timestamp
    timestamp_raw(): Uint8Array {
      return this.data.subarray(2, 6);
    }

    timestamp(): number {
      return Util.parseIntFromUint8Array(this.timestamp_raw());
    }

    // nonce
    nonce_raw(): Uint8Array {
      return this.data.subarray(6, 10);
    }

    nonce(): number {
      return Util.parseIntFromUint8Array(this.nonce_raw());
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
  }
}
