<Container sidebar>
  <aside>
    <ul>
      <li><a href="/learn/lession-1">Lesson 1 - Making a page</a></li>
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