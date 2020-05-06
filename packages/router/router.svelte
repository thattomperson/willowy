
<script>
  import { writable, derived } from 'svelte/store'
  import Layouts from './layout.svelte'

  const path = writable(window.location.pathname)

  function push(pathname) {
    console.log('navigating to', pathname)
    window.history.pushState(null, null, pathname)
    path.set(pathname)
  }

  const IDLE = null
  const LAYOUT = 1;
  const COMPONENT = 2;
  const PRELOAD = 3;
  const DONE = 4;

  const loading = writable(IDLE)

  $: console.log({ $loading })

  export let routes
  let container

  function match(path) {
    for (let index = 0; index < routes.length; index++) {
      const route = routes[index];

      if (route.pattern.test(path)) {
        let i=0, keys={};
        let matches = route.pattern.exec(path);
        while (i < route.keys.length) {
          keys[ route.keys[i] ] = matches[++i] || null;
        }

        return { route, keys }
      }
    }
  }


  const route = derived(path, async (path, set) => {
    let out = {}
    const { route, keys } = match(path)
    out.layouts = await Promise.all(route.layout())
    out.component = await route.component()
    out.data = { params: keys }
  
    if (out.component.preload) {
      out.data = {...await out.component.preload(keys), params: keys }
    }

    set(out)
  })

  function findAnchor(node) {
    while (node && node.nodeName.toUpperCase() !== 'A') node = node.parentNode; 
    return node;
  }
  function debounce(cb, delay = 10) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout)
      timeout = setTimeout(cb, delay, ...args)
    }
  }

  const click = event => {
    let a = findAnchor(event.target)
    if (!a) return;
    if (a.host !== window.location.host) return;
    
    event.preventDefault();
    event.stopPropagation();
    push(a.pathname)
  }


  const mousemove = debounce((event) => {
    let a = findAnchor(event.target)
    if (!a) return;
    if (a.host !== window.location.host) return;

    const { route } = match(a.pathname)
    route.layout()
    route.component()
  })
</script>

<div on:click={click} on:mousemove={mousemove}>
  {#if $route}
    <Layouts layouts={$route.layouts}>
      <svelte:component this={$route.component.default} {...$route.data} />
    </Layouts>
  {/if}
</div>