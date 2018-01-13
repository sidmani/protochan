namespace Util {
  export function parseIntFromUint8Array(arr: Uint8Array): number {
    if (arr.byteLength > 4) { throw new TypeError('Length of array would overflow a 32-bit integer.'); }
    let result = 0;
    for (let i = 0; i < arr.byteLength; i++) {
      result |= arr[i] << ((arr.byteLength - i - 1) * 8);
    }
    return result;
  }

  export function Uint8ArrayFromInt(val: number): Uint8Array {
    if (val >> 8 == 0) { // val fits in 1 byte
      return new Uint8Array([val]);
    } else if (val >> 16 == 0) { // fits in 2 bytes
      return new Uint8Array([
        (val >> 8)  & 0xff,
        (val)       & 0xff
      ]);
    } else if (val >> 24 == 0) { // fits in 3 bytes
      return new Uint8Array([
        (val >> 16) & 0xff,
        (val >> 8)  & 0xff,
        (val)       & 0xff
      ]);
    } else { // all 4 bytes
      return new Uint8Array([
        (val >> 24) & 0xff,
        (val >> 16) & 0xff,
        (val >> 8)  & 0xff,
        (val)       & 0xff
      ]);
    }
  }
}
