<script>
    import * as d3 from "d3";
    import { onDestroy } from "svelte";
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
    const margin = { top: 20, right: 20, bottom: 20, left: 40 };

    $: innerWidth = width - margin.left - margin.right;
    $: innerHeight = height - margin.top - margin.bottom;

    // source for initial image
    let imageSource = "./img/example_2.png";

    let exampleImg;
    let imageHeight; // Reactive variable for the image height

    // Attach event listener to window resize
    window.addEventListener("resize", updateImageHeight);

    $: xScale = d3
        .scaleBand()
        .domain(years)
        .range([0, innerWidth])
        .padding(0.1);

    $: yScale = d3.scaleLinear().domain([0, 100]).range([innerHeight, 0]);
    $: yHeight = d3.scaleLinear().domain([0, 40000]).range([0, innerHeight]);

    //initial functions
    $: if (pax) {
        let previousYear = null; // Track the last year seen
        let index = 0; // Index that resets for each new year

        // background unfilled rectangles
        background_data = pax.map((d) => {
            const currentYear = d.Dat.substring(6, 10);
            // Reset index if the year has changed
            if (currentYear !== previousYear) {
                index = 0;
                previousYear = currentYear;
            }

            const result = {
                x: xScale(currentYear) + Math.random() * 2 - 1,
                y: yScale(index) + Math.random() * 2 - 1,
                width: xScale.bandwidth(),
                height: 4,
                info: d.Agt,
            };

            index += 1; // Increment index for the next entry in the same year
            return result;
        });

        // filled rectangles
        rendered_data = pax.map((d) => {
            const currentYear = d.Dat.substring(6, 10);
            // Reset index if the year has changed
            if (currentYear !== previousYear) {
                index = 0;
                previousYear = currentYear;
            }

            const result = {
                x: xScale(currentYear) + Math.random() * 2 - 1,
                y: yScale(index) + Math.random() * 2 - 1,
                width: xScale.bandwidth(),
                height: 4,
                info: d.Agt,
            };

            index += 1; // Increment index for the next entry in the same year
            return result;
        });
    }
    //steps
    $: if (step == "1") {
        //full timeline
        let previousYear = null; // Track the last year seen
        let index = 0; // Index that resets for each new year
        rendered_data = pax.map((d) => {
            const currentYear = d.Dat.substring(6, 10);

            // Reset index if the year has changed
            if (currentYear !== previousYear) {
                index = 0;
                previousYear = currentYear;
            }

            const result = {
                x: xScale(currentYear) + Math.random() * 2 - 1,
                y: yScale(index) + Math.random() * 2 - 1,
                width: xScale.bandwidth(),
                height: 3,
                info: d.Agt,
                id: "id" + d.AgtId,
            };

            index += 1; // Increment index for the next entry in the same year
            return result;
        });
        d3.selectAll(".un_resolution").style("visibility", "hidden");
    } else if (step == "2") {
        let previousYear = null; // Track the last year seen
        let index = -1; // Index that changes based on GeWom value

        // background unfilled rectangles
        background_data = pax.map((d) => {
            const currentYear = d.Dat.substring(6, 10);

            // Reset index if the year has changed
            if (currentYear !== previousYear) {
                index = 0;
                previousYear = currentYear;
            }

            const result = {
                x: xScale(currentYear) + Math.random() * 2 - 1,
                y: yScale(index) + Math.random() * 2 - 1,
                width: xScale.bandwidth(),
                height: 3,
                info: d.Agt,
            };

            index += 1; // Increment index for the next entry in the same year
            return result;
        });

        // filled rectangles
        rendered_data = pax.map((d) => {
            const currentYear = d.Dat.substring(6, 10);

            // Reset index if the year has changed
            if (currentYear !== previousYear) {
                index = -1;
                previousYear = currentYear;
            }

            // Determine y position based on GeWom value
            const yPosition =
                d.GeWom === "1" ? yScale(++index) : innerHeight + 100;

            return {
                x: xScale(currentYear) + Math.random() * 2 - 1,
                y: yPosition + Math.random() * 2 - 1,
                width: xScale.bandwidth(),
                height: 3,
                info: d.info,
                id: "id" + d.AgtId,
            };
        });

        // show UN resolution line
        d3.selectAll(".un_resolution").style("visibility", "visible");
    } else if (step == "3") {
    } else if (step == "4") {
        // hide UN resolution line
        d3.selectAll(".un_resolution").style("visibility", "hidden");

        let previousYear = null; // Track the last year seen
        let index = -1; // Index that changes based on GeWom value

        // filled rectangles, only wggrehab
        rendered_data = pax.map((d) => {
            const currentYear = d.Dat.substring(6, 10);

            // Reset index if the year has changed
            if (currentYear !== previousYear) {
                index = -1;
                previousYear = currentYear;
            }

            // Determine y position based on GeWom value
            const yPosition =
                d.WggRehab === "1" ? yScale(++index) : innerHeight + 100;

            return {
                x: xScale(currentYear) + Math.random() * 2 - 1,
                y: yPosition + Math.random() * 2 - 1,
                width: xScale.bandwidth(),
                height: 3,
                info: d.info,
                id: "id" + d.AgtId,
            };
        });
        d3.selectAll("#example").style("opacity", 0);
    } else if (step == "5") {
        d3.selectAll("#example").style("opacity", 1);
    } else if (step == "6") {
        imageSource = "./img/full_agt.png";
        d3.select("#example").style("opacity", 1);
        let previousYear = null; // Track the last year seen
        let index = 0; // Index that changes based on GeWom value
        rendered_data = pax.map((d) => {
            const currentYear = d.Dat.substring(6, 10);

            // Reset index if the year has changed
            if (currentYear !== previousYear) {
                index = 0;
                previousYear = currentYear;
            }

            // Determine y position based on GeWom value
            const yPosition =
                d.WggRehab === "1" ? yScale(++index * 3) : innerHeight + 100;

            return {
                x: xScale(currentYear) + Math.random() * 2 - 1,
                y: yPosition + Math.random() * 2 - 1,
                width: xScale.bandwidth(),
                height: 3,
                info: d.info,
                id: "id" + d.AgtId,
            };
        });
    } else if (step == "7") {
        d3.select("#example").style("opacity", 0);
        let previousYear = null; // Track the last year seen
        let index = 0; // Index that changes based on GeWom value
        rendered_data = pax.map((d) => {
            const currentYear = d.Dat.substring(6, 10);

            // Reset index if the year has changed
            if (currentYear !== previousYear) {
                index = 0;
                previousYear = currentYear;
            }

            // Determine y position based on GeWom value
            const yPosition =
                d.WggImplRole === "1" ? yScale(++index * 3) : innerHeight + 100;
            const rect_height = d.WggImplRole === "1" ? 15 : 0;

            return {
                x: xScale(currentYear) + Math.random() * 2 - 1,
                y: yPosition + Math.random() * 2 - 1,
                width: xScale.bandwidth(),
                height: rect_height,
                info: d.info,
                id: "id" + d.AgtId,
            };
        });
    } else if (step == "8") {
        d3.select("#example").style("opacity", 1);
        imageSource = "./img/example_2.png";
    }

    function formatMobile(tick) {
        return "'" + tick.toString().slice(-2);
    }
    let imageX;

    $: console.log(imageX);
    

    // Function to update the height of the image
    function updateImageHeight() {
        if (exampleImg) {
            const rect = exampleImg.getBoundingClientRect();
            imageHeight = rect.height; // Image height
            imageX = rect.x; // X position
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
                    <!-- <line
                        class="lome_agt_line"
                        x1={xScale("1999")}
                        y1={innerHeight - 10}
                        x2={xScale("1990")}
                        y2={lineEnd}
                        stroke="white"
                    /> -->
                    <path
                        id="example"
                        d={`M ${xScale("1999")},${innerHeight - 10} 
                       C ${xScale("1999")},${innerHeight - 100} 
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
        width: 100%; /* Full width of the parent/container */
        height: 100%; /* Full height of the parent/container if needed */
        display: flex; /* Enables flexbox for centering */
        justify-content: center;
        overflow: hidden; /* Prevents content overflow */
        opacity: 0;
        transition: 0.5s ease;
    }

    #example img {
        position: absolute;
        top: 0px;
        max-width: 80%; /* Ensures the image scales within the width of its container */
        height: auto; /* Maintains the aspect ratio of the image */
        display: block; /* Removes extra space below the image (from inline elements) */
    }
</style>
