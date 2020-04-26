const path = require('path');
const fs = require('fs')
const compiler = require('svelte/compiler')

const PREFIX = `\0virtual:`;

module.exports = function virtual() {
  const modules = {}
  const dir = path.join(__dirname, '..', 'runtime')

  fs.readdirSync(dir).forEach(async f => {
    const file = path.join(dir, f)

    let source = fs.readFileSync(file, 'utf-8')

    if (file.endsWith('.svelte')) {
      source = compiler.compile(source).js
    }

    modules[`@willowy/runtime/${f}`] = source
  })

  return {
    name: 'virtual',

    resolveId(id, importer) {
      if (id in modules) return PREFIX + id;

      if (importer) {
        // eslint-disable-next-line no-param-reassign
        if (importer.startsWith(PREFIX)) importer = importer.slice(PREFIX.length);
      }
    },

    load(id) {
      if (id.startsWith(PREFIX)) {
        // eslint-disable-next-line no-param-reassign
        id = id.slice(PREFIX.length);

        return id in modules ? modules[id] : null
      }
    }
  };
}