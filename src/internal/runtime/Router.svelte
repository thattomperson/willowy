<script context="module">
  import { writable, derived } from "svelte/store";
  /**
   * Returns the current location from the hash.
   *
   * @returns {Location} Location object
   * @private
   */
  function getLocation() {
    return {
      location: window.location.pathname,
      querystring: window.location.search.substr(1)
    };
  }

  const loc = writable(
    getLocation(),
    // eslint-disable-next-line prefer-arrow-callback
    function start(set) {
      const update = () => {
        set(getLocation());
      };

      window.addEventListener("popstate", update, false);

      return function stop() {
        window.removeEventListener("popstate", update, false);
      };
    }
  );

  /**
   * Readable store that returns the current location
   */
  export const location = derived(loc, $loc => $loc.location);

  /**
   * Readable store that returns the current querystring
   */
  export const querystring = derived(loc, $loc => $loc.querystring);

  /**
   * Navigates to a new page programmatically.
   *
   * @param {string} location - Path to navigate to (must start with `/` or '#/')
   * @return {Promise} Promise that resolves after the page navigation has completed
   */
  export function push(location) {
    if (
      !location ||
      location.length < 1 ||
      (location.charAt(0) != "/" && location.indexOf("#/") !== 0)
    ) {
      throw Error("Invalid parameter location");
    }

    // Execute this code when the current call stack is complete
    return nextTickPromise(() => {
      window.history.pushState(undefined, undefined, location);
      loc.set(getLocation())
    });
  }

  /**
   * Navigates back in history (equivalent to pressing the browser's back button).
   *
   * @return {Promise} Promise that resolves after the page navigation has completed
   */
  export function pop() {
    // Execute this code when the current call stack is complete
    return nextTickPromise(() => {
      window.history.back();
    });
  }

  /**
   * Replaces the current page but without modifying the history stack.
   *
   * @param {string} location - Path to navigate to (must start with `/` or '#/')
   * @return {Promise} Promise that resolves after the page navigation has completed
   */
  export function replace(location) {
    if (
      !location ||
      location.length < 1 ||
      (location.charAt(0) != "/" && location.indexOf("#/") !== 0)
    ) {
      throw Error("Invalid parameter location");
    }

    // Execute this code when the current call stack is complete
    return nextTickPromise(() => {
      window.history.replaceState(undefined, undefined, location);
      loc.set(getLocation())
    });
  }

  /**
   * Svelte Action that enables a link element (`<a>`) to use our history management.
   *
   * For example:
   *
   * ````html
   * <a href="/books" use:link>View books</a>
   * ````
   *
   * @param {HTMLElement} node - The target node (automatically set by Svelte). Must be an anchor tag (`<a>`) with a href attribute starting in `/`
   */
  export function link(node) {
    // Only apply to <a> tags
    if (!node || !node.tagName || node.tagName.toLowerCase() != "a") {
      throw Error('Action "link" can only be used with <a> tags');
    }

    // Destination must start with '/'
    const href = node.getAttribute("href");
    if (!href || href.length < 1 || href.charAt(0) != "/") {
      throw Error('Invalid value for "href" attribute');
    }

    // Add # to every href attribute
    node.setAttribute("href", "#" + href);
  }

  /**
   * Performs a callback in the next tick and returns a Promise that resolves once that's done
   *
   * @param {Function} cb - Callback to invoke
   * @returns {Promise} Promise that resolves after the callback has been invoked, with the return value of the callback (if any)
   */
  export function nextTickPromise(cb) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(cb());
      }, 0);
    });
  }
</script>

<script>
  import routes from "router-manifest";
  import regexparam from '@willowy/runtime/regexparam.js'

  import { onMount } from 'svelte'
  
  /**
   * Container for a route: path, component
   */
  class RouteItem {
    /**
     * Initializes the object and creates a regular expression from the path, using regexparam.
     *
     * @param {string} path - Path to the route (must start with '/' or '*')
     * @param {SvelteComponent} component - Svelte component for the route
     */
    constructor(path, component) {
      if (
        !component ||
        (typeof component != "function" &&
          (typeof component != "object" || component._sveltesparouter !== true))
      ) {
        throw Error("Invalid component object");
      }

      // Path must be a regular or expression, or a string starting with '/' or '*'
      if (
        !path ||
        (typeof path == "string" &&
          (path.length < 1 ||
            (path.charAt(0) != "/" && path.charAt(0) != "*"))) ||
        (typeof path == "object" && !(path instanceof RegExp))
      ) {
        throw Error('Invalid value for "path" argument');
      }

      const { pattern, keys } = regexparam(path);

      this.path = path;

      // Check if the component is wrapped and we have conditions
      if (typeof component == "object" && component._sveltesparouter === true) {
        this.component = component.route;
        this.conditions = component.conditions || [];
        this.userData = component.userData;
      } else {
        this.component = component;
        this.conditions = [];
        this.userData = undefined;
      }

      this._pattern = pattern;
      this._keys = keys;
    }

    /**
     * Checks if `path` matches the current route.
     * If there's a match, will return the list of parameters from the URL (if any).
     * In case of no match, the method will return `null`.
     *
     * @param {string} path - Path to test
     * @returns {null|Object.<string, string>} List of paramters from the URL if there's a match, or `null` otherwise.
     */
    match(path) {
      // Check if the pattern matches
      const matches = this._pattern.exec(path);
      if (matches === null) {
        return null;
      }

      // If the input was a regular expression, this._keys would be false, so return matches as is
      if (this._keys === false) {
        return matches;
      }

      const out = {};
      let i = 0;
      while (i < this._keys.length) {
        out[this._keys[i]] = matches[++i] || null;
      }
      return out;
    }
  }

  // Set up all routes
  const routesList = [];
  if (routes instanceof Map) {
    // If it's a map, iterate on it right away
    routes.forEach((route, path) => {
      routesList.push(new RouteItem(path, route));
    });
  } else {
    // We have an object, so iterate on its own properties
    Object.keys(routes).forEach(path => {
      routesList.push(new RouteItem(path, routes[path]));
    });
  }

  // Props for the component to render
  let component = null;
  let componentParams = null;

  onMount(() => {
    const handleClick = (event) => {
      if (event.target.tagName == 'A') {
        event.preventDefault()
        console.log(event.target)
        push(event.target.pathname)
      }
    }

    window.addEventListener('click', handleClick, false)

    return () => {
      window.removeEventListener('click', handleClick, false)
    }
  })

  // Handle hash change events
  // Listen to changes in the $loc store and update the page
  $: {
    // Find a route matching the location
    component = null;
    let i = 0;
    while (!component && i < routesList.length) {
      const match = routesList[i].match($loc.location);
      if (match) {
        const detail = {
          component: routesList[i].component,
          name: routesList[i].component.name,
          location: $loc.location,
          querystring: $loc.querystring,
          userData: routesList[i].userData
        };

        component = routesList[i].component;
        // Set componentParams onloy if we have a match, to avoid a warning similar to `<Component> was created with unknown prop 'params'`
        // Of course, this assumes that developers always add a "params" prop when they are expecting parameters
        if (match && typeof match == "object" && Object.keys(match).length) {
          componentParams = match;
        } else {
          componentParams = null;
        }
      }
      i++;
    }
  }
</script>

{#if componentParams}
  <svelte:component this={component} params={componentParams} on:routeEvent />
{:else}
  <svelte:component this={component} on:routeEvent />
{/if}
