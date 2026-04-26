// Build script: bundles React + JSX + CSS into dist/
const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');
const publicDir = path.join(__dirname, 'public');

// Clean dist
if (fs.existsSync(distDir)) fs.rmSync(distDir, { recursive: true });
fs.mkdirSync(distDir, { recursive: true });

// Copy public/ → dist/
function copyRecursive(src, dst) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dst)) fs.mkdirSync(dst, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dst, entry));
    }
  } else {
    fs.copyFileSync(src, dst);
  }
}
if (fs.existsSync(publicDir)) copyRecursive(publicDir, distDir);

// Bundle JS + CSS
esbuild.buildSync({
  entryPoints: [path.join(__dirname, 'src', 'main.jsx')],
  bundle: true,
  minify: true,
  sourcemap: false,
  target: ['es2020', 'safari14'],
  outdir: distDir,
  entryNames: 'app',
  loader: { '.js': 'jsx', '.jsx': 'jsx' },
  jsx: 'automatic',
  define: { 'process.env.NODE_ENV': '"production"' },
});

console.log('✓ Built to dist/');
console.log('  ' + fs.readdirSync(distDir).join('\n  '));
