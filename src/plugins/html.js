module.exports = function html() {
  return {
    name: 'willowy-html',
    async generateBundle(output, bundle) {

      const source = `<!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body>
          <div id="app"></div>
          <script type="module" src="/dist/client.js"></script>
        </body>
        </html>`.replace(/\>\s*\</g, '><')

      const htmlFile = {
        type: 'asset',
        source,
        name: 'Rollup HTML Asset',
        fileName: 'index.html'
      };

      this.emitFile(htmlFile);
    }
  }
}