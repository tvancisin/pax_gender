<script>
  import { themes } from "../config.js";
  import { getContext } from "svelte";

  export let theme = getContext("theme");

</script>

<hr style="color: {themes[theme]}" />

<style>
  hr {
    width: 80%;
    color: rgb(66, 66, 66);
    border: none;
    border-top: 1px solid;
  }
</style>
