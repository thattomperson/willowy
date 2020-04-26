const path = require('path')
const fs = require('fs')
const util = require('util')
const { map } = require('async')
const readdir = util.promisify(fs.readdir)
const lstat = util.promisify(fs.lstat)

const isDir = async path => (await lstat(path)).isDirectory()

module.exports = function router (pagesDir) {
  const PREFIX = '\0virtual-router:'

  const name = 'router-manifest'

  return {
    name,
    resolveId (id, importer) {
      if (id === name) {
        return PREFIX + id
      }
    },
    async load (id) {
      if (id === PREFIX + name) {
        const routes = await walk(pagesDir)
        const sort = (a, b) => {
          if (a.route === '*') {
            return 1
          }
          if (b.route === '*') {
            return -1
          }

          if (a.route.split('/').length > b.route.split('/').length) {
            return 1
          } else if (a.route.split('/').length < b.route.split('/').length) {
            return -1
          }

          if (a.route.length === b.route.length) {
            return 0
          }
          if (a.route.length > b.route.length) {
            return 1
          }

          return -1
        }

        const render = (routes, prefix = '') => {
          return routes.filter(r => r.children || !r.server).map(route => {
            if (route.children) {
              return render(route.children, path.join(prefix, route.name))
            }

            let pathname = path.join(prefix, route.name)

            let defaultRoute = null
            if (pathname === '.') {
              pathname = ''
              defaultRoute = {
                route: '*',
                import: `Chunk(() => import('${route.file}'))`
              }
            }
            return [{
              route: `/${pathname}`,
              import: `Chunk(() => import('${route.file}'))`
            }, defaultRoute]
          }).flat().filter(a => a).sort(sort)
        }

        const d = render(routes)

        return `
        import { ChunkGenerator } from '@willowy/runtime/chunk.js'
        import ChunkComponent from '@willowy/runtime/Chunk.svelte'
        const Chunk = ChunkGenerator(ChunkComponent)

        export default {
          ${d.map(a => `'${a.route}': ${a.import}`).join(',\n')}
        }
        `
      }

      return null
    }
  }
}

async function walk (dir = './pages', root = '.') {
  const files = await map(await readdir(dir), async p => {
    if (p.startsWith('_')) return
    const filepath = path.join(dir, p)

    const name = p.replace(/\.svelte$/, '')
      .replace(/\.js$/, '')
      .replace(/\[(.*)\]/, ':$1')

    if (await isDir(filepath)) {
      return {
        name,
        children: await walk(filepath, root)
      }
    }

    return {
      name: name === 'index' ? '' : name,
      server: p.endsWith('.js'),
      file: filepath
    }
  })

  return files.filter(a => a)
}
