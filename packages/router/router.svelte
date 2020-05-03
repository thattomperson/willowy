<script context="module">
  const path = writable(window.location.pathname)

  export function push(pathname) {
    console.log('navigating to', pathname)
    window.history.pushState(null, null, pathname)
    path.set(pathname)
  }
</script>

<script>
  import { writable, derived } from 'svelte/store'
  import { onMount } from 'svelte'

  const IDLE = null
  const LAYOUT = 1;
  const COMPONENT = 2;
  const PRELOAD = 3;
  const DONE = 4;

  const loading = writable(IDLE)

  $: console.log({ $loading })

  export let routes
  let container

  const match = path => {
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
    $loading = LAYOUT
    out.layout = await route.layout()

    $loading = COMPONENT
    out.component = await route.component()
    out.data = keys
    
    if (out.component.preload) {
      $loading = PRELOAD
      out.data = {...await out.component.preload(keys), ...keys}
    }

    $loading = DONE
    set(out)

    setTimeout(() => {
      if ($loading == DONE) {
        $loading = IDLE
      }
    }, 50)
  })

  onMount(() => {
    const onclick = event => {
      console.log(event)
      if (event.target.tagName == 'A') {
        event.preventDefault();
        event.stopPropagation();
        push(event.target.pathname)
      }
    }

   container.addEventListener('click', onclick, false)
    return () => container.removeEventListener('click', onclick, false)
  })
</script>

<div bind:this={container}>
  {#if $route}
    <svelte:component this={$route.layout.default}>
      <svelte:component this={$route.component.default} {...$route.data} />
    </svelte:component>
  {/if}
</div>