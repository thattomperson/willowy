export function findAnchor (node, root) {
  while (node && node.nodeName.toUpperCase() !== 'A') {
    node = node.parentNode
    if (node === root) return
  }
  return node
}

export function debounce (cb, delay = 10) {
  let timeout
  return (...args) => {
    clearTimeout(timeout)
    timeout = setTimeout(cb, delay, ...args)
  }
}
