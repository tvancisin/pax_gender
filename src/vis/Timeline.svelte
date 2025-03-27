<script>
    import * as d3 from "d3";
    import IndividualRectangle from "./IndividualRectangle.svelte";
    import { years } from "../utils";
    import Background from "./BackgroundRectangle.svelte";

    export let pax;
    export let pax_timeline;
    export let step;

    let width = 400;
    let height = 400;
    let rendered_data;
    let background_data;
    let innerWidth, innerHeight, xScale, yScale;
    let imageX;
    let imageSource = "./img/lome.png";
    let exampleImg;
    let imageHeight; 
    let margin = { top: 20, right: 20, bottom: 20, left: 40 };

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

            const currentYear = d.Dat.substring(6, 10);
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
        d3.selectAll(".un_resolution").style("visibility", "hidden");
        // all agreements
        rendered_data = position_calc(pax, innerWidth, "none");
    } else if (step == "2") {
        d3.selectAll(".un_resolution").style("visibility", "visible");
        // gender agreements
        rendered_data = position_calc(pax, innerWidth, "GeWom");
    } else if (step == "3") {
        d3.selectAll(".un_resolution").style("visibility", "visible");
        // gender agreements
        rendered_data = position_calc(pax, innerWidth, "GeWom");
    } else if (step == "4") {
        d3.selectAll(".un_resolution").style("visibility", "hidden");
        d3.selectAll("#example").style("opacity", 0);
        // rehabilitation agreements
        rendered_data = position_calc(pax, innerWidth, "WggRehab");
    } else if (step == "5") {
        d3.selectAll("#example").style("opacity", 1);
        imageSource = "./img/lome.png";
        agt_path_year = "1999";
        // rehabilitation agreements
        rendered_data = position_calc(pax, innerWidth, "WggRehab");
    } else if (step == "6") {
        d3.selectAll("#example").style("opacity", 0);
        // implementation agreements
        rendered_data = position_calc(pax, innerWidth, "WggImplRole");
    } else if (step == "7") {
        d3.selectAll("#example").style("opacity", 1);
        imageSource = "./img/colombia.png";
        agt_path_year = "2016";
        // implementation agreements
        rendered_data = position_calc(pax, innerWidth, "WggImplRole");
    } else if (step == "8") {
        d3.selectAll("#example").style("opacity", 0);
        // human rights agreements
        rendered_data = position_calc(pax, innerWidth, "WggHR");
    } else if (step == "9") {
        imageSource = "./img/guatemala.png";
        d3.selectAll("#example").style("opacity", 1);
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
                                xScale.bandwidth() / 2},{innerHeight + 17})"
                        >
                            <text y="1"
                                >{innerWidth > 800
                                    ? tick
                                    : formatMobile(tick)}</text
                            >
                        </g>
                    {/each}
                </g>
                {#each background_data as d, i}
                    <Background
                        {i}
                        x={d.x}
                        y={d.y}
                        width={d.width}
                        height={d.height}
                        info={d.info}
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
                    />
                {/each}

                <rect
                    class="un_resolution"
                    x={xScale("2000") + xScale.bandwidth() / 2}
                    y={20}
                    width="1"
                    height={innerHeight - 100}
                    fill="white"
                />

                {#if lineEnd}
                    <path
                        id="example"
                        d={`M ${xScale(agt_path_year)},${innerHeight - 10} 
                       C ${xScale(agt_path_year)},${innerHeight - 100} 
                         ${imageX - margin.left},${lineEnd + 100} 
                         ${imageX - margin.left},${lineEnd}`}
                        fill="none"
                        stroke="white"
                        stroke-width="1"
                        opacity="0"
                    />
                {/if}

                <text
                    class="un_resolution"
                    x={xScale("2000") + xScale.bandwidth()}
                    y={20}
                    fill="white">UN Resolution 1325</text
                >
            </g>
        </svg>
        <div id="example">
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
    .tick {
        font-size: 0.725em;
        font-weight: 200;
    }

    .un_resolution {
        visibility: hidden;
    }

    .tick text {
        fill: white;
        text-anchor: start;
        font-size: 12px;
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
        opacity: 0;
        transition: 0.5s ease;
    }

    #example img {
        position: absolute;
        top: 0px;
        max-width: 80%;
        height: auto;
        display: block;
    }
</style>
