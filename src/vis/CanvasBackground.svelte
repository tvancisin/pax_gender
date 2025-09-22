<script>
  import { getContext, onMount, onDestroy, afterUpdate } from "svelte";
  // import { tweened } from "svelte/motion";
  // import { cubicOut } from "svelte/easing";

  export let x;
  export let y;
  export let width;
  export let height;
  export let contextName = "canvas";
  export let margin;

  const { register, deregister, invalidate } = getContext(contextName);

  function draw(ctx) {
    ctx.strokeStyle = "#bfbfbf";
    ctx.strokeRect(x + margin.left, y + margin.top, width, height);
  }

  onMount(() => {
    register(draw);
    invalidate();
  });

  onDestroy(() => {
    deregister(draw);
  });

  afterUpdate(invalidate);
</script>
