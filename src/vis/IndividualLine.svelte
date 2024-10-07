<script>
    import { tweened } from "svelte/motion";
    import { cubicOut } from "svelte/easing";
    import * as d3 from "d3";
    import { generateHandwrittenLine } from "../utils";

    export let x;
    export let y;
    export let width;
    export let innerHeight;
    export let entries;
    export let reorder;

    const tX = tweened(null, { duration: 1200, easing: cubicOut });
    const tY = tweened(null, { duration: 1200, easing: cubicOut });

    // Create a line generator using d3.line with curveMonotoneX to maintain left-to-right flow
    const lineGenerator = d3
        .line()
        .x((d) => d[0]) // X coordinate from the generated points
        .y((d) => d[1]) // Y coordinate from the generated points
        .curve(d3.curveMonotoneX); // Ensures the line progresses monotonically in the X direction

    $: yScale = d3.scaleLinear().domain([0, 100]).range([0, 220]);
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
        <!-- <line
            x1="0"
            x2={width}
            y1={yScale(i)}
            y2={yScale(i)}
            stroke="#cccccc"
            class={assign_class(entry)}
            stroke-width="1"
        /> -->
        <path
            d={lineGenerator(
                generateHandwrittenLine(0, yScale(i), width),
            )}
            fill="none"
            stroke="#cccccc"
            stroke-width="1"
            class={assign_class(entry)}
        />
    {/each}
</g>

<style>
    .women {
        stroke: black;
    }
</style>
