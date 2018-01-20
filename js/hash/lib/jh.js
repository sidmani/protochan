// This file is a part of the protochan project.
// https://github.com/sidmani/protochan
// https://www.sidmani.com/?postid=3

// Copyright (c) 2016 Quantum Explorer
// Modifications (c) 2018 Sid Mani
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

var op = require('./op');
var he = require('./helper');

var Jh_BlockSize = 64;
var Jh_StateSize = 32;

var JH_HX = 8;
var JH_HY = 4;

var IV512 = he.bytes2Int32Buffer(he.b64Decode("b9FLlj4Aqhdjai4FehXVQ4oiXo0Ml+8L6TQSWfKzw2GJHaDBU2+AHiqpBWvqK22AWI7M2yB1uqapDzp2uvg79wFp5gVB40ppRrWKji5v5loQR6fQwYQ8JDtucbEtWsGZz1f27J2x+FanBoh8VxaxVuPC/N/mhRf7VFpGeMyM3Us="));

var C = he.bytes2Int32Buffer(he.b64Decode("ot7Vcmf4Fd8KFYR7VxUjt5DWq4H2h1pNxU+fTkAr0cPgOpjqnPpFXJnSxQOambJmtJYCZopTu/IaFFa1MaLbiFxaowPbDhmaCrI/QBBEwYeAGQUcHZWehK3rM2/czedekhO6EEFrvwIVZXjc0Ce79zmBLApQeKo30r8aP9ORAEENWi1CkH7M9pyfYt3Ol8CSC6dcGKxEK8fWZd/RI/zGYwNsbpcauOCefkUFIajsbES7A/Hu+mGOXbKXlv2XgYOUN4WOSi8wA9stjWcqlWqf+4Fz/opsabj4RnLHihRCf8CPFfTFxF7HvadvRHWAuxGPt3XeUryI5K4eALiC9KOmmDOP9I4VY6OpJFZfqon5t9Ug7fG2/eBafFrpyjY2LEIGQzUpzj2Y/k50+TpTp0uac1kf9dCGgU5vga2dDp9a2K9nBgWnamI07r4oC4snF7luJgd0Rz8QgMZvfqDge0h+xqUKVQ3ApPhKn+fjkZ7xjpeBcnaG1I1gUEFann5isOXz7B+f/HogVEAAGuTjhMn0zvWU10/YlfqdEX4uVaVUwyQoct9bKG7+veJ/9XiyxKUP73yJBS7TSe6Fk35Ef1ko6zdpX3BKMSSz8SiGXmXk1h0EdxvH5yC5UehD/nSKh9Qjo+gpffKUdpIJesvdwdkwm/swGx3gG9xbT0kk2r+CnPIxuuek/79wtAVEMg1IvPjeMvyuOznTu1PBw59FoIsp4P0FyeUPCa73EjRwlDTxkEIBt3Gile1E4zaOO+lKmC9PYx1AiBX2bKBLRMFH/69Sh/FKu34wxgrixbZwRuaMbsxWpNWkAMpPvUuEndquGD7IRc5Xc63RZDBozqboZyVcFPKM2qMW4Q7LWAbpM5qZlJogsmAfe4Rvwn+sztEYhdGgoVtZMtMZ3Y3AHJpQRrSlqmdjPZ+6awTkqxnK9n7uVgvqebEfdCEoqTX3venuUTY7WqxXHXbTUHX+wkY6AXB9o6/BNfdC2KSYIOzteHlna54VY4NBqNs66k07w/qDLIMyHztAp/NHJxw08EBZmnYtt2xOPuf9TyHSOY39uO9ZV9xJDJuN2utJK0nXolsNcPNo0K47fYRVjXrw6aX1ZY745PSiuKBTOxA2ngeoDFrsPnWSlGiRT4joVlVcsFtMvLr4mTu743uUh/PW9Np1XRxrciisrmRtszTcUKU0bHHbKLjy4mH4KlGNEDNk2+P8dd1Z8bysHKI/zkM80btnsEPoAspbCjN1oSmITRk0f1xTFrTDlDuSHk15Dtd1dHk/r+6299So6iE5Gr4JfvRcUScjTFMkoybSPDK6ShejRK3Vpm2mPh21CMnyr5g9WYNWPGuRoXz4TE1ghnLMPuJG9sduCLMzmC9edryxpWbWKyrmxO/otvQGNtTBvhWC7nRjIe+8DU7B/WnJU/TEWn2nJlhYBhYUwX4W+uAGPa+Qfj+dYyjj8snSDNKbADDOql8wDNS3FlEqdJgy4PLYMOsNmvjO43uexUuSefG1buZR/9NohgRXTSObMWeW5vOm5swFdQoX2YF2sc5sMhOEUhc8YqIF+LPLK/RHFUd4glRG/0hqkyMHWN84ZWVeTol8/PKOUIb8RC5wMYbKC9CiCUDwTkd4MDnuoGWDOPfRN+le9706LOQmspchb/gTAdHtRKPn3p/vFd+gi9mSJXb294U8vkLcEnzsp9h+sCer2n2NU96oPqqTziWq2GkCvf1D9lr5CHMa2u9fwKUZShczZk2XaiH9TDGYtDVwFUHbuw8e6ptUze2hY9CackCXUb+ddfbib0eR"));

var Sb = function(x, c) {
  x[3] = ~x[3];
  x[0] ^= (c) & ~x[2];
  var tmp = (c) ^ (x[0] & x[1]);
  x[0] ^= x[2] & x[3];
  x[3] ^= ~x[1] & x[2];
  x[1] ^= x[0] & x[2];
  x[2] ^= x[0] & ~x[3];
  x[0] ^= x[1] | x[3];
  x[3] ^= x[1] & x[2];
  x[1] ^= tmp & x[0];
  x[2] ^= tmp;
  return x;
}

var Lb = function(x) {
  x[4] ^= x[1];
  x[5] ^= x[2];
  x[6] ^= x[3] ^ x[0];
  x[7] ^= x[0];
  x[0] ^= x[5];
  x[1] ^= x[6];
  x[2] ^= x[7] ^ x[4];
  x[3] ^= x[4];
  return x;
}

var Ceven = function(n, r) {
  return C[((r) << 3) + 3 - n];
}

var Codd = function(n, r) {
  return C[((r) << 3) + 7 - n];
}

var S = function(x0, x1, x2, x3, cb, r) {
  var x = Sb([x0[3], x1[3], x2[3], x3[3]], cb(3, r));
  x0[3] = x[0];
  x1[3] = x[1];
  x2[3] = x[2];
  x3[3] = x[3];
  x = Sb([x0[2], x1[2], x2[2], x3[2]], cb(2, r));
  x0[2] = x[0];
  x1[2] = x[1];
  x2[2] = x[2];
  x3[2] = x[3];
  x = Sb([x0[1], x1[1], x2[1], x3[1]], cb(1, r));
  x0[1] = x[0];
  x1[1] = x[1];
  x2[1] = x[2];
  x3[1] = x[3];
  x = Sb([x0[0], x1[0], x2[0], x3[0]], cb(0, r));
  x0[0] = x[0];
  x1[0] = x[1];
  x2[0] = x[2];
  x3[0] = x[3];
}

var L = function(x0, x1, x2, x3, x4, x5, x6, x7) {
  var x = Lb([x0[3], x1[3], x2[3], x3[3], x4[3], x5[3], x6[3], x7[3]]);
  x0[3] = x[0];
  x1[3] = x[1];
  x2[3] = x[2];
  x3[3] = x[3];
  x4[3] = x[4];
  x5[3] = x[5];
  x6[3] = x[6];
  x7[3] = x[7];
  x = Lb([x0[2], x1[2], x2[2], x3[2], x4[2], x5[2], x6[2], x7[2]]);
  x0[2] = x[0];
  x1[2] = x[1];
  x2[2] = x[2];
  x3[2] = x[3];
  x4[2] = x[4];
  x5[2] = x[5];
  x6[2] = x[6];
  x7[2] = x[7];
  x = Lb([x0[1], x1[1], x2[1], x3[1], x4[1], x5[1], x6[1], x7[1]]);
  x0[1] = x[0];
  x1[1] = x[1];
  x2[1] = x[2];
  x3[1] = x[3];
  x4[1] = x[4];
  x5[1] = x[5];
  x6[1] = x[6];
  x7[1] = x[7];
  x = Lb([x0[0], x1[0], x2[0], x3[0], x4[0], x5[0], x6[0], x7[0]]);
  x0[0] = x[0];
  x1[0] = x[1];
  x2[0] = x[2];
  x3[0] = x[3];
  x4[0] = x[4];
  x5[0] = x[5];
  x6[0] = x[6];
  x7[0] = x[7];
}

var Wz = function(x, c, n) {
  var t = (x[3] & (c)) << (n);
  x[3] = ((x[3] >> (n)) & (c)) | t;
  t = (x[2] & (c)) << (n);
  x[2] = ((x[2] >> (n)) & (c)) | t;
  t = (x[1] & (c)) << (n);
  x[1] = ((x[1] >> (n)) & (c)) | t;
  t = (x[0] & (c)) << (n);
  x[0] = ((x[0] >> (n)) & (c)) | t;
}

var W = function(ro, x) {
  switch (ro) {
    case 0:
      return Wz(x, (0x55555555), 1);
    case 1:
      return Wz(x, (0x33333333), 2);
    case 2:
      return Wz(x, (0x0F0F0F0F), 4);
    case 3:
      return Wz(x, (0x00FF00FF), 8);
    case 4:
      return Wz(x, (0x0000FFFF), 16);
    case 5:
      {
        var t = x[3];
        x[3] = x[2];
        x[2] = t;
        t = x[1];
        x[1] = x[0];
        x[0] = t;
        return;
      }
    case 6:
      {
        var t = x[3];
        x[3] = x[1];
        x[1] = t;
        t = x[2];
        x[2] = x[0];
        x[0] = t;
        return;
      }
  }
}

var SL = function(h, r, ro) {
  S(h[0], h[2], h[4], h[6], Ceven, r);
  S(h[1], h[3], h[5], h[7], Codd, r);
  L(h[0], h[2], h[4], h[6], h[1], h[3], h[5], h[7]);
  W(ro, h[1]);
  W(ro, h[3]);
  W(ro, h[5]);
  W(ro, h[7]);
}

var READ_STATE = function(h, state) {
  h[0][3] = state[0];
  h[0][2] = state[1];
  h[0][1] = state[2];
  h[0][0] = state[3];
  h[1][3] = state[4];
  h[1][2] = state[5];
  h[1][1] = state[6];
  h[1][0] = state[7];
  h[2][3] = state[8];
  h[2][2] = state[9];
  h[2][1] = state[10];
  h[2][0] = state[11];
  h[3][3] = state[12];
  h[3][2] = state[13];
  h[3][1] = state[14];
  h[3][0] = state[15];
  h[4][3] = state[16];
  h[4][2] = state[17];
  h[4][1] = state[18];
  h[4][0] = state[19];
  h[5][3] = state[20];
  h[5][2] = state[21];
  h[5][1] = state[22];
  h[5][0] = state[23];
  h[6][3] = state[24];
  h[6][2] = state[25];
  h[6][1] = state[26];
  h[6][0] = state[27];
  h[7][3] = state[28];
  h[7][2] = state[29];
  h[7][1] = state[30];
  h[7][0] = state[31];
}

var WRITE_STATE = function(h, state) {
  state[0] = h[0][3];
  state[1] = h[0][2];
  state[2] = h[0][1];
  state[3] = h[0][0];
  state[4] = h[1][3];
  state[5] = h[1][2];
  state[6] = h[1][1];
  state[7] = h[1][0];
  state[8] = h[2][3];
  state[9] = h[2][2];
  state[10] = h[2][1];
  state[11] = h[2][0];
  state[12] = h[3][3];
  state[13] = h[3][2];
  state[14] = h[3][1];
  state[15] = h[3][0];
  state[16] = h[4][3];
  state[17] = h[4][2];
  state[18] = h[4][1];
  state[19] = h[4][0];
  state[20] = h[5][3];
  state[21] = h[5][2];
  state[22] = h[5][1];
  state[23] = h[5][0];
  state[24] = h[6][3];
  state[25] = h[6][2];
  state[26] = h[6][1];
  state[27] = h[6][0];
  state[28] = h[7][3];
  state[29] = h[7][2];
  state[30] = h[7][1];
  state[31] = h[7][0];
}

var E8 = function(h) {
  for (var r = 0; r < 42; r += 7) {
    SL(h, r + 0, 0);
    SL(h, r + 1, 1);
    SL(h, r + 2, 2);
    SL(h, r + 3, 3);
    SL(h, r + 4, 4);
    SL(h, r + 5, 5);
    SL(h, r + 6, 6);
  }
}

var bufferXORInsertBackwards = function(buffer, data, x, y, bufferOffsetX, bufferOffsetY) {
  if (!bufferOffsetX) bufferOffsetX = 0;
  if (!bufferOffsetY) bufferOffsetY = 0;
  for (var i = 0; i < x; i++) {
    for (var j = 0; j < x; j++) {
      var m = i + bufferOffsetX;
      var n = bufferOffsetY + y - 1 - j;
      var xOr = buffer[m][n] ^ data[i * 4 + j];
      buffer[m][n] = xOr;
    }
  }
}

var jh = function(ctx, data, len) {
  var buf, ptr;
  //create a local copy of states
  buf = ctx.buffer;
  ptr = ctx.ptr;
  if (!len) len = data.length;
  if (len < ctx.buffer.length - ptr) {
    op.bufferInsert(buf, ptr, data, data.length);
    ptr += data.length;
    ctx.ptr = ptr;
    return;
  }
  var V = new Array(JH_HX);
  for (var i = 0; i < JH_HX; i++) {
    V[i] = new Array(JH_HY);
  }
  READ_STATE(V, ctx.state);
  while (len > 0) {
    var clen = ctx.buffer.length - ptr;
    if (clen > len) clen = len;
    op.bufferInsert(buf, ptr, data, clen);
    ptr += clen;
    data = data.slice(clen);
    len -= clen;
    if (ptr === ctx.buffer.length) {
      var int32Buf = op.swap32Array(he.bytes2Int32Buffer(buf));

      bufferXORInsertBackwards(V, int32Buf, 4, 4);
      E8(V);
      bufferXORInsertBackwards(V, int32Buf, 4, 4, 4, 0);
      if ((ctx.blockCountLow = op.t32(ctx.blockCountLow + 1)) == 0)
        ctx.blockCountHigh++;
      ptr = 0;
    }
  }
  WRITE_STATE(V, ctx.state);
  ctx.ptr = ptr;
}

var jhClose = function(ctx) {
  var z;
  var buf = new Array(128);
  var numz, u;
  var l = new Array(4);
  buf[0] = 0x80;
  if (ctx.ptr == 0) {
    numz = 47;
  }
  else {
    numz = 111 - ctx.ptr;
  }
  op.bufferSet(buf, 1, 0, numz);
  l[0] = op.t32(ctx.blockCountLow << 9) + (ctx.ptr << 3);
  l[1] = op.t32(ctx.blockCountLow >> 23) + op.t32(ctx.blockCountHigh << 9);
  l[2] = op.t32(ctx.blockCountHigh >> 23);
  l[3] = 0;
  var lBytes = he.int32Buffer2Bytes(op.swap32Array(l));
  op.bufferInsertBackwards(buf, 1 + numz, lBytes, 16);
  jh(ctx, buf, numz + 17);
  var out = new Array(16);
  for (u = 0; u < 16; u++)
    out[u] = op.swap32(ctx.state[u + 16]);
  return out;
}

module.exports = function(input) {
  var ctx = {};
  ctx.state = op.swap32Array(IV512);
  ctx.ptr = 0;
  ctx.buffer = new Array(Jh_BlockSize);
  ctx.blockCountHigh = 0;
  ctx.blockCountLow = 0;
  jh(ctx, input);
  var r = jhClose(ctx);
  return he.int32Buffer2Bytes(r)
}
