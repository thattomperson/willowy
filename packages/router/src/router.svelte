
<script>
  import { writable, derived } from 'svelte/store'
  import { tick, onMount } from 'svelte'
  import { findAnchor, debounce } from './utils'
  import Layouts from './layout.svelte'

  const url = writable(window.location.href)
  const parsedUrl = derived(url, (url) => new URL(url))

  function push(pathname) {
    console.log('navigating to', pathname)
    window.history.pushState(null, null, pathname)
    $url = pathname
  }

  function popstate(event) {
    $url = event.target.location.href
  }
  onMount(() => {
    window.addEventListener('popstate', popstate)

    return () => window.removeEventListener('popstate', popstate)
  })

  export let routes

  function match(pathname) {
    for (let index = 0; index < routes.length; index++) {
      const route = routes[index];

      if (route.pattern.test(pathname)) {
        let i=0, keys={};
        let matches = route.pattern.exec(pathname);
        while (i < route.keys.length) {
          keys[ route.keys[i] ] = matches[++i] || null;
        }

        return { route, keys }
      }
    }
  }

  const route = derived(parsedUrl, async (parsedUrl, set) => {
    console.log('updating route')
    let out = {}
    const { route, keys } = match(parsedUrl.pathname)
    out.layouts = await Promise.all(route.layout())
    out.component = await route.component()
    out.data = { params: keys }
  
    if (out.component.preload) {
      out.data = {...await out.component.preload(keys), params: keys }
    }

    set(out)

    tick().then(() => {
      if (parsedUrl.hash) {
        document.body.scrollTop = document.getElementById(parsedUrl.hash.substr(1)).offsetTop
      } else {
        document.body.scrollTop = 0
      }
    })
  })

  let rootElm

  const click = event => {
    let a = findAnchor(event.target, rootElm)
    if (!a) return;
    if (a.host !== window.location.host) return;
    
    event.preventDefault();
    event.stopPropagation();
    push(a.href)
  }

  const mousemove = debounce((event) => {
    let a = findAnchor(event.target, rootElm)
    if (!a) return;
    if (a.host !== window.location.host) return;

    const { route } = match(a.pathname)
    route.layout()
    route.component()
  })
</script>

<div ref={rootElm} on:click={click} on:mousemove={mousemove}>
  {#if $route}
    <Layouts layouts={$route.layouts}>
      <svelte:component this={$route.component.default} {...$route.data} />
    </Layouts>
  {/if}
</div>