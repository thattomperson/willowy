const path = require('path')
const { options } = require('../internal')
const rollup = require('rollup')
const servor = require('servor')
const chalk = require('chalk')

module.exports = prog => prog.command('watch [src] [dest]')
  .option('--port, -p', 'port to start the dev server on', 8080)
  .action(async (src = '.', dest = './public', opts) => {
    console.log(`> Building ${src} to ${dest}`)

    src = path.resolve(src)
    dest = path.resolve(dest)

    const { inputOptions, outputOptions } = await options(src, dest, {
      dev: true
    })

    const watcher = await rollup.watch({
      ...inputOptions,
      output: outputOptions
    })

    let server

    watcher.on('event', event => {
      switch (event.code) {
        case 'ERROR':
          if (
            event.error.code === 'PARSE_ERROR' ||
              (event.error.code === 'PLUGIN_ERROR' && event.error.name === 'ParseError')
          ) {
            console.log(chalk.red(`Couldn't parse ${chalk.bold(path.relative(src, event.error.loc ? event.error.loc.file : event.error.id))}`))
            console.log(event.error.message)
            console.log(chalk.green(event.error.frame))
          } else {
            console.log(event.error)
          }
          break
        case 'END':
          console.log(chalk.cyan.bold('Finished Building'))
          if (!server) {
            server = servor({
              root: dest,
              fallback: 'index.html',
              port: opts.port,
              reload: true,
              browse: true
            })
            server.then(res => {
              console.log(`DevServer listening on ${chalk.bold(res.url)}`)
            })
          }

          break
      }
    })
  })
