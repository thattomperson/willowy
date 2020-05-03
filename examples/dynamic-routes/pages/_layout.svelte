<div class="container">
  <slot></slot>
</div>

<style>
:global(html, body) {
  margin: 0;
  padding: 0;
}

.container {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
 
  text-align: center;
  justify-content: center;
}
</style>