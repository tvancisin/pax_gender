<script>
    import { tweened } from "svelte/motion";
    import { cubicOut } from "svelte/easing";

    export let i;
    export let x;
    export let y;
    export let width;
    export let height;
    // export let info;

    // Define position tween parameters with staggered delay
    const positionTweenParams = {
        delay: (i / 4) * Math.random(), // Delay increases with index
        duration: 300,
        easing: cubicOut,
    };

    const tX = tweened(null, positionTweenParams);
    const tY = tweened(null, positionTweenParams);
    const tWidth = tweened(null, { duration: 300, easing: cubicOut });
    const tHeight = tweened(null, positionTweenParams);

    // Update position tweens after size animation completes
    $: tX.set(x);
    $: tY.set(y);
    $: tWidth.set(width);
    $: tHeight.set(height);
</script>

<g transform="translate({$tX} {$tY})">
    <rect
        x="0"
        y="0"
        width={$tWidth}
        height={$tHeight}
        rx="1"
        stroke="#595959"
        stroke-width="0.5"
    />
</g>

<style>
    rect {
        fill: #ffffff;
    }
</style>
