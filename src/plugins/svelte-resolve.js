module.exports = function svelteResolve () {
  return {
    name: 'svelte-resolve',
    resolveId (importee, importer) {
      if (importee.startsWith('svelte')) {
        return require.resolve(importee).replace('index.js', 'index.mjs')
      }
      return null
    }
  }
}
