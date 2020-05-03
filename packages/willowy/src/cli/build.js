const path = require('path')
const { options } = require('../internal')
const rollup = require('rollup')

module.exports = prog => prog.command('build [src] [dest]')
  .action(async (src = '.', dest = './public') => {
    src = path.resolve(src)
    dest = path.resolve(dest)

    console.log(`> Building ${src} to ${dest}`)

    const { inputOptions, outputOptions } = await options(src, dest, {
      dev: false
    })

    const bundle = await rollup.rollup(inputOptions)
    return bundle.write(outputOptions)
  })
