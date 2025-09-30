<script>
    import IndividualRectangle from "./IndividualRectangle.svelte";
    import Background from "./BackgroundRectangle.svelte";
    import * as d3 from "d3";
    import { fade } from "svelte/transition";
    import { years, pax_stages_grid, pax_stages_filter_grid } from "../utils";
    import Canvas from "./Canvas.svelte";
    import CanvasRectangle from "./CanvasRectangle.svelte";
    import CanvasBackground from "./CanvasBackground.svelte";

    export let pax;
    export let pax_stages;
    export let step;

    let tooltip = { visible: false, x: 0, y: 0, info: "" };
    let width = 400;
    let imageSource = null;
    let exampleImg;
    let imageX;
    let imageHeight;
    let height = 400;
    let rendered_data;
    let background_data;
    let initialPaxCount;
    let innerWidth, innerHeight, xScale, yScale;
    let stages = [
        "Pre-Negotiation",
        "Ceasefire",
        "Partial",
        "Comprehensive",
        "Implementation",
        "Renewal",
        "Other",
    ];

    let margin = { top: 20, right: 80, bottom: 20, left: 100 };

    $: innerWidth = width - margin.left - margin.right;
    $: innerHeight = height - margin.top - margin.bottom;
    $: column_width = innerWidth / 7;

    $: xScale = d3
        .scaleBand()
        .domain(years)
        .range([0, innerWidth])
        .padding(0.1);

    $: yScale = d3.scaleLinear().domain([0, 100]).range([innerHeight, 0]);

    //initial functions
    $: if (pax && pax_stages) {
        //prepare the initial grid
        initialPaxCount = pax.length;
        rendered_data = pax_stages_grid(pax_stages, innerHeight, innerWidth);
        background_data = pax_stages_grid(pax_stages, innerHeight, innerWidth);
    }

    //steps
    $: if (step == "stage01") {
        //full stages
        rendered_data = pax_stages_grid(pax_stages, innerHeight, innerWidth);
    } else if (step == "stage02") {
        //gender stages
        rendered_data = pax_stages_filter_grid(
            pax_stages,
            innerHeight,
            innerWidth,
            "GeWom",
        );
        imageSource = null;
    } else if (step == "stage03") {
        imageSource = "./img/africa.png";
    }

    function formatMobile(tick) {
        return "'" + tick.toString().slice(-2);
    }

    // Function to update the height of the image
    function updateImageHeight() {
        if (exampleImg) {
            const rect = exampleImg.getBoundingClientRect();
            imageHeight = rect.height; // Image height
            imageX = rect.x; // Image x position
        }
    }

    let lineEnd;
    $: if (innerHeight) {
        lineEnd = innerHeight - (innerHeight - imageHeight);
    }
</script>

{#if rendered_data}
    <div class="wrapper" bind:clientWidth={width} bind:clientHeight={height}>
        <svg {width} {height}>
            <g
                class="timeline"
                transform="translate({margin.left}, {margin.top})"
            >
                {#each stages as d, i}
                    <text
                        x={column_width * i + column_width / 2}
                        y={innerHeight + 14}
                        text-anchor="middle"
                        font-family="Montserrat"
                        fill="black"
                        font-size="14px">{d}</text
                    >
                {/each}
                <!--
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
            </g> -->
                {#if imageSource}
                    {#if lineEnd}
                        <path
                            d={`M ${column_width * 2},${innerHeight - 30} 
                       C ${column_width * 2},${innerHeight - 100} 
                         ${imageX},${lineEnd + 100} 
                         ${imageX},${lineEnd}`}
                            fill="none"
                            stroke="black"
                            stroke-width="1"
                            transition:fade={{ duration: 400 }}
                        />
                    {/if}
                {/if}
            </g></svg
        >
        <div style="position: absolute; top: 0; left: 0;">
            <Canvas {width} {height} --position="absolute">
                {#each background_data as d, i}
                    <CanvasBackground
                        x={d.x}
                        y={d.y}
                        width={d.width}
                        height={d.height}
                        {margin}
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
                        {margin}
                    />
                {/each}
            </Canvas>
        </div>

        <div id="example_stage">
            {#if imageSource}
                <img
                    class="img"
                    src={imageSource}
                    alt="agt"
                    bind:this={exampleImg}
                    transition:fade={{ duration: 400 }}
                    on:load={updateImageHeight}
                />
            {/if}
        </div>
    </div>
{/if}

<style>
    .wrapper {
        height: 90vh;
        position: relative;
    }

    #example_stage {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        overflow: hidden;
        transition: 0.2s ease;
        pointer-events: none;
    }

    #example_stage img {
        position: absolute;
        background-color: #33333399;
        border-radius: 5px;
        top: 0px;
        max-width: 80%;
        padding: 10px;
        height: auto;
        display: block;
    }
</style>
