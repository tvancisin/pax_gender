<script>
    import * as d3 from "d3";
    import { tweened } from "svelte/motion";
    import { cubicOut } from "svelte/easing";
    import { onMount } from "svelte";

    export let node;
    export let categories;
    
    let scaleRadius = d3.scaleLinear().domain([0, 200]).range([1.5, 25]);
    let textElement;
    let bbox = { x: 0, y: 0, width: 0, height: 0 };
    let name;
    let radius = tweened(0, { duration: 500, easing: cubicOut });

    // Update radius reactively
    $: radius.set(
        node.data.count === undefined ? 0 : scaleRadius(node.data.count),
    );

    $: label = node.data.key === undefined ? "pax_gender" : node.data.key;

    $: if (label && categories) {
        let category = categories.find((cat) => cat.id === label);
        name = category ? category.name : null;
    }

    // Update bounding box when label changes or on mount
    function updateBBox() {
        if (textElement) {
            bbox = textElement.getBBox();
        }
    }

    onMount(updateBBox);
    $: updateBBox();
</script>

<g transform="rotate({node.x - 90})translate({node.y})">
    <circle r={$radius}></circle>

    <!-- Label group to apply same transform to rect and text -->
    <g transform="rotate({node.x >= 180 ? 180 : 0})">
        <!-- Background rectangle behind text -->
        <rect
            x={(node.x < 180 ? 0 : -0) + bbox.x - 2}
            y={bbox.y - 1}
            width={bbox.width + 4}
            height={bbox.height + 2}
            fill="#001C23"
            opacity="0.7"
            rx="2"
            ry="2"
        />

        <!-- Label text -->
        <text
            bind:this={textElement}
            x={node.x < 180 ? 15 : -15}
            dy="0.32em"
            text-anchor={node.x < 180 ? "start" : "end"}
            fill="#f6f1d6"
            font-size="12"
            class={"node " + node.data.key}
        >
            {name}
        </text>
    </g>
</g>

<style>
    circle {
        fill: #f6f1d6;
    }
</style>
