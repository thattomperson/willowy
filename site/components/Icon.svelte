<svg
  aria-hidden="true"
  role="img"
  xmlns="http://www.w3.org/2000/svg"
  viewBox="{viewBox}"
>
  <path fill="currentColor" d="{path}" />
</svg>

<script>
  export let icon;
  $: viewBox = "0 0 " + icon[0] + " " + icon[1];
  $: path = icon[2];
</script>

<style>
  svg {
    width: 1em;
    height: 1em;
    overflow: visible;
    display: inline-block;
  }
</style>