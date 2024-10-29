<script>
    import { tweened } from "svelte/motion";
    import { cubicOut } from "svelte/easing";
    import * as d3 from "d3";
    import { generateHandwrittenLine, lineGenerator } from "../utils";

    export let x1;
    export let x2;
    export let y1;
    export let y2;

    const tX1 = tweened(null, { duration: 1000, easing: cubicOut });
    const tX2 = tweened(null, { duration: 1000, easing: cubicOut });
    const tY1 = tweened(null, { duration: 1000, easing: cubicOut });
    const tY2 = tweened(null, { duration: 1000, easing: cubicOut });

    $: tX1.set(x1);
    $: tX2.set(x2);
    $: tY1.set(y1);
    $: tY2.set(y2);

    function assign_class(entry) {
        // if (entry.GeWom == "1") {
        return "women";
        // }
    }

    // $: if (reorder) {
    //     entries = [...entries].sort((a, b) =>
    //         assign_class(a) === "women" ? 1 : -1,
    //     );
    // }
</script>

<g transform="translate({$tX1} {$tY1})">
    <line x1={0} x2={$tX2} y1={$tY1} y2={$tY2} stroke="black" />
</g>

<style>
    .women {
        stroke: black;
    }
    line {
        shape-rendering: crispEdges;
    }
</style>
