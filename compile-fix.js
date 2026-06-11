// Intercept the global compiler safely
const originalCompile = WebAssembly.compile;

WebAssembly.compile = function (source) {
  // Only intercept if Response is globally available AND we are dealing with a raw buffer
  if (typeof Response !== 'undefined' && (source instanceof Buffer || source instanceof ArrayBuffer || ArrayBuffer.isView(source))) {
    return originalCompile(new Response(source));
  }
  // Otherwise, let Node handle it natively (fixes internal HTTP/undici tools)
  return originalCompile(source);
};

// Dynamically load AssemblyScript whether your project uses import or require
(async () => {
  try {
    const { main } = await import('assemblyscript/dist/asc.js');
    if (main) await main(process.argv.slice(2));
  } catch {
    require('assemblyscript/dist/asc.js');
  }
})();

