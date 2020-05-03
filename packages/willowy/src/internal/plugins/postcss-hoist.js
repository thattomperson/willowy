const postcss = require('postcss')

const hoist = postcss.plugin('postcss-hoist-plugin', (opts = { }) => {
  return (root, result) => {
    root.walkAtRules('import', (rule) => {
      root.prepend(rule)
    })
  }
})

module.exports = function () {
  return {
    name: '@import-hoist',
    async generateBundle (output, bundle) {
      await Promise.all(Object.values(bundle).filter(a => a.fileName.endsWith('.css')).map(async asset => {
        return postcss([hoist])
          .process(asset.source)
          .then(result => {
            bundle[asset.fileName].source = result.css
          })
      }))

      return null
    }
  }
}
