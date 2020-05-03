<header>
  <div class="nav-container">
    <nav>
      <a href="/">Home</a>
      <a href="/docs/getting-started">Docs</a>
      <a href="/learn/lession-1">learn</a>
      <a href="https://github.com/thattomperson/willowy/tree/master/examples">Examples</a>
    </nav>
  </div>
</header>

<slot></slot>


<style>
header {
  position: sticky;
  top: 0;
}

.nav-container {
  padding: 0 2rem;
}

nav {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>