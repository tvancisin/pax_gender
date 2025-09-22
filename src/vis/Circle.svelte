<script>
    import * as d3 from "d3";
    import { tick } from "svelte";
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

    //hover actions
    let textWidth = 0;
    let textEl;

    async function updateTextWidth() {
        await tick();
        if (textEl) {
            textWidth = textEl.getBBox().width;
        }
    }

    let hover = {
        iso: null,
        x: 0,
        y: 0,
        visible: false,
    };

    function handleMouseOver(event, node) {
        if (node) {
            const [x, y] = d3.pointer(event);
            hover = {
                iso: node.data.count,
                x,
                y,
                visible: true,
            };
        } else {
            hover.visible = false;
        }
    }

    function handleMouseMove(event) {
        const [x, y] = d3.pointer(event);
        hover.x = x;
        hover.y = y;
    }

    function handleMouseOut() {
        hover.visible = false;
    }

    $: if (hover.iso) {
        updateTextWidth();
    }
</script>

<g transform="rotate({node.x - 90})translate({node.y})">
    <circle
        r={$radius}
        on:mouseover={(e) => handleMouseOver(e, node)}
        on:mousemove={handleMouseMove}
        on:mouseout={handleMouseOut}
    ></circle>

    <!-- Label group to apply same transform to rect and text -->
    <g transform="rotate({node.x >= 180 ? 180 : 0})">
        <!-- Background rectangle behind text -->
        <rect
            x={(node.x < 180 ? 0 : -0) + bbox.x - 2}
            y={bbox.y - 1}
            width={bbox.width + 4}
            height={bbox.height + 2}
            fill={node.data.key == undefined ? "none" : "white"}
            rx="2"
            ry="2"
        />

        <!-- Label text -->
        <text
            bind:this={textElement}
            x={node.x < 180 ? 15 : -15}
            dy="0.32em"
            text-anchor={node.x < 180 ? "start" : "end"}
            font-size="10"
            opactity={node.data.key == undefined ? 0 : 1}
            class={"node " + node.data.key}
            fill="black"
            stroke="white"
            stroke-width="2"
            paint-order="stroke fill"
            font-family="Montserrat"
        >
            {name}
        </text>
    </g>
    {#if hover.visible}
        <g
            transform="translate({hover.x + 10}, {hover.y -
                10}) rotate({node.x >= 180 ? 180 : 0})"
        >
            <rect
                x={node.x >= 180 ? -25 : 0}
                y={node.x >= 180 ? -15 : 0}
                width={textWidth + 10}
                height="20"
                fill="black"
                rx="3"
            />
            <text
                x={node.x >= 180 ? -20 : 5}
                y={node.x >= 180 ? 0 : 15}
                font-size="12"
                fill="white"
                bind:this={textEl}
            >
                {hover.iso}
            </text>
        </g>
    {/if}
</g>

<style>
    circle {
        fill: #333333;
    }
    :global(.undefined) {
        opacity: 0;
    }
</style>
