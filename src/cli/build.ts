import { Sade } from 'sade'
import path from 'path'

export default function (prog: Sade) {
  prog.command('build [src] [dest]')
    .action(async (src = '.', dest = './public') => {
      console.log(`> Building ${src} to ${dest}`)


      src = path.resolve(src)
      dest = path.resolve(dest)

    })
}