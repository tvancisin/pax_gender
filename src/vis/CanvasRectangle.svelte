<script>
  import { getContext, onMount, onDestroy, afterUpdate } from "svelte";
  import { tweened } from "svelte/motion";
  import { cubicOut } from "svelte/easing";

  export let x;
  export let i;
  export let y;
  export let width;
  export let height;
  export let contextName = "canvas";
  export let margin;

  const { register, deregister, invalidate } = getContext(contextName);

  const positionTweenParams = {
    delay: (i / 4) * Math.random(), // Delay increases with index
    duration: 300,
    easing: cubicOut,
  };

  const tX = tweened(null, positionTweenParams);
  const tY = tweened(null, positionTweenParams);

  function draw(ctx) {
    ctx.fillStyle = "#333333";
    ctx.fillRect($tX + margin.left, $tY + margin.top, width, height);
  }

  onMount(() => {
    register(draw);
    invalidate();
  });

  onDestroy(() => {
    deregister(draw);
  });

  afterUpdate(invalidate);

  $: tX.set(x);
  $: tY.set(y);
</script>
