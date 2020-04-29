const path = require('path')
const { options } = require('../internal')
const rollup = require('rollup')
const servor = require('servor')

module.exports = prog => prog.command('watch [src] [dest]')
  .option('--port, -p', 'port to start the dev server on', 8080)
  .action(async (src = '.', dest = './public', opts) => {
    console.log(`> Building ${src} to ${dest}`)

    src = path.resolve(src)
    dest = path.resolve(dest)

    const { inputOptions, outputOptions } = await options(src, dest)

    const watcher = await rollup.watch({
      ...inputOptions,
      output: outputOptions
    })

    let server

    watcher.on('event', event => {
      switch (event.code) {
        case 'ERROR':
          console.error(event.error)
          break
        case 'END':
          console.log(event)
          if (!server) {
            server = servor({
              root: dest,
              fallback: 'index.html',
              port: opts.port,
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
  })
