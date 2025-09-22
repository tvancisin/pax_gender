<script>
    import * as d3 from "d3";
    import { years, full_grid, full_grid_filter } from "../utils";
    // import Background from "./BackgroundRectangle.svelte";
    // import IndividualRectangle from "./IndividualRectangle.svelte";

    // canvas variation
    import Canvas from "./Canvas.svelte";
    import CanvasRectangle from "./CanvasRectangle.svelte";
    import CanvasBackground from "./CanvasBackground.svelte";

    export let pax;
    export let step;

    let tooltip = { visible: false, x: 0, y: 0, info: "" }; // Tooltip state
    let width = 400;
    let height = 400;
    let rendered_data;
    let background_data;
    let initialPaxCount;
    let innerWidth, innerHeight, xScale, yScale;
    const margin = { top: 20, right: 80, bottom: 20, left: 100 };

    $: innerWidth = width - margin.left - margin.right;
    $: innerHeight = height - margin.top - margin.bottom;

    $: xScale = d3
        .scaleBand()
        .domain(years)
        .range([0, innerWidth])
        .padding(0.1);

    $: yScale = d3.scaleLinear().domain([0, 100]).range([innerHeight, 0]);

    //initial functions
    $: if (pax) {
        //prepare the initial grid
        initialPaxCount = pax.length;
        rendered_data = full_grid(
            pax,
            innerHeight,
            innerWidth,
            initialPaxCount,
        );
        //background rect outlines
        background_data = full_grid(
            pax,
            innerHeight,
            innerWidth,
            initialPaxCount,
        );
    }

    //steps
    $: if (step == "rect01") {
        // full grid
        rendered_data = full_grid(
            pax,
            innerHeight,
            innerWidth,
            initialPaxCount,
        );
    } else if (step == "rect02") {
        //full grid gender
        rendered_data = full_grid_filter(
            pax,
            innerHeight,
            innerWidth,
            initialPaxCount,
        );
    }

    function formatMobile(tick) {
        return "'" + tick.toString().slice(-2);
    }

    // Event handlers for tooltip
    const handleHover = (event) => {
        let dyn_x;
        let dyn_y;
        if (event.detail.x >= innerWidth / 2) {
            dyn_x = event.detail.x - 140;
        } else if (event.detail.x < innerWidth / 2) {
            dyn_x = event.detail.x + 70;
        }

        if (event.detail.y >= innerHeight / 2) {
            dyn_y = event.detail.y - 50;
        } else if (event.detail.y < innerHeight / 2) {
            dyn_y = event.detail.y;
        }

        tooltip = {
            visible: true,
            x: dyn_x,
            y: dyn_y,
            info: event.detail.info,
        };
    };

    const handleLeave = () => {
        tooltip = { ...tooltip, visible: false };
    };
</script>

{#if rendered_data}
    <div class="wrapper" bind:clientWidth={width} bind:clientHeight={height}>
        <!-- <svg {width} {height}>
            <g
                class="timeline"
                transform="translate({margin.left}, {margin.top})"
            >
                {#each background_data as d, i}
                    <Background
                        {i}
                        x={d.x}
                        y={d.y}
                        width={d.width}
                        height={d.height}
                    />
                {/each}
                {#each rendered_data as d, i}
                    <IndividualRectangle
                        {i}
                        x={d.x}
                        y={d.y}
                        width={d.width}
                        height={d.height}
                        info={d.info}
                        id={d.id}
                        on:hover={handleHover}
                        on:leave={handleLeave}
                    />
                {/each}
            </g>
        </svg> -->
        <Canvas {width} {height} --position="absolute">
            {#each background_data as d, i}
                <CanvasBackground
                    x={d.x}
                    y={d.y}
                    width={d.width}
                    height={d.height}
                    margin={margin}
                />
            {/each}
        </Canvas>
        <Canvas {width} {height}>
            {#each rendered_data as d, i}
                <CanvasRectangle
                    {i}
                    x={d.x}
                    y={d.y}
                    width={d.width}
                    height={d.height}
                    margin={margin}
                />
            {/each}
        </Canvas>

        {#if tooltip.visible}
            <div
                class="tooltip"
                style="position: absolute; left: {tooltip.x}px; top: {tooltip.y}px;"
            >
                <p>{tooltip.info}</p>
            </div>
        {/if}
    </div>
{/if}

<style>
    .wrapper {
        height: 90vh;
        position: relative;
    }

    .tooltip {
        background-color: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 10px;
        border-radius: 2px;
        pointer-events: none;
        transition: opacity 0.3s ease;
        width: 150px;
    }

    p {
        margin: 5px;
        font-size: 12px;
    }
</style>
