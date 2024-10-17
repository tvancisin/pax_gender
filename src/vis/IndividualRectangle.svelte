<script>
    import { tweened } from "svelte/motion";
    import { cubicOut } from "svelte/easing";
    import * as d3 from "d3";

    export let x;
    export let y;
    export let rect;

    const tX = tweened(null, { duration: 1200, easing: cubicOut });
    const tY = tweened(null, { duration: 1200, easing: cubicOut });

    $: tX.set(x);
    $: tY.set(y);

</script>

<g transform="translate({$tX} {$tY})">
    <!-- {#each rect as r} -->
    <rect
        width={rect.width}
        height={rect.height}
        fill="white"
        stroke="gray"
        stroke-width="0.5"
    />
    <rect
        width={rect.width}
        height={rect.wHeight}
        fill="black"
    />
    <!-- {/each} -->
</g>

<style>
    .women {
        stroke: black;
    }
</style>
