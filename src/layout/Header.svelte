<script>
  export let center = true;
  export let short = false;

</script>

<header style="color: black; background-color: white;" class:short>
  <div
    class="v-padded col-wide middle"
    style="position: relative"
    class:short
    class:height-full={!short}
  >
    <div class:center>
      <slot></slot>
    </div>
  </div>
</header>

<style>
  .short {
    min-height: 85vh;
  }
  .v-padded {
    box-sizing: border-box;
    padding: 50px;
  }
</style>
