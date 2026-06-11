// Intercept StackBlitz/Node WebAssembly compile restrictions
const originalCompile = WebAssembly.compile;

WebAssembly.compile = function (source) {
  try {
    // 1. Convert any buffer format (Buffer, ArrayBuffer, View) into a pure Uint8Array
    let bytes;
    if (source instanceof Uint8Array) {
      bytes = source;
    } else if (source instanceof ArrayBuffer) {
      bytes = new Uint8Array(source);
    } else if (source?.buffer instanceof ArrayBuffer) {
      bytes = new Uint8Array(source.buffer, source.byteOffset, source.byteLength);
    } else if (Buffer.isBuffer(source)) {
      bytes = new Uint8Array(source);
    }

    // 2. If we extracted a valid byte array, utilize StackBlitz's native compileWasm fallback
    if (bytes && typeof WebAssembly.compileWasm === 'function') {
      return WebAssembly.compileWasm(bytes);
    }
  } catch (e) {
    // Fall back to original behavior if conversion fails
  }

  return originalCompile(source);
};

// Clean ES Module execution for AssemblyScript
(async () => {
  const asc = await import('assemblyscript/dist/asc.js');
  if (asc.main) {
    await asc.main(process.argv.slice(2));
  }
})();

