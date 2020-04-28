const path = require('path')
const commonjs = require('@rollup/plugin-commonjs')
const resolve = require('@rollup/plugin-node-resolve')
const svelte = require('rollup-plugin-svelte')
const router = require('./plugins/router')
const runtime = require('./plugins/runtime')
const html = require('./plugins/html')
const postcss = require('rollup-plugin-postcss')
const svelteResolve = require('./plugins/svelte-resolve')

const { walk } = require('./utils')

async function inputOptions (src, dest) {
  const routes = await walk(path.join(src, 'pages'))

  return {
    input: '@willowy/runtime/client.js',
    preserveEntrySignatures: false,
    plugins: [
      runtime(),
      router(routes),
      commonjs(),
      resolve(),
      svelteResolve(),
      svelte({ emitCss: true }),
      postcss({
        extract: '__/styles.css'
      }),
      html(path.join(src, 'pages'))
    ]
  }
}

async function outputOptions (dir) {
  return {
    format: 'esm',
    dir,
    sourcemap: true,
    chunkFileNames: '__/[name]-[hash].js',
    entryFileNames: '__/client-[hash].js'
  }
}

module.exports = {
  inputOptions,
  outputOptions
}
