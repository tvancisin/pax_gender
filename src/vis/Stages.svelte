<script>
    import * as d3 from "d3";
    import IndividualRectangle from "./IndividualRectangle.svelte";
    import { years, pax_stages_grid, pax_stages_filter_grid } from "../utils";
    import Background from "./BackgroundRectangle.svelte";

    export let pax;
    export let pax_stages;
    export let step;

    let width = 400;
    let imageSource = "./img/africa.png";
    let exampleImg;
    let imageX;
    let imageHeight; // Reactive variable for the image height
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

    const margin = { top: 20, right: 20, bottom: 20, left: 40 };

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
        d3.selectAll("#example_stage").style("opacity", 0);
    } else if (step == "stage03") {
        d3.selectAll("#example_stage").style("opacity", 1);
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

    // $: console.log("rendered data: ", rendered_data);
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
                        fill="white"
                        font-size="14px">{d}</text
                    >
                {/each}
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
                    />
                {/each}
            </g>
            {#if lineEnd}
                <path
                    id="example_stage"
                    d={`M ${column_width*2},${innerHeight - 30} 
                       C ${column_width*2},${innerHeight - 100} 
                         ${imageX },${lineEnd + 100} 
                         ${imageX},${lineEnd}`}
                    fill="none"
                    stroke="white"
                    stroke-width="1"
                    opacity="0"
                />
            {/if}
        </svg>
        <div id="example_stage">
            <img
                class="example_img"
                src={imageSource}
                alt="agt"
                bind:this={exampleImg}
                on:load={updateImageHeight}
            />
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
        width: 100%; /* Full width of the parent/container */
        height: 100%; /* Full height of the parent/container if needed */
        display: flex; /* Enables flexbox for centering */
        justify-content: center;
        overflow: hidden; /* Prevents content overflow */
        opacity: 0;
        transition: 0.5s ease;
    }

    #example_stage img {
        position: absolute;
        top: 0px;
        max-width: 80%; /* Ensures the image scales within the width of its container */
        height: auto; /* Maintains the aspect ratio of the image */
        display: block; /* Removes extra space below the image (from inline elements) */
    }
</style>
