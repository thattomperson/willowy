const sade = require('sade')

const pkg = require('../package.json')

const prog = sade(pkg.name).version(pkg.version)

require('./cli/build')(prog)
require('./cli/watch')(prog)

prog.parse(process.argv)
