<script>
    // import IndividualRectangle from "./IndividualRectangle.svelte";
    // import Background from "./BackgroundRectangle.svelte";
    import * as d3 from "d3";
    import { fade } from "svelte/transition";
    import { years } from "../utils";
    import Canvas from "./Canvas.svelte";
    import CanvasRectangle from "./CanvasRectangle.svelte";
    import CanvasBackground from "./CanvasBackground.svelte";

    export let pax;
    export let pax_timeline;
    export let step;

    let width = 400;
    let height = 400;
    let rendered_data;
    let background_data;
    let innerWidth, innerHeight, xScale, yScale;
    let imageX;
    let imageSource = null;
    let exampleImg;
    let imageHeight;
    let margin = { top: 20, right: 80, bottom: 20, left: 100 };

    $: innerWidth = width - margin.left - margin.right;
    $: innerHeight = height - margin.top - margin.bottom;

    // Attach event listener to window resize
    window.addEventListener("resize", updateImageHeight);

    $: xScale = d3
        .scaleBand()
        .domain(years)
        .range([0, innerWidth])
        .padding(0.1);

    $: yScale = d3.scaleLinear().domain([0, 100]).range([innerHeight, 0]);

    function position_calc(pax, innerWidth, filter) {
        let previousYear = null; // Track the last year seen
        let index;
        index = filter === "none" ? 0 : -1;

        let calculated_positions = pax.map((d) => {
            let yPosition;

            const currentYear = d.Dat.substring(0, 4);
            // Reset index if the year has changed
            if (currentYear !== previousYear) {
                index = filter === "none" ? 0 : -1;
                previousYear = currentYear;
            }

            if (filter == "none") {
                yPosition = yScale(index);
            } else {
                yPosition =
                    d[filter] === "1" ? yScale(++index) : innerHeight + 100;
            }

            const result = {
                x: xScale(currentYear) + Math.random() * 2 - 1,
                y: yPosition + Math.random() * 2 - 1,
                width: xScale.bandwidth(),
                height: 3,
                info: d.Agt,
                id: d.AgtId,
            };

            if (filter === "none") index++;
            return result;
        });
        return calculated_positions;
    }

    let agt_path_year = "1999";
    //initial functions
    $: if (pax) {
        // background unfilled rectangles
        background_data = position_calc(pax, innerWidth, "none");
        // filled rectangles
        rendered_data = position_calc(pax, innerWidth, "none");
    }

    //steps
    $: if (step == "1") {
        // all agreements
        rendered_data = position_calc(pax, innerWidth, "none");
    } else if (step == "4") {
        imageSource = null; // hide image
        rendered_data = position_calc(pax, innerWidth, "WggRehab");
    } else if (step == "5") {
        imageSource = "./img/lome.png";
        agt_path_year = "1999";
        rendered_data = position_calc(pax, innerWidth, "WggRehab");
    } else if (step == "6") {
        imageSource = null;
        rendered_data = position_calc(pax, innerWidth, "WggImplRole");
    } else if (step == "7") {
        imageSource = "./img/colombia.png";
        agt_path_year = "2016";
        rendered_data = position_calc(pax, innerWidth, "WggImplRole");
    } else if (step == "8") {
        imageSource = null;
        rendered_data = position_calc(pax, innerWidth, "WggHR");
    } else if (step == "9") {
        imageSource = "./img/guatemala.png";
        agt_path_year = "1996";
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

    // Call the function on initial load to set the height
    updateImageHeight();
</script>

{#if rendered_data && pax_timeline}
    <div class="wrapper" bind:clientWidth={width} bind:clientHeight={height}>
        <svg {width} {height}>
            <g
                class="timeline"
                transform="translate({margin.left}, {margin.top})"
            >
                <g class="axis x-axis">
                    {#each years as tick}
                        <g
                            class="tick tick-{tick}"
                            transform="translate({xScale(tick) +
                                xScale.bandwidth() / 2},{innerHeight + 15})"
                        >
                            <text y="1"
                                >{innerWidth > 800
                                    ? tick
                                    : formatMobile(tick)}</text
                            >
                        </g>
                    {/each}
                </g>
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
                        id={d.id}
                        x={d.x}
                        y={d.y}
                        width={d.width}
                        height={d.height}
                        info={d.info}
                        on:hover={handleHover}
                        on:leave={handleLeave}
                    />
                {/each}-->

                {#if imageSource}
                    {#if lineEnd}
                        <path
                            d={`M ${xScale(agt_path_year)},${innerHeight - 10} 
                       C ${xScale(agt_path_year)},${innerHeight - 100} 
                         ${imageX - margin.left},${lineEnd + 100} 
                         ${imageX - margin.left},${lineEnd}`}
                            fill="none"
                            stroke="black"
                            stroke-width="1"
                            transition:fade={{ duration: 400 }}
                        />
                    {/if}
                {/if}
            </g>
        </svg>

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

        <div id="example">
            {#if imageSource}
                <img
                    class="example_img"
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
    .tick {
        font-size: 0.725em;
        font-weight: 200;
    }

    .un_resolution {
        visibility: hidden;
    }

    .tick text {
        fill: black;
        text-anchor: start;
        font-size: 10px;
        font-family: "Montserrat";
        font-weight: 400;
    }

    @media only screen and (max-width: 1200px) {
        .tick text {
            font-size: 11px;
        }
    }

    @media only screen and (max-width: 768px) {
        .tick text {
            font-size: 10px;
        }
    }

    .x-axis .tick text {
        text-anchor: middle;
    }

    #example {
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

    #example img {
        position: absolute;
        background-color: #33333399;
        border-radius: 5px;
        top: 0px;
        max-width: 80%;
        padding: 10px;
        height: auto;
        display: block;
    }

    .un_resolution {
        visibility: hidden;
    }
</style>
