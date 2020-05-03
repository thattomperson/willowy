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

        return `export default [
          ${routes.sort(sort).map(r => {
            const { keys, pattern } = regexparam(r.route)
            return `{
              keys: ${JSON.stringify(keys)},
              pattern: ${pattern.toString()},
              route: '${r.route}',
              component: () => import('${r.component}'),
              layout: () => [${r.layouts.map(a => `import('${a}')`).join(',')}],
            }`
          }).join(',\n')}
        ]`
      }

      return null
    }
  }
}
