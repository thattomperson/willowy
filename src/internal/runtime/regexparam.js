export default function regexparam (str, loose) {
  if (str instanceof RegExp) return { keys: false, pattern: str }
  let optional
  let part
  let ext
  const keys = []
  let pattern = ''
  const arr = str.split('/')
  arr[0] || arr.shift()

  // eslint-disable-next-line no-cond-assign
  while (part = arr.shift()) {
    const char = part[0]
    if (char === '*') {
      keys.push('wild')
      pattern += '/(.*)'
    } else if (char === ':') {
      optional = part.indexOf('?', 1)
      ext = part.indexOf('.', 1)
      keys.push(part.substring(1, ~optional ? optional : ~ext ? ext : part.length))
      pattern += !!~optional && !~ext ? '(?:/([^/]+?))?' : '/([^/]+?)'
      if (~ext) pattern += (~optional ? '?' : '') + '\\' + part.substring(ext)
    } else {
      pattern += '/' + part
    }
  }

  return {
    keys: keys,
    pattern: new RegExp('^' + pattern + (loose ? '(?=$|/)' : '/?$'), 'i')
  }
}
