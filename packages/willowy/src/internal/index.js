const path = require('path')
const commonjs = require('@rollup/plugin-commonjs')
const resolve = require('@rollup/plugin-node-resolve')
const svelte = require('rollup-plugin-svelte')
const router = require('./plugins/router')
const runtime = require('./plugins/runtime')
const html = require('./plugins/html')
const postcss = require('rollup-plugin-postcss')
const svelteResolve = require('./plugins/svelte-resolve')
const postcssPresetEnv = require('postcss-preset-env')
const postcssImport = require('postcss-import')
const postcssHoist = require('./plugins/postcss-hoist')
const { terser } = require('rollup-plugin-terser')

const { walk } = require('./utils')

async function inputOptions (src, dev) {
  const pages = await walk(path.join(src, 'pages'))

  return {
    input: '@willowy/runtime/client.js',
    preserveEntrySignatures: false,
    plugins: [
      runtime(dev),
      router(pages),
      resolve({
        browser: true,
        dedupe: ['svelte']
      }),
      svelteResolve(),
      commonjs(),
      svelte({ dev, emitCss: true }),
      postcss({
        plugins: [
          postcssImport(),
          postcssPresetEnv()
        ],
        extract: true,
        sourceMap: true
      }),
      postcssHoist(),
      html(path.join(src, 'pages')),
      !dev && terser({ module: true })
    ]
  }
}

async function outputOptions (dir, outputDirName) {
  return {
    format: 'esm',
    dir,
    sourcemap: true,
    chunkFileNames: path.join(outputDirName, '[name]-[hash].js'),
    entryFileNames: path.join(outputDirName, 'client-[hash].js'),
    assetFileNames: path.join(outputDirName, '[name]-[hash][extname]')
  }
}

const defaultOpts = {
  dev: false,
  outputDirName: 'dist'
}

async function options (src, dest, opts = {}) {
  const {
    dev,
    outputDirName
  } = Object.assign(defaultOpts, opts)

  return {
    inputOptions: await inputOptions(src, dev),
    outputOptions: await outputOptions(dest, outputDirName)
  }
}

module.exports = {
  options,
  inputOptions,
  outputOptions
}
