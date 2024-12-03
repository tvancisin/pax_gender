<script>
    import * as d3 from "d3";
    import IndividualLine from "./IndividualLine.svelte";
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
            };

            index += 1; // Increment index for the next entry in the same year
            return result;
        });
        d3.selectAll(".un_resolution").style("visibility", "hidden");
    } else if (step == "2") {
        //only pax gender
        let previousYear = null; // Track the last year seen
        let index = -1; // Index that changes based on GeWom value
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
            };
        });
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
        d3.selectAll(".un_resolution").style("visibility", "visible");
    } else if (step == "3") {
        let previousYear = null; // Track the last year seen
        let index = -1; // Index that changes based on GeWom value
        background_data = pax.map((d) => {
            const currentYear = d.Dat.substring(6, 10);
            // Reset index if the year has changed
            if (currentYear !== previousYear) {
                index = 0;
                previousYear = currentYear;
            }

            const result = {
                x: xScale(currentYear),
                y: innerHeight + 100,
                width: xScale.bandwidth(),
                height: 0,
                info: d.Agt,
            };

            index += 1; // Increment index for the next entry in the same year
            return result;
        });
    } else if (step == "4") {
        //enlarge pax gender
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
                d.GeWom === "1" ? yScale(++index * 3) : innerHeight + 100;

            return {
                x: xScale(currentYear) + Math.random() * 2 - 1,
                y: yPosition + Math.random() * 2 - 1,
                width: xScale.bandwidth(),
                height: 15,
                info: d.info,
            };
        });
        d3.selectAll(".un_resolution").style("visibility", "hidden");
    } else if (step == "5") {
        //enlarge pax gender
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
                d.WggGenQuot === "1" ? yScale(++index * 3) : innerHeight + 100;

            return {
                x: xScale(currentYear) + Math.random() * 2 - 1,
                y: yPosition + Math.random() * 2 - 1,
                width: xScale.bandwidth(),
                height: 15,
                info: d.info,
            };
        });
    } else if (step == "6") {
        //enlarge pax gender
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
                d.WggUnsc === "1" ? yScale(++index * 3) : innerHeight + 100;
            const rect_height = d.WggUnsc === "1" ? 15 : 0;

            return {
                x: xScale(currentYear) + Math.random() * 2 - 1,
                y: yPosition + Math.random() * 2 - 1,
                width: xScale.bandwidth(),
                height: rect_height,
                info: d.info,
            };
        });
    }

    function formatMobile(tick) {
        return "'" + tick.toString().slice(-2);
    }

    // $: console.log("rendered data: ", rendered_data);
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
                                >{innerWidth > 380
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
                    <IndividualLine
                        {i}
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

                <text
                    class="un_resolution"
                    x={xScale("2000") + xScale.bandwidth()}
                    y={20}
                    fill="white">UN Security Council Resolution 1325</text
                >
            </g>
        </svg>
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

    .x-axis .tick text {
        text-anchor: middle;
    }
</style>
