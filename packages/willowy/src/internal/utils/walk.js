const path = require('path')
const fs = require('fs')

module.exports = function walk (dir, routePrefix = '', layouts = [], prefix = 'route') {
  const files = fs.readdirSync(dir)

  if (files.includes('_root.svelte')) {
    layouts = [path.join(dir, '_root.svelte')]
  }

  if (files.includes('_layout.svelte')) {
    layouts.push(path.join(dir, '_layout.svelte'))
  }
  // filter out files that start with _
  return files.filter(name => !name.startsWith('_'))
  // loop and parse and nest
    .map(p => {
      const filepath = path.join(dir, p)

      const name = `${prefix}_${path.parse(p).name}`

      const route = p.replace(/\.svelte$/, '')
        .replace(/\.js$/, '')
        .replace(/\[(.*)\]/, ':$1')
        .replace(/^index$/i, '')

      if (fs.statSync(filepath).isDirectory()) {
        return walk(filepath, route, [...layouts], name)
      }

      return {
        name,
        route: '/' + (route ? path.join(routePrefix, route) : routePrefix),
        component: filepath,
        layouts: layouts.length ? layouts : ['@willowy/runtime/_layout.svelte']
      }
    }).flat()
}
