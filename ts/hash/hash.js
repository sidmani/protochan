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
var Hash;
(function (Hash) {
    Hash.blake = Blake.digest;
    Hash.bmw = BMW.digest;
    Hash.cubehash = Cubehash.digest;
    Hash.echo = Echo.digest;
    Hash.groestl = Groestl.digest;
    Hash.jh = JH.digest;
    Hash.luffa = Luffa.digest;
    Hash.skein = Skein.digest;
    Hash.shavite = Shavite.digest;
    Hash.simd = SIMD.digest;
    Hash.keccak = Keccak.digest;
    var X11;
    (function (X11) {
        function digest(str, format, output) {
            var a = Hash.blake(str, format, 2);
            a = Hash.bmw(a, 2, 2);
            a = Hash.groestl(a, 2, 2);
            a = Hash.skein(a, 2, 2);
            a = Hash.jh(a, 2, 2);
            a = Hash.keccak(a, 2, 2);
            a = Hash.luffa(a, 2, 2);
            a = Hash.cubehash(a, 2, 2);
            a = Hash.shavite(a, 2, 2);
            a = Hash.simd(a, 2, 2);
            a = Hash.echo(a, 2, 2);
            a = a.slice(0, 8);
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
        X11.digest = digest;
    })(X11 = Hash.X11 || (Hash.X11 = {}));
})(Hash || (Hash = {}));
