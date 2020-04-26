export default function regexparam (str, loose) {
  if (str instanceof RegExp) return { keys: false, pattern: str }
  var c
  var o
  var tmp
  var ext
  var keys = []
  var pattern = ''
  var arr = str.split('/')
  arr[0] || arr.shift()

  while ((tmp = arr.shift())) {
    c = tmp[0]
    if (c === '*') {
      keys.push('wild')
      pattern += '/(.*)'
    } else if (c === ':') {
      o = tmp.indexOf('?', 1)
      ext = tmp.indexOf('.', 1)
      keys.push(tmp.substring(1, ~o ? o : ~ext ? ext : tmp.length))
      pattern += !!~o && !~ext ? '(?:/([^/]+?))?' : '/([^/]+?)'
      if (~ext) pattern += (~o ? '?' : '') + '\\' + tmp.substring(ext)
    } else {
      pattern += '/' + tmp
    }
  }

  return {
    keys: keys,
    pattern: new RegExp('^' + pattern + (loose ? '(?=$|/)' : '/?$'), 'i')
  }
}
