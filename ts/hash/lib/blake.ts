/////////////////////////////////////
///////////////  Blake //////////////

//// Written by Quantum Explorer ////
////////// Dash Foundation //////////
/// Released under the MIT License //
/////////////////////////////////////

/// <reference path="helper.ts" />
/// <reference path="op.ts" />

namespace Blake {
  let CB = Helper.bytes2Int64Buffer(Helper.b64Decode("JD9qiIWjCNMTGYouA3BzRKQJOCIpnzHQCC76mOxObIlFKCHmONATd75UZs806QxswKwpt8l8UN0/hNW1tUcJF5IW1dmJefsb0TELppjftawv/XLb0Brft7jhr+1qJn6WunyQRfEsf5kkoZlHs5Fs9wgB8uKFjvwWY2kg2HFXTmk="));

  let Z: number[][] = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    [14, 10, 4, 8, 9, 15, 13, 6, 1, 12, 0, 2, 11, 7, 5, 3],
    [11, 8, 12, 0, 5, 2, 15, 13, 10, 14, 3, 6, 7, 1, 9, 4],
    [7, 9, 3, 1, 13, 12, 11, 14, 2, 6, 5, 10, 4, 0, 15, 8],
    [9, 0, 5, 7, 2, 4, 10, 15, 14, 1, 11, 12, 6, 8, 3, 13],
    [2, 12, 6, 10, 0, 11, 8, 3, 4, 13, 7, 5, 15, 14, 1, 9],
    [12, 5, 1, 15, 14, 13, 4, 10, 0, 7, 6, 3, 9, 2, 8, 11],
    [13, 11, 7, 14, 12, 1, 3, 9, 5, 0, 15, 4, 8, 6, 2, 10],
    [6, 15, 14, 9, 11, 3, 0, 8, 12, 2, 13, 7, 1, 4, 10, 5],
    [10, 2, 8, 4, 7, 6, 1, 5, 15, 11, 9, 14, 3, 12, 13, 0]
  ];

  let initialValues: Op.u64[] = [
    Op.u(0x6a09e667, 0xf3bcc908),
    Op.u(0xbb67ae85, 0x84caa73b),
    Op.u(0x3c6ef372, 0xfe94f82b),
    Op.u(0xa54ff53a, 0x5f1d36f1),
    Op.u(0x510e527f, 0xade682d1),
    Op.u(0x9b05688c, 0x2b3e6c1f),
    Op.u(0x1f83d9ab, 0xfb41bd6b),
    Op.u(0x5be0cd19, 0x137e2179)
  ];

  function GB(m0: Op.u64, m1: Op.u64, c0: Op.u64, c1: Op.u64, a: Op.u64, b: Op.u64, c: Op.u64, d: Op.u64): void {
    a.add(m0.xor(c1).add(b));
    d.setxorOne(a).setFlip();
    c.add(d);
    b.setxorOne(c).setRotateRight(25);
    a.add(m1.xor(c0).add(b));
    d.setxorOne(a).setRotateRight(16);
    c.add(d);
    b.setxorOne(c).setRotateRight(11);
  }

  function round(r, V, M) {
    GB(M[Z[r][0]], M[Z[r][1]], CB[Z[r][0]], CB[Z[r][1]], V[0], V[4], V[8], V[0xC]);
    GB(M[Z[r][2]], M[Z[r][3]], CB[Z[r][2]], CB[Z[r][3]], V[1], V[5], V[9], V[0xD]);
    GB(M[Z[r][4]], M[Z[r][5]], CB[Z[r][4]], CB[Z[r][5]], V[2], V[6], V[0xA], V[0xE]);
    GB(M[Z[r][6]], M[Z[r][7]], CB[Z[r][6]], CB[Z[r][7]], V[3], V[7], V[0xB], V[0xF]);
    GB(M[Z[r][8]], M[Z[r][9]], CB[Z[r][8]], CB[Z[r][9]], V[0], V[5], V[0xA], V[0xF]);
    GB(M[Z[r][10]], M[Z[r][11]], CB[Z[r][10]], CB[Z[r][11]], V[1], V[6], V[0xB], V[0xC]);
    GB(M[Z[r][12]], M[Z[r][13]], CB[Z[r][12]], CB[Z[r][13]], V[2], V[7], V[8], V[0xD]);
    GB(M[Z[r][14]], M[Z[r][15]], CB[Z[r][14]], CB[Z[r][15]], V[3], V[4], V[9], V[0xE]);
  }

  function compress(M, H, S, T0, T1) {
    var V = new Array(16);
    Op.bufferInsert64(V, 0, H, 8);
    V[8] = S[0].xor(CB[0]);
    V[9] = S[1].xor(CB[1]);
    V[10] = S[2].xor(CB[2]);
    V[11] = S[3].xor(CB[3]);
    V[12] = T0.xor(CB[4]);
    V[13] = T0.xor(CB[5]);
    V[14] = T1.xor(CB[6]);
    V[15] = T1.xor(CB[7]);
    for (var i = 0; i < 16; i++) {
      round(i % 10, V, M);
    }
    for (var i = 0; i < 8; i++) {
      H[i] = Op.xor64(H[i], S[i % 4], V[i], V[8 + i]);
    }
  }

  function blake(ctx, data, len) {
    var buf, ptr;
    //create a local copy of states
    var H = new Array(8);
    var S = new Array(4);
    var T0 = ctx.T0.clone();
    var T1 = ctx.T1.clone();
    buf = ctx.buffer;
    ptr = ctx.ptr;
    if (len < ctx.buffer.length - ptr) {
      Op.bufferInsert(buf, ptr, data, data.length);
      ptr += data.length;
      ctx.ptr = ptr;
      return;
    }
    //perform a deep copy of current state
    Op.bufferInsert(H, 0, ctx.state, 8);
    Op.bufferInsert(S, 0, ctx.salt, 4);
    while (len > 0) {
      var clen = ctx.buffer.length - ptr;
      if (clen > len) clen = len;
      Op.bufferInsert(buf, ptr, data, clen);
      ptr += clen;
      data = data.slice(clen);
      len -= clen;
      if (ptr === ctx.buffer.length) {
        T0.add(Op.u(0, 1024));
        if (T0.hi < 0 || T0.lo < 1024)
          T1.addOne();
        var int64Buf = Helper.bytes2Int64Buffer(buf);
        compress(int64Buf, H, S, T0, T1);
        ptr = 0;
      }
    }
    ctx.state = H;
    ctx.salt = S;
    ctx.T0 = T0;
    ctx.T1 = T1;
    ctx.ptr = ptr;
  }

  function blakeClose(ctx) {
    var buf = new Array(128);
    var ptr = ctx.ptr;
    var bitLen = (Op.u(0, ptr)).shiftLeft(3);
    var len = buf.length;
    var padLen;
    var count;
    var tl = ctx.T0.plus(bitLen);
    var th = ctx.T1.clone();
    buf[ptr] = 0x80;
    if (ptr === 0) {
      ctx.T0 = Op.u(0xFFFFFFFF, 0xFFFFFC00);
      ctx.T1 = Op.u(0xFFFFFFFF, 0xFFFFFFFF);
    }
    else if (ctx.T0.isZero()) {
      ctx.T0 = Op.u(0xFFFFFFFF, 0xFFFFFC00).plus(bitLen);
      ctx.T1 = ctx.T1.minus(Op.u(0, 1));
    }
    else {
      ctx.T0 = ctx.T0.minus(Op.u(0, 1024).minus(bitLen));
    }
    if (bitLen.lo <= 894) {
      Op.bufferSet(buf, ptr + 1, 0, 111 - ptr);
      buf[111] |= 1;
      Helper.bufferEncode64(buf, 112, th);
      Helper.bufferEncode64(buf, 120, tl);
      blake(ctx, buf.slice(ptr), 128 - ptr);
    }
    else {
      blake(ctx, buf.slice(ptr), 128 - ptr);
      ctx.T0 = Op.u(0xFFFFFFFF,0xFFFFFC00);
      ctx.T1 = Op.u(0xFFFFFFFF,0xFFFFFFFF);
      Op.bufferSet(buf, 0, 0, 112);
      buf[111] = 1;
      Helper.bufferEncode64(buf, 112, th);
      Helper.bufferEncode64(buf, 120, tl);
      blake(ctx, buf, 128);
    }
    var out = new Array(16);
    for (var u = 0; u < 8; u++) {
      out[2 * u] = ctx.state[u].hi;
      out[2 * u + 1] = ctx.state[u].lo;
    }
    return out;
  }


  export function digest(input, format: number, output: number) {
    var msg;
    if (format === 1) {
      msg = input;
    }
    else if (format === 2) {
      msg = Helper.int32Buffer2Bytes(input);
    }
    else {
      msg = Helper.string2bytes(input);
    }
    var zero = Op.u(0,0);

    var ctx = {
      state: Op.clone64Array(initialValues),
      salt: [zero, zero, zero, zero],
      T0: zero.clone(),
      T1: zero.clone(),
      ptr: 0,
      buffer: new Array(128)
    };

    blake(ctx, msg, msg.length);
    var r = blakeClose(ctx);
    var out;
    if (output === 2) {
      out = r;
    }
    else if (output === 1) {
      out = Helper.int32Buffer2Bytes(r)
    }
    else {
      out = Helper.int32ArrayToHexString(r)
    }
    return out;
  }
}
