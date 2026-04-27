// Build script: bundles React + JSX + CSS into dist/
const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');
const publicDir = path.join(__dirname, 'public');

if (fs.existsSync(distDir)) fs.rmSync(distDir, { recursive: true });
fs.mkdirSync(distDir, { recursive: true });

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

// Read CACHE_VERSION from service-worker.js so the bundle can compare against live
const swPath = path.join(publicDir, 'service-worker.js');
const swSrc = fs.readFileSync(swPath, 'utf8');
const cacheMatch = swSrc.match(/CACHE_VERSION\s*=\s*['"]([^'"]+)['"]/);
const cacheVersion = cacheMatch ? cacheMatch[1] : '';
console.log(`Building against CACHE_VERSION = ${cacheVersion}`);

esbuild.buildSync({
  entryPoints: [path.join(__dirname, 'src', 'main.jsx')],
  bundle: true,
  minify: true,
  sourcemap: false,
  target: ['es2020', 'safari14'],
  outdir: distDir,
  entryNames: 'app',
  loader: { '.js': 'jsx', '.jsx': 'jsx' },
  charset: 'utf8',
  jsx: 'automatic',
  define: {
    'process.env.NODE_ENV': '"production"',
    'process.env.BUILD_DATE': JSON.stringify(((d) => `${d.getMonth()+1}/${d.getDate()}/${String(d.getFullYear()).slice(-2)}`)(new Date())),
    'process.env.CACHE_VERSION': JSON.stringify(cacheVersion),
  },
});

console.log('✓ Built to dist/');
console.log('  ' + fs.readdirSync(distDir).join('\n  '));
