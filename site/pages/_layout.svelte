<header>
  <div class="nav-container">
    <div>
      <nav>
        <a href="/"><h1>Willowy</h1></a>
        <a href="/#features">Features</a>
        <a href="/docs/getting-started">Docs</a>
        <a href="/learn/lession-1">learn</a>
        <a href="https://github.com/thattomperson/willowy/tree/master/examples">Examples</a>
        <a class="icon" href="https://github.com/thattomperson/willowy"><Icon icon={github} /></a> 
      </nav>
    </div>
  </div>
</header>

<Container>
  <slot></slot>
</Container>

<script>
import Icon from '../components/Icon.svelte'
import Container from '../components/Container.svelte'
import { github } from '../icons'
</script>


<style>
@import url('//fonts.googleapis.com/css2?family=Montserrat&family=Raleway:wght@100;300&display=swap');
:global(body, html) {
  margin: 0;
  padding: 0;
  font-family: 'Montserrat', sans-serif;
}

:global(h1, h2) {
  font-family: 'Raleway', sans-serif;
  font-weight: 100;
}
:global(h3, h4, h5, h6) {
  font-family: 'Raleway', sans-serif;
  font-weight: 300;
}

:global(code, kbd) {
  background: #333;
  color: #fff;
  border-radius: 5px;
  padding: 1px 3px;
}

:global(kbd::before) {
  content: '$';
  display: inline-block;
  padding-right: 5px;
}

:global(pre > code) {
  display: block;
  padding: 10px;
}

h1 {
  line-height: 60px;
  font-size: 50px;
  margin: 0;
}

header {
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  width: 100%;
  background: #fff;
  border-bottom: 1px solid #eaeaea;
}

.nav-container {
  padding: 0 2rem;
  max-width: 1024px;
  width: 100%;
}

nav {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

nav a {
  font-size: 18px;
  line-height: 18px;
  text-decoration: none;
  color: #696969;
  transition: color 200ms ease-in-out;
  padding: 1em;
}

nav a:hover {
  color: #000;
}

.icon {
  font-size: 2em;
}
</style>