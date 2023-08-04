export function concatArrayBuffers(bufs: ArrayBuffer[]): ArrayBuffer {
	const result = new Uint8Array(bufs.reduce((totalSize, buf)=>totalSize+buf.byteLength, 0));
	bufs.reduce((offset, buf) => {
		result.set(new Uint8Array(buf), offset);
		return offset + buf.byteLength;
	}, 0);

	return result.buffer;
}