const path = require('path')
const fs = require('fs')
const { map } = require('async')
const util = require('util')
const readdir = util.promisify(fs.readdir)
const lstat = util.promisify(fs.lstat)
const isDir = async path => (await lstat(path)).isDirectory()

const walk = async dir => map(await readdir(dir), async p => {
  if (p.startsWith('_')) return
  const filepath = path.join(dir, p)

  const name = p.replace(/\.svelte$/, '')
    .replace(/\.js$/, '')
    .replace(/\[(.*)\]/, ':$1')

  if (await isDir(filepath)) {
    return {
      name,
      children: await walk(filepath)
    }
  }

  return {
    name: name === 'index' ? '' : name,
    server: p.endsWith('.js'),
    file: filepath
  }
}).then(files => files.filter(Boolean))

module.exports = walk
