const path = require('path')

module.exports = function router (routes) {
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
