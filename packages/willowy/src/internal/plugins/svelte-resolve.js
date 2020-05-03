module.exports = function svelteResolve () {
  return {
    name: 'svelte-resolve',
    resolveId (importee, importer) {
      if (importee.startsWith('svelte') || importee.startsWith('@willowy')) {
        return require.resolve(importee).replace('index.js', 'index.mjs')
      }
      return null
    }
  }
}
