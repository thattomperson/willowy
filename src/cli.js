const sade = require('sade')
const path = require('path')
const fs = require('fs')
const { map } = require('async')
const util = require('util')
const readdir = util.promisify(fs.readdir)
const lstat = util.promisify(fs.lstat)


const isDir = async path => (await lstat(path)).isDirectory()

const rollup = require('rollup')
const commonjs = require('@rollup/plugin-commonjs')
const resolve = require('@rollup/plugin-node-resolve')
const svelte = require('rollup-plugin-svelte')
const router = require('./plugins/router')
const runtime = require('./plugins/runtime')
const html = require('./plugins/html')
const servor = require('servor')
const svelteResolve = require('./plugins/svelte-resolve')


async function walk(dir = './pages', root = '.') {
  const files = await map(await readdir(dir), async p => {
    if (p.startsWith('_')) return
    const filepath = path.join(dir, p)

    const name = p.replace(/\.svelte$/, '')
      .replace(/\.js$/, '')
      .replace(/\[(.*)\]/, ':$1')

    if (await isDir(filepath)) {
      return {
        name,
        children: await walk(filepath, root)
      }
    }

    return {
      name: name === 'index' ? '' : name,
      server: p.endsWith('.js'),
      file: filepath
    }
  })

  return files.filter(a => a)
}


const pkg = require('../package.json')

const prog = sade(pkg.name).version(pkg.version)

const outputOptions = async (dest) => ({
  format: 'esm',
  dir: dest,
  sourcemap: true,
  chunkFileNames: 'dist/[name]-[hash].js',
  entryFileNames: 'dist/client.js'
})

const inputOptions = async (src) => {
  const routes = await walk(path.join(src, 'pages'))
  
  return {
    input: '@willowy/runtime/client.js',
    plugins: [
      runtime(),
      router(routes),
      commonjs(),
      resolve(),
      svelteResolve(),
      svelte(),
      html(routes)
    ]
  }
}

prog.command('watch [src] [dest]')
  .describe('Build the source directory. Expects an `index.js` entry file.')
  .action(async (src = '.', dest = './public') => {
    src = path.resolve(src)
    dest = path.resolve(dest)

    const watcher = rollup.watch({
      ...(await inputOptions(src)),
      output: await outputOptions(dest),
      watch: {}
    })

    let instance

    watcher.on('event', event => {
      switch (event.code) {
        case 'ERROR':
          console.error(event.error)
          break
        case 'END':
          console.log(event)
          if (!instance) {
            instance = servor({
              root: dest,
              fallback: 'index.html',
              port: 8080,
              reload: true,
              browse: true
            })
          }

          break
        default:
          console.log(event)
          break
      }
    })

    // stop watching
    // watcher.close();
  })

prog.command('build [src] [dest]')
  .describe('Build the source directory. Expects an `index.js` entry file.')
  .action(async (src = '.', dest = './public') => {
    console.log(`> building from ${src} to ${dest}`)
    src = path.resolve(src)
    dest = path.resolve(dest)

    const bundle = await rollup.rollup(await inputOptions(src))
    await bundle.write(await outputOptions(dest))
  })

prog.parse(process.argv)
