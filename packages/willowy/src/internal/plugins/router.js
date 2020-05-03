const path = require('path')
const regexparam = require('regexparam')

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
                ...regexparam('*'),
                route: '*',
                component: `() => import('${route.file}')`
              }
            }
            return [{
              ...regexparam(`/${pathname}`),
              route: `/${pathname}`,
              component: `() => import('${route.file}')`
            }, defaultRoute]
          }).flat().filter(a => a).sort(sort)
        }

        const d = render(routes)

        return `export default [
          ${d.map(a => `{
            keys: ${JSON.stringify(a.keys)},
            pattern: ${a.pattern.toString()},
            route: '${a.route}',
            component: ${a.component},
            layout: () => import('@willowy/runtime/_layout.svelte'),
          }`).join(',\n')}
        ]`
      }

      return null
    }
  }
}
