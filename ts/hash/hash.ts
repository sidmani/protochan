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
  export let keccak = Keccak.digest;

  export namespace X8X {
    export let fMap = {
      0x0: blake,
      0x1: bmw,
      0x2: cubehash,
      0x3: echo,
      0x4: groestl,
      0x5: jh,
      0x6: luffa,
      0x7: skein,
      0x8: shavite,
      0x9: simd,
      0xA: keccak
    }

    export function x11(str, format, output) {
      var a = blake(str,format,1);
      a = bmw(a,1,1);
      a = groestl(a,1,1);
      a = skein(a,1,2);
      a = jh(a,2,2);
      a = keccak(a,2,1);
      a = luffa(a,2,2);
      a = cubehash(a,2,2);
      a = shavite(a,2,1);
      a = simd(a,1,1);
      a = echo(a,1,2);
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

    export function digest(str, format, output) {

    }
  }
}
