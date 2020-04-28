const path = require('path')

module.exports = prog => prog.command('watch [src] [dest]')
  .action(async (src = '.', dest = './public') => {
    console.log(`> Building ${src} to ${dest}`)

    src = path.resolve(src)
    dest = path.resolve(dest)
  })
