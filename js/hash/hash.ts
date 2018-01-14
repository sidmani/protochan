/// <reference path="lib/blake.ts" />
/// <reference path="lib/keccak.ts" />
/// <reference path="lib/skein.ts" />
/// <reference path="lib/luffa.ts" />
/// <reference path="lib/simd.ts" />
/// <reference path="lib/shavite.ts" />
/// <reference path="lib/cubehash.ts" />
/// <reference path="lib/jh.ts" />
/// <reference path="lib/echo.ts" />
/// <reference path="lib/groestl.ts" />
/// <reference path="lib/bmw.ts" />
/// <reference path="lib/helper.ts" />

namespace Hash {
  export let blake = Blake.digest;
  export let bmw = BMW.digest;
  export let cubehash = Cubehash.digest;
  export let echo = Echo.digest;
  export let groestl = Groestl.digest;
  export let jh = JH.digest;
  export let luffa = Luffa.digest;
  export let skein = Skein.digest;
  export let shavite = Shavite.digest;
  export let simd = SIMD.digest;

  export function keccak(str,format, output) {
    var msg = str;
    if (format === 2) {
      msg = Helper.int32Buffer2Bytes(str);
    }
    if (output === 1) {
      return keccak['array'](msg);
    } else if (output === 2) {
      return Helper.bytes2Int32Buffer(keccak['array'](msg));
    } else {
      return keccak['hex'](msg);
    }
  }

  export namespace X11 {
    export function digest(str, format, output) {
      var a = blake(str,format,2);
      a = bmw(a,2,2);
      a = groestl(a,2,2);
      a = skein(a,2,2);
      a = jh(a,2,2);
      a = this.keccak(a,2,1);
      a = luffa(a,1,2);
      a = cubehash(a,2,2);
      a = shavite(a,2,2);
      a = simd(a,2,2);
      a = echo(a,2,2);
      a = a.slice(0,8);
      if (output === 2) {
        return a;
      }
      else if (output === 1) {
        return Helper.int32Buffer2Bytes(a);
      }
      else {
        return Helper.int32ArrayToHexString(a);
      }
    }
  }
}
