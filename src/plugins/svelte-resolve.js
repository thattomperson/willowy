const path = require('path')

module.exports = function svelteResolve() {
  return {
    name: 'svelte-resolve',
    resolveId(importee, importer) {

      if (importee.startsWith('svelte')) {
        return require.resolve(importee).replace('index.js', 'index.mjs')
      }
      if (importer && importer.startsWith(PREFIX)) {
        let [ _ , base ] = importer.split(":")
        return require.resolve(path.join(base, importee)).replace('index.js', 'index.mjs')
      }

      return null
    }
  }
}