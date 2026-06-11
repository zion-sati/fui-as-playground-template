// Intercept the WebAssembly compiler to pass StackBlitz browser validation
const originalCompile = WebAssembly.compile;

WebAssembly.compile = function (source) {
  try {
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

    if (bytes) {
      // 1. Create a binary Blob out of the AssemblyScript compiler bytes
      const blob = new Blob([bytes], { type: 'application/wasm' });
      // 2. Turn that Blob into a valid, unique internal browser URL
      const blobUrl = URL.createObjectURL(blob);
      
      // 3. Streaming compilation bypasses the strict buffer check by accepting a real Promise<Response>
      const responsePromise = fetch(blobUrl).then(res => {
        // Clean up memory after the browser fetches the file
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
        return res;
      });

      return WebAssembly.compileStreaming(responsePromise);
    }
  } catch (e) {
    // Fail-safe fall through
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

