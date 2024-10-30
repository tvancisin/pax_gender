<script>
    import * as d3 from "d3";
    import IndividualLine from "./IndividualLine.svelte";
    import { LayerCake, Svg } from "layercake";
    import Map1 from "./Map1.svelte";
    import {
        years,
        most_women,
        get_current_isos,
        get_current_central_points,
    } from "../utils";
    import Point from "./Point.svelte";

    export let pax;
    export let mygeojson;
    export let pax_timeline;
    export let pax_gender;
    export let step;
    export let central_points;

    let width = 400;
    let height = 400;
    let rendered_data;
    let current_pax;
    let current_years;
    let current_central_points;
    let cumulative_isos;
    let reorder = true;
    let innerWidth, innerHeight, xScale, yScale;
    const margin = { top: 20, right: 20, bottom: 20, left: 40 };

    $: innerWidth = width - margin.left - margin.right;
    $: innerHeight = height - margin.top - margin.bottom;

    $: xScale = d3
        .scaleBand()
        .domain(years)
        .range([0, innerWidth])
        .padding(0.1);

    $: yScale = d3.scaleLinear().domain([0, 100]).range([100, 0]);

    //init
    $: if (pax) {
        // current_years = pax_timeline.map((d) => d[0]);
        current_central_points = get_current_central_points(pax);
        cumulative_isos = get_current_isos(pax);

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
                x1: xScale(currentYear) + Math.random(),
                x2: xScale.bandwidth() + Math.random(),
                y1: yScale(index),
                y2: yScale(index),
            };

            index += 1; // Increment index for the next entry in the same year
            return result;
        });
    }

    $: if (step == "1") {
        current_central_points = get_current_central_points(pax);
        cumulative_isos = get_current_isos(pax);

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
                x1: xScale(currentYear),
                x2: xScale.bandwidth(),
                y1: yScale(index),
                y2: yScale(index),
            };

            index += 1; // Increment index for the next entry in the same year
            return result;
        });
    } else if (step == "2") {
        current_central_points = get_current_central_points(pax_gender);
        cumulative_isos = get_current_isos(pax_gender);

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
            const yPosition = d.GeWom === "1" ? yScale(++index) : 150;

            return {
                x1: xScale(currentYear),
                x2: xScale.bandwidth(),
                y1: yPosition,
                y2: yPosition,
            };
        });
    } else if (step == "3" && pax_timeline) {
        current_central_points = get_current_central_points(pax_gender);
        cumulative_isos = get_current_isos(pax_gender);

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
            const yPosition = d.WggGenQuot === "1" ? yScale(++index) : 150;

            return {
                x1: xScale(currentYear),
                x2: xScale.bandwidth(),
                y1: yPosition,
                y2: yPosition,
            };
        });
    }

    function formatMobile(tick) {
        return "'" + tick.toString().slice(-2);
    }

    $: console.log("rendered data: ", rendered_data);
    $: console.log("central points: ", central_points);
</script>

{#if rendered_data && mygeojson}
    <div class="wrapper" bind:clientWidth={width} bind:clientHeight={height}>
        {#if mygeojson}
            <LayerCake data={mygeojson}>
                <Svg>
                    <Map1
                        projectionName={"geoNaturalEarth1"}
                        {cumulative_isos}
                    />
                    <!-- <Point
                        projectionName={"geoNaturalEarth1"}
                        pointsData={current_central_points}
                    /> -->
                    <g
                        transform="translate({margin.left}, {innerHeight -
                            150})"
                    >
                        <g class="axis x-axis">
                            {#each years as tick}
                                <g
                                    class="tick tick-{tick}"
                                    transform="translate({xScale(tick) +
                                        xScale.bandwidth() / 2},{220})"
                                >
                                    <text y="-2"
                                        >{innerWidth > 380
                                            ? tick
                                            : formatMobile(tick)}</text
                                    >
                                </g>
                            {/each}
                        </g>

                        {#each rendered_data as d}
                            <IndividualLine
                                x1={d.x1}
                                x2={d.x2}
                                y1={d.y1}
                                y2={d.y2}
                            />
                        {/each}
                    </g>
                </Svg>
            </LayerCake>
        {/if}
        <!-- <svg {width} {height}>
            <g transform="translate({margin.left}, {innerHeight - 200})">
                <g class="axis x-axis">
                    {#each years as tick}
                        <g
                            class="tick tick-{tick}"
                            transform="translate({xScale(tick) +
                                xScale.bandwidth() / 2},{235})"
                        >
                            <text y="-2"
                                >{innerWidth > 380
                                    ? tick
                                    : formatMobile(tick)}</text
                            >
                        </g>
                    {/each}
                </g>

                {#each current_pax as [year, entries]}
                    <IndividualLine
                        x={xScale(year)}
                        y={yScale(entries.length)}
                        {innerHeight}
                        width={xScale.bandwidth()}
                        {entries}
                        {reorder}
                    />
                {/each}
            </g>
        </svg> -->
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

    .tick text {
        fill: black;
        text-anchor: start;
        font-size: 10px;
    }

    .x-axis .tick text {
        text-anchor: middle;
    }
</style>
