<script>
    import * as d3 from "d3";
    import { tweened } from "svelte/motion";
    import { cubicOut } from "svelte/easing";

    export let node;

    let scaleRadius = d3.scaleLinear().domain([0, 200]).range([3, 25]);

    // Create a tweened store for smooth transitions
    let radius = tweened(0, { duration: 500, easing: cubicOut });

    // Update radius reactively
    $: radius.set(node.data.count === undefined ? 0 : scaleRadius(node.data.count));
</script>


<g transform="rotate({node.x - 90})translate({node.y})">
    <circle r={$radius}></circle>


    <!-- Conditionally rotate the text -->
    <text
        transform="rotate({node.x >= 180 ? 180 : 0})"
        dy="0.32em"
        x={node.x < 180 ? 20 : -20}
        text-anchor={node.x < 180 ? "start" : "end"}
        fill="gray"
        font-size="10"
    >
        {node.data.key === undefined ? "pax_gender" : node.data.key}
    </text>
</g>

<style>
    circle {
        fill: #f6f1d6;
    }
</style>
