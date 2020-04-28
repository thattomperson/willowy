const path = require('path')
const { options } = require('../internal')
const rollup = require('rollup')

module.exports = prog => prog.command('build [src] [dest]')
  .action(async (src = '.', dest = './public') => {
    console.log(`> Building ${src} to ${dest}`)

    src = path.resolve(src)
    dest = path.resolve(dest)

    const { inputOptions, outputOptions } = await options(src, dest)

    const bundle = await rollup.rollup(inputOptions)
    return bundle.write(outputOptions)
  })
