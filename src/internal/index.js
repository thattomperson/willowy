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

async function inputOptions (src, outputDirName = 'dist') {
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
        extract: path.join(outputDirName, 'styles.css')
      }),
      html(path.join(src, 'pages'))
    ]
  }
}

async function outputOptions (dir, outputDirName = 'dist') {
  return {
    format: 'esm',
    dir,
    sourcemap: true,
    chunkFileNames: path.join(outputDirName, '[name]-[hash].js'),
    entryFileNames: path.join(outputDirName, 'client-[hash].js')
  }
}

async function options (src, dest, outputDirName = 'dist') {
  return {
    inputOptions: await inputOptions(src, outputDirName),
    outputOptions: await outputOptions(dest, outputDirName)
  }
}

module.exports = {
  options,
  inputOptions,
  outputOptions
}
