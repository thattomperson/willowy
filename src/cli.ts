import sade from 'sade'
import build from './cli/build'
import watch from './cli/watch'

const pkg = require('../package.json')

const prog = sade(pkg.name).version(pkg.version)

build(prog)
watch(prog)

prog.parse(process.argv)
