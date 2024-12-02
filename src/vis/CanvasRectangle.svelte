<script>
    import { getContext, onMount, onDestroy, afterUpdate } from 'svelte';
    import { tweened } from 'svelte/motion';
    import { cubicOut } from 'svelte/easing';
  
    export let x;
    export let i;
    export let y;
    export let width;
    export let height;
    export let contextName = 'canvas';
  
    const { register, deregister, invalidate } = getContext(contextName);
  
    const positionTweenParams = {
        delay: (i / 4) * Math.random(), // Delay increases with index
        duration: 300,
        easing: cubicOut,
    };

    const tX = tweened(null, positionTweenParams);
    const tY = tweened(null, positionTweenParams);
  
    function draw(ctx) {
        ctx.fillStyle = "#F6F1D6";
        ctx.fillRect($tX, $tY, width, height);
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