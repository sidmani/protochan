/// <reference path="op.ts" />
// String functions
namespace Helper {
	export function int8ArrayToHexString(array): string {
		var string = '';

		for (var i = 0; i < array.length; i++) {
			if (array[i] < 16) {
				string += '0' + array[i].toString(16);
			}
			else {
				string += array[i].toString(16);
			}
		}
		return string;
	}

	export function int32ArrayToHexString(array): string {
		var string = '';
		var len = array.length;
		for (var i = 0; i < len; i++) {
			var s = array[i];
			if (s < 0) {
				s = 0xFFFFFFFF + array[i] + 1;
			}
			var l = s.toString(16);
			var padding = 8;
			while (l.length < padding) {
				l = "0" + l;
			}
			string += l;
		}
		return string;
	}

	export function hex2string(s): string {
		for (var c = [], len = s.length, i = 0; i < len; i += 2)
			c.push(String.fromCharCode(parseInt(s.substring(i, i + 2), 16)));
		return c.join('');
	}

	export function hex2bytes(s) {
		for (var c = [], len = s.length, i = 0; i < len; i += 2)
			c.push(parseInt(s.substring(i, i + 2), 16));
		return c;
	}

	export function string2bytes(s) {
		var len = s.length;
		var b = new Array(len);
		var i = 0;
		while (i < len) {
			b[i] = s.charCodeAt(i);
			i++;
		}
		return b;
	}

	export function bytes2Int32Buffer(b) {
		if (!b) return [];
		var len = b.length ? (((b.length - 1) >>> 2) + 1) : 0;
		var buffer = new Array(len);
		var j = 0;
		while (j < len) {
			buffer[j] = (b[j * 4] << 24) | (b[j * 4 + 1] << 16) | (b[j * 4 + 2] << 8) | b[j * 4 + 3];
			j++;
		}
		return buffer;
	}

	export function bytes2Int64Buffer(b) {
		if (!b) return [];
		var len = b.length ? (((b.length - 1) >>> 3) + 1) : 0;
		var buffer = new Array(len);
		var j = 0;
		while (j < len) {
			buffer[j] = new Op.u64((b[j * 8] << 24) | (b[j * 8 + 1] << 16) | (b[j * 8 + 2] << 8) | b[j * 8 + 3], (b[j * 8 + 4] << 24) | (b[j * 8 + 5] << 16) | (b[j * 8 + 6] << 8) | b[j * 8 + 7]);
			j++;
		}
		return buffer;
	}

	export function bytes2Int64BufferLeAligned(b) {
		if (!b) return [];
		var len =  b.length ? ((( b.length - 1) >>> 3) + 1) : 0;
		var buffer = new Array(len);
		var j = 0;
		while (j < len) {
			buffer[j] = new Op.u64((b[j * 8 + 7] << 24) | (b[j * 8 + 6] << 16) | (b[j * 8 + 5] << 8) | b[j * 8 + 4], (b[j * 8 + 3] << 24) | (b[j * 8 + 2] << 16) | (b[j * 8 + 1] << 8) | b[j * 8]);
			j++;
		}
		return buffer;
	}

	export function bufferEncode64leAligned(buffer, offset, uint64: Op.u64) {
		buffer[offset + 7] = uint64.hi >>> 24;
		buffer[offset + 6] = uint64.hi >>> 16 & 0xFF;
		buffer[offset + 5] = uint64.hi >>> 8 & 0xFF;
		buffer[offset + 4] = uint64.hi & 0xFF;
		buffer[offset + 3] = uint64.lo >>> 24;
		buffer[offset + 2] = uint64.lo >>> 16 & 0xFF;
		buffer[offset + 1] = uint64.lo >>> 8 & 0xFF;
		buffer[offset + 0] = uint64.lo & 0xFF;
	}

	export function bufferEncode64(buffer, offset: number, uint64: Op.u64) {
		buffer[offset] = uint64.hi >>> 24;
		buffer[offset + 1] = uint64.hi >>> 16 & 0xFF;
		buffer[offset + 2] = uint64.hi >>> 8 & 0xFF;
		buffer[offset + 3] = uint64.hi & 0xFF;
		buffer[offset + 4] = uint64.lo >>> 24;
		buffer[offset + 5] = uint64.lo >>> 16 & 0xFF;
		buffer[offset + 6] = uint64.lo >>> 8 & 0xFF;
		buffer[offset + 7] = uint64.lo & 0xFF;
	}

	export function int32Buffer2Bytes(b) {
		var buffer = new Array(b.length);
		var len = b.length;
		var i = 0;
		while (i < len) {
			buffer[i * 4] = (b[i] & 0xFF000000) >>> 24;
			buffer[i * 4 + 1] = (b[i] & 0x00FF0000) >>> 16;
			buffer[i * 4 + 2] = (b[i] & 0x0000FF00) >>> 8;
			buffer[i * 4 + 3] = (b[i] & 0x000000FF);
			i++;
		}
		return buffer;
	}

	export function string2Int32Buffer(s) {
		return this.bytes2Int32Buffer(this.string2bytes(s));
	}

	var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

	export function b64Encode(input): string {
		var output = "";
		var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
		var i = 0;

		while (i < input.length) {

			chr1 = input[i++];
			chr2 = input[i++];
			chr3 = input[i++];

			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;

			if (isNaN(chr2)) {
				enc3 = enc4 = 64;
			}
			else if (isNaN(chr3)) {
				enc4 = 64;
			}

			output +=
				keyStr.charAt(enc1) + keyStr.charAt(enc2) +
				keyStr.charAt(enc3) + keyStr.charAt(enc4);
		}

		return output;
	};

	export function b64Decode(input) {
		var output = [];
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;

		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

		while (i < input.length) {

			enc1 = keyStr.indexOf(input.charAt(i++));
			enc2 = keyStr.indexOf(input.charAt(i++));
			enc3 = keyStr.indexOf(input.charAt(i++));
			enc4 = keyStr.indexOf(input.charAt(i++));

			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;

			output.push(chr1);

			if (enc3 != 64) {
				output.push(chr2);
			}
			if (enc4 != 64) {
				output.push(chr3);
			}
		}
		return output;
	};
}
