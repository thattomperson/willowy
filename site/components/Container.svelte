<main class:sidebar>
  <slot></slot>
</main>

<script>
export let sidebar = false
</script>

<style>
main {
  max-width: 1024px;
  margin: auto;
}

.sidebar {
  display: grid;
  grid-template-columns: 1fr 3fr;
}
</style>