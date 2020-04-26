const sade = require('sade')
const path = require('path')


const rollup = require('rollup')
const commonjs = require('@rollup/plugin-commonjs')
const resolve = require('@rollup/plugin-node-resolve')
const svelte = require('rollup-plugin-svelte')
const router = require('./plugins/router')
const runtime = require('./plugins/runtime')
const html = require('./plugins/html')
const servor  = require('servor')
const svelteResolve = require('./plugins/svelte-resolve')

const pkg = require('../package.json')

const prog = sade(pkg.name).version(pkg.version)

const outputOptions = (dest) => ({
  format: 'esm',
  dir: dest,
  sourcemap: true,
  chunkFileNames: 'dist/[name]-[hash].js',
  entryFileNames: 'dist/client.js'
})

const inputOptions = (src) => {
  return {
    input: '@willowy/runtime/client.js',
    plugins: [
      runtime(),
      router(path.join(src, 'pages')),
      commonjs(),
      resolve(),
      svelteResolve(),
      svelte(),
      html()
    ]
  }
}

prog.command('watch [src] [dest]')
  .describe('Build the source directory. Expects an `index.js` entry file.')
  .action(async (src = '.', dest = './public') => {
    src = path.resolve(src)
    dest = path.resolve(dest)

    const watcher = rollup.watch({
      ...inputOptions(src),
      output: outputOptions(dest),
      watch: {}
    })

    let instance

    watcher.on('event', event => {
      switch(event.code) {
        case 'ERROR':
          console.error(event.error)
          break;
        case 'END':
          console.log(event)
          if (!instance) {
            instance = servor({
              root: dest,
              fallback: 'index.html',
              port: 8080,
              reload: true,
              browse: true,
            });
          }

          break
        default:
          console.log(event)
          break;
      }
    });

    // stop watching
    // watcher.close();
  })

prog.command('build [src] [dest]')
  .describe('Build the source directory. Expects an `index.js` entry file.')
  .action(async (src = '.', dest = './public') => {
    console.log(`> building from ${src} to ${dest}`);
    src = path.resolve(src)
    dest = path.resolve(dest)
  
    const bundle = await rollup.rollup(inputOptions(src))
    await bundle.write(outputOptions(dest))
  });

prog.parse(process.argv);
