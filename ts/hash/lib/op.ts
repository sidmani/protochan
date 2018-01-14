//the right shift is important, it has to do with 32 bit operations in javascript, it will make things faster
namespace Op {
  export class u64 {
    hi: number;
    lo: number;

    constructor(h, l) {
      this.hi = h >>> 0;
      this.lo = l >>> 0;
    }

    set(oWord: u64): void {
      this.lo = oWord.lo;
      this.hi = oWord.hi;
    }

    add(oWord: u64): u64 {
      let lowest, lowMid, highMid, highest; //four parts of the whole 64 bit number..

      //need to add the respective parts from each number and the carry if on is present..
      lowest = (this.lo & 0XFFFF) + (oWord.lo & 0XFFFF);
      lowMid = (this.lo >>> 16) + (oWord.lo >>> 16) + (lowest >>> 16);
      highMid = (this.hi & 0XFFFF) + (oWord.hi & 0XFFFF) + (lowMid >>> 16);
      highest = (this.hi >>> 16) + (oWord.hi >>> 16) + (highMid >>> 16);

      //now set the hgih and the low accordingly..
      this.lo = (lowMid << 16) | (lowest & 0XFFFF);
      this.hi = (highest << 16) | (highMid & 0XFFFF);

      return this; //for chaining..
    }

    addOne() {
      if (this.lo === -1 || this.lo === 0xFFFFFFFF) {
        this.lo = 0;
        this.hi++;
      }
      else {
        this.lo++;
      }
    }

    plus(oWord: u64): u64 {
      var c = new u64(0, 0);
      var lowest, lowMid, highMid, highest; //four parts of the whole 64 bit number..

      //need to add the respective parts from each number and the carry if on is present..
      lowest = (this.lo & 0XFFFF) + (oWord.lo & 0XFFFF);
      lowMid = (this.lo >>> 16) + (oWord.lo >>> 16) + (lowest >>> 16);
      highMid = (this.hi & 0XFFFF) + (oWord.hi & 0XFFFF) + (lowMid >>> 16);
      highest = (this.hi >>> 16) + (oWord.hi >>> 16) + (highMid >>> 16);

      //now set the hgih and the low accordingly..
      c.lo = (lowMid << 16) | (lowest & 0XFFFF);
      c.hi = (highest << 16) | (highMid & 0XFFFF);

      return c; //for chaining..
    }

    not(): u64 {
      return new u64(~this.hi, ~this.lo);
    }

    one(): u64 {
      return new u64(0x0, 0x1);
    }

    zero(): u64 {
      return new u64(0x0, 0x0);
    }

    neg(): u64 {
      return this.not().plus(this.one());
    }

    minus(oWord): u64 {
      return this.plus(oWord.neg());
    }

    isZero() {
      return (this.lo === 0) && (this.hi === 0);
    }

    multiply(multiplier: u64): u64 {
      if (this.isZero())
        return this.zero();
      if (!isLong(multiplier))
        multiplier = fromNumber(multiplier);
      if (multiplier.isZero())
        return this.zero();

      // Divide each long into 4 chunks of 16 bits, and then add up 4x4 products.
      // We can skip products that would overflow.

      var a48 = this.hi >>> 16;
      var a32 = this.hi & 0xFFFF;
      var a16 = this.lo >>> 16;
      var a00 = this.lo & 0xFFFF;

      var b48 = multiplier.hi >>> 16;
      var b32 = multiplier.hi & 0xFFFF;
      var b16 = multiplier.lo >>> 16;
      var b00 = multiplier.lo & 0xFFFF;

      var c48 = 0,
        c32 = 0,
        c16 = 0,
        c00 = 0;
      c00 += a00 * b00;
      c16 += c00 >>> 16;
      c00 &= 0xFFFF;
      c16 += a16 * b00;
      c32 += c16 >>> 16;
      c16 &= 0xFFFF;
      c16 += a00 * b16;
      c32 += c16 >>> 16;
      c16 &= 0xFFFF;
      c32 += a32 * b00;
      c48 += c32 >>> 16;
      c32 &= 0xFFFF;
      c32 += a16 * b16;
      c48 += c32 >>> 16;
      c32 &= 0xFFFF;
      c32 += a00 * b32;
      c48 += c32 >>> 16;
      c32 &= 0xFFFF;
      c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
      c48 &= 0xFFFF;
      return new u64((c48 << 16) | c32, (c16 << 16) | c00);
    }

    shiftLeft(bits: number): u64 {
      bits = bits % 64;
      var c = new u64(0, 0);
      if (bits === 0) {
        return this.clone();
      }
      else if (bits > 31) {
        c.lo = 0;
        c.hi = this.lo << (bits - 32);
      }
      else {
        var toMoveUp = this.lo >>> 32 - bits;
        c.lo = this.lo << bits;
        c.hi = (this.hi << bits) | toMoveUp;
      }
      return c; //for chaining..
    }

    setShiftLeft(bits: number): u64 {
      if (bits === 0) {
        return this;
      }
      if (bits > 63) {
        bits = bits % 64;
      }

      if (bits > 31) {
        this.hi = this.lo << (bits - 32);
        this.lo = 0;
      }
      else {
        var toMoveUp = this.lo >>> 32 - bits;
        this.lo <<= bits;
        this.hi = (this.hi << bits) | toMoveUp;
      }
      return this; //for chaining..
    }

    shiftRight(bits: number): u64 {
      bits = bits % 64;
      var c = new u64(0, 0);
      if (bits === 0) {
        return this.clone();
      }
      else if (bits >= 32) {
        c.hi = 0;
        c.lo = this.hi >>> (bits - 32);
      }
      else {
        var bitsOff32 = 32 - bits,
          toMoveDown = this.hi << bitsOff32 >>> bitsOff32;
        c.hi = this.hi >>> bits;
        c.lo = this.lo >>> bits | (toMoveDown << bitsOff32);
      }
      return c; //for chaining..
    }

    rotateLeft(bits: number): u64 {
      if (bits > 32) {
        return this.rotateRight(64 - bits);
      }
      var c = new u64(0, 0);
      if (bits === 0) {
        c.lo = this.lo >>> 0;
        c.hi = this.hi >>> 0;
      }
      else if (bits === 32) { //just switch high and low over in this case..
        c.lo = this.hi;
        c.hi = this.lo;
      }
      else {
        c.lo = (this.lo << bits) | (this.hi >>> (32 - bits));
        c.hi = (this.hi << bits) | (this.lo >>> (32 - bits));
      }
      return c; //for chaining..
    }

    setRotateLeft(bits: number): u64 {
      if (bits > 32) {
        return this.setRotateRight(64 - bits);
      }
      var newHigh;
      if (bits === 0) {
        return this;
      }
      else if (bits === 32) { //just switch high and low over in this case..
        newHigh = this.lo;
        this.lo = this.hi;
        this.hi = newHigh;
      }
      else {
        newHigh = (this.hi << bits) | (this.lo >>> (32 - bits));
        this.lo = (this.lo << bits) | (this.hi >>> (32 - bits));
        this.hi = newHigh;
      }
      return this; //for chaining..
    }

    rotateRight(bits: number): u64 {
      if (bits > 32) {
        return this.rotateLeft(64 - bits);
      }
      var c = new u64(0, 0);
      if (bits === 0) {
        c.lo = this.lo >>> 0;
        c.hi = this.hi >>> 0;
      }
      else if (bits === 32) { //just switch high and low over in this case..
        c.lo = this.hi;
        c.hi = this.lo;
      }
      else {
        c.lo = (this.hi << (32 - bits)) | (this.lo >>> bits);
        c.hi = (this.lo << (32 - bits)) | (this.hi >>> bits);
      }
      return c; //for chaining..
    }

    setFlip(): u64 {
      var newHigh;
      newHigh = this.lo;
      this.lo = this.hi;
      this.hi = newHigh;
      return this;
    }

    setRotateRight(bits: number): u64 {
      if (bits > 32) {
        return this.setRotateLeft(64 - bits);
      }

      if (bits === 0) {
        return this;
      }
      else if (bits === 32) { //just switch high and low over in this case..
        var newHigh;
        newHigh = this.lo;
        this.lo = this.hi;
        this.hi = newHigh;
      }
      else {
        newHigh = (this.lo << (32 - bits)) | (this.hi >>> bits);
        this.lo = (this.hi << (32 - bits)) | (this.lo >>> bits);
        this.hi = newHigh;
      }
      return this; //for chaining..
    }

    xor(oWord: u64): u64 {
      var c = new u64(0, 0);
      c.hi = this.hi ^ oWord.hi;
      c.lo = this.lo ^ oWord.lo;
      return c; //for chaining..
    }

    setxorOne(oWord: u64): u64 {
      this.hi ^= oWord.hi;
      this.lo ^= oWord.lo;
      return this; //for chaining..
    }

    and(oWord: u64): u64 {
      var c = new u64(0, 0);
      c.hi = this.hi & oWord.hi;
      c.lo = this.lo & oWord.lo;
      return c; //for chaining..
    }

    clone(): u64 {
      return new u64(this.hi, this.lo);
    }

    setxor64(): u64 {
      var a = arguments;
      var i = a.length;
      while (i--) {
        this.hi ^= a[i].hi;
        this.lo ^= a[i].lo;
      }
      return this;
    }
  }

  function isLong(obj) {
    return (obj && obj["__isLong__"]) === true;
  }

  function fromNumber(value) {
    if (isNaN(value) || !isFinite(value))
      return this.zero();
    var pow32 = (1 << 32);
    return new u64((value % pow32) | 0, (value / pow32) | 0);
  }

  export function u(h: number, l: number): u64 {
    return new u64(h, l);
  }

  export function xor64(...args: u64[]): u64 {
    var a = args,
      h = a[0].hi,
      l = a[0].lo;
        var i = a.length-1;
    do {
      h ^= a[i].hi;
      l ^= a[i].lo;
      i--;
    } while (i>0);
    return new u64(h, l);
  }

  export function clone64Array(array) {
    var i = 0;
    var len = array.length;
    var a = new Array(len);
    while(i<len) {
      a[i] = array[i];
      i++;
    }
    return a;
  }

  //this shouldn't be a problem, but who knows in the future javascript might support 64bits
  export function t32(x: number): number {
    return (x & 0xFFFFFFFF)
  }

  export function rotl32(x: number, c: number): number {
    return (((x) << (c)) | ((x) >>> (32 - (c)))) & (0xFFFFFFFF);
  }

  export function rotr32(x: number, c: number): number {
    return this.rotl32(x, (32 - (c)));
  }

  export function swap32(val: number): number {
    return ((val & 0xFF) << 24) |
      ((val & 0xFF00) << 8) |
      ((val >>> 8) & 0xFF00) |
      ((val >>> 24) & 0xFF);
  }

  export function swap32Array(a) {
    //can't do this with map because of support for IE8 (Don't hate me plz).
    var i = 0, len = a.length;
    var r = new Array(i);
    while (i<len) {
      r[i] = (this.swap32(a[i]));
      i++;
    }
    return r;
  }

  export function xnd64(x: u64, y: u64, z: u64): u64 {
    return new u64(x.hi ^ ((~y.hi) & z.hi), x.lo ^ ((~y.lo) & z.lo));
  }

  export function bufferInsert(buffer, bufferOffset: number, data, len: number, dataOffset?: number): void {
    dataOffset = dataOffset | 0;
    var i = 0;
    while (i < len) {
      buffer[i + bufferOffset] = data[i + dataOffset];
      i++;
    }
  }

  export function buffer2Insert(buffer, bufferOffset, bufferOffset2, data, len, len2) {
    while (len--) {
      var j = len2;
      while (j--) {
        buffer[len + bufferOffset][j + bufferOffset2] = data[len][j];
      }
    }
  }

  export function bufferInsert64(buffer, bufferOffset, data, len: number): void {
    var i = 0;
    while (i < len) {
      buffer[i + bufferOffset] = data[i].clone();
      i++;
    }
  }

  export function bufferInsertBackwards(buffer, bufferOffset: number, data, len: number): void {
    var i = 0;
    while (i < len) {
      buffer[i + bufferOffset] = data[len - 1 - i];
      i++;
    }
  }

  export function bufferSet(buffer, bufferOffset, value, len) {
    var i = 0;
    while (i < len) {
      buffer[i + bufferOffset] = value;
      i++;
    }
  }

  export function bufferXORInsert(buffer, bufferOffset, data, dataOffset, len) {
    var i = 0;
    while (i < len) {
      buffer[i + bufferOffset] ^= data[i + dataOffset];
      i++;
    }
  }

  export function xORTable(d, s1, s2, len) {
    var i = 0;
    while (i < len) {
      d[i] = s1[i] ^ s2[i];
      i++
    }
  }
}
