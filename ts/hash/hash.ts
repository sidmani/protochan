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
  export let keccak = function(str,format, output) {
    var msg = str;
    if (format === 2) {
      msg = Helper.int32Buffer2Bytes(str);
    }
    if (output === 1) {
      return Keccak.digest(msg, 0, 1);
    } else if (output === 2) {
      return Helper.bytes2Int32Buffer(Keccak.digest(msg, 0, 0))
    } else {
      return Keccak.digest(msg, 0, 0);
    }
  }

  export namespace X11 {
    export function digest(str, format, output) {
      var a = blake(str,format,2);
      console.log("Blake: " + a);
      a = bmw(a,2,2);
      console.log("BMW: " + a);
      a = groestl(a,2,2);
      console.log("Groestl: " + a);
      a = skein(a,2,2);
      console.log("Skein: " + a);
      a = jh(a,2,2);
      console.log("JH: " + a);
      a = keccak(a,2,1);
      console.log("Keccak: " + a);
      a = luffa(a,1,2);
      console.log("Luffa: " + a);
      a = cubehash(a,2,2);
      console.log("Cubehash: " + a);
      a = shavite(a,2,2);
      console.log("Shavite: " + a);
      a = simd(a,2,2);
      console.log("SIMD: " + a);
      a = echo(a,2,2);
      console.log("Echo: " + a);
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
