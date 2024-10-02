<script>
    import { tweened } from "svelte/motion";
    import { cubicOut } from "svelte/easing";
    import * as d3 from "d3";

    export let x;
    export let y;
    export let width;
    export let innerHeight;
    export let entries;
    export let reorder;

    const tX = tweened(null, { duration: 1200, easing: cubicOut });
    const tY = tweened(null, { duration: 1200, easing: cubicOut });

    $: yScale = d3.scaleLinear().domain([0, 100]).range([0, innerHeight / 2]);
    $: tX.set(x);
    $: tY.set(y);

    function assign_class(entry) {
        if (entry.GeWom == "1") {
            return "women";
        }
    }

    $: if (reorder) {
        entries = [...entries].sort((a, b) =>
            assign_class(a) === "women" ? 1 : -1,
        );
    }

</script>

<g transform="translate({$tX} {$tY})">
    {#each entries as entry, i}
        <line
            x1="0"
            x2={width}
            y1={yScale(i)}
            y2={yScale(i)}
            stroke="#cccccc"
            class={assign_class(entry)}
            stroke-width="1"
        />
    {/each}
</g>

<style>
    .women {
        stroke: black;
    }
</style>
