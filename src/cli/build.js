const path = require('path')
const { inputOptions, outputOptions } = require('../internal')
const rollup = require('rollup')

module.exports = prog => prog.command('build [src] [dest]')
  .action(async (src = '.', dest = './public') => {
    console.log(`> Building ${src} to ${dest}`)

    src = path.resolve(src)
    dest = path.resolve(dest)

    const bundle = await rollup.rollup(await inputOptions(src, dest))
    return bundle.write(await outputOptions(dest))
  })
