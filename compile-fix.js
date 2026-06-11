// Intercept the global compiler safely
const originalCompile = WebAssembly.compile;

WebAssembly.compile = function (source) {
  if (typeof Response !== 'undefined' && (source instanceof Buffer || source instanceof ArrayBuffer || ArrayBuffer.isView(source))) {
    return originalCompile(new Response(source));
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

