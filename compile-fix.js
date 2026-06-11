// Intercept the global compiler before AssemblyScript runs
const originalCompile = WebAssembly.compile;

WebAssembly.compile = function (source) {
  // Wrap Node's file buffer into a browser-safe Response object
  if (source instanceof Buffer || source instanceof ArrayBuffer || ArrayBuffer.isView(source)) {
    return originalCompile(new Response(source));
  }
  return originalCompile(source);
};

// Dynamically load AssemblyScript whether your project uses import or require
(async () => {
  try {
    // Try the modern ES Module import first
    const { main } = await import('assemblyscript/dist/asc.js');
    if (main) await main(process.argv.slice(2));
  } catch {
    // Fall back to the older CommonJS require if import fails
    require('assemblyscript/dist/asc.js');
  }
})();

