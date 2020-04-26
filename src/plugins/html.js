const path = require('path')

module.exports = function html (routes) {
  return {
    name: 'willowy-html',
    async generateBundle (output, bundle) {
      const source = `<!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Willowy App</title>
        </head>
        <body>
          <div id="app"></div>
          <script type="module" src="/dist/client.js"></script>
        </body>
        </html>`.replace(/>\s*</g, '><')

      const defaultHtmlFile = {
        type: 'asset',
        source,
        name: 'Rollup HTML Asset',
      }

      function generate(bundle, routes, prefix = "") {
        routes.filter(a => (a.children || !a.server) && !a.name.startsWith(':') ).forEach(a => {
          if (a.children) return generate(bundle, a.children, path.join(prefix, a.name))

          bundle.emitFile({
            ...defaultHtmlFile,
            fileName: path.join(prefix, a.name, 'index.html')
          })
        })
      }

      generate(this, routes)

      
      // routes.filter(a => !a.server).forEach(a => {
      //   this.emitFile({
      //     ...defaultHtmlFile,
      //     fileName: path.join(a.name, 'index.html'),
      //   })
      // })
      
    }
  }
}
