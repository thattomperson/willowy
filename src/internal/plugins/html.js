const path = require('path')

module.exports = function html (src) {
  return {
    name: 'willowy-html',
    async generateBundle (output, bundle) {
      const template = (module, entry, styles) => `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Willowy App</title>
        ${styles.map(url => `<link rel="preload" href="/${url.fileName}" as="style">`).join('\n')}
        <link rel="preload" href="/${module.fileName}" as="script">
        ${module.imports.map(url => `<link rel="preload" href="/${url}" as="script">`).join('\n')}
      </head>
      <body>
        <div id="app"></div>
        <script type="module" src="/${entry.fileName}"></script>
      </body>
      </html>`

      const entry = Object.values(bundle).filter(a => a.isEntry)[0]
      const styles = Object.values(bundle).filter(a => a.fileName.endsWith('.css'))

      Object.values(bundle).filter(a => a.isDynamicEntry).forEach(module => {
        const pathname = path.relative(src, module.facadeModuleId).replace('.svelte', '').replace(/\bindex$/, '')
        const fileName = path.join(pathname, 'index.html')

        this.emitFile({
          type: 'asset',
          source: template(module, entry, styles),
          name: 'Preloaded html',
          fileName
        })
      })
    }
  }
}
