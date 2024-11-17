<script>
    import { tweened } from "svelte/motion";
    import { cubicOut } from "svelte/easing";
    import * as d3 from "d3";
    import { generateHandwrittenLine, lineGenerator } from "../utils";

    export let x;
    export let y;
    export let width;
    export let height;
    export let cls;
    export let i;

    // // Separate transition parameters for each stage
    // const sizeTweenParams = {
    //     duration: 500,
    //     easing: cubicOut,
    // };

    const positionTweenParams = (delay) => ({
        delay: 500 + delay * 2, // Start after size transition
        duration: 250,
        easing: cubicOut,
    });

    // Separate tweens for size
    // const tWidth = tweened(null, sizeTweenParams);
    // const tHeight = tweened(null, sizeTweenParams);

    // Separate tweens for position with staggered delay
    // const tX = tweened(null, positionTweenParams(i));
    // const tY = tweened(null, positionTweenParams(i));

    const tX = tweened(null, positionTweenParams);
    const tY = tweened(null, positionTweenParams);
    const tWidth = tweened(null, { duration: 300, easing: cubicOut });
    const tHeight = tweened(null, positionTweenParams);

    // Update size tweens first
    // $: tWidth.set(width);
    // $: tHeight.set(height);

    // Update position tweens after size animation completes
    $: tX.set(x);
    $: tY.set(y);
    $: tWidth.set(width);
    $: tHeight.set(height);

</script>

<g
    transform="translate({$tX} {$tY})"
>
    <rect
        x="0"
        y="0"
        width={$tWidth}
        height={$tHeight}
        rx="1"
        fill="#F6F1D6"
        class={cls}
    />
</g>

<style>
</style>
