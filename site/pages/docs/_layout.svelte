<Container sidebar>
  <aside>
    <ul>
      <li><a href="/docs/getting-started">Getting Started</a></li>
      <li><a href="/docs/installing">Installing</a></li>
    </ul>
  </aside>

  <div class="content">
    <slot></slot>
  </div>
</Container>


<script>
import Container from '../../components/Container.svelte'
</script>

<style>


aside {
  min-height: 300px;
  max-height: 80vh;
  overflow-y: auto;
  overflow-x: hidden;
}

.content {

}


</style>