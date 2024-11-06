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
        full_grid,
        pax_stages_grid,
        pax_stages_filter_grid,
        full_grid_filter,
    } from "../utils";
    import Point from "./Point.svelte";

    export let pax;
    export let pax_stages;
    export let mygeojson;
    export let pax_timeline;
    export let pax_gender;
    export let step;
    export let central_points;

    let width = 400;
    let height = 400;
    let rendered_data;
    let gap = 2;
    let current_pax;
    let current_years;
    let current_central_points;
    let cumulative_isos;
    let reorder = true;
    let initialPaxCount;
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

    //initial functions
    $: if (pax && pax_stages) {
        // current_years = pax_timeline.map((d) => d[0]);
        // current_central_points = get_current_central_points(pax);
        // cumulative_isos = get_current_isos(pax);

        //prepare the initial grid
        initialPaxCount = pax.length;
        rendered_data = full_grid(
            pax,
            innerHeight,
            innerWidth,
            initialPaxCount,
            gap,
        );
    }

    //steps
    $: if (step == "stage01") {
        //full grid
        rendered_data = full_grid(
            pax,
            innerHeight,
            innerWidth,
            initialPaxCount,
            gap,
        );
    } else if (step == "stage02") {
        //full grid gender
        rendered_data = full_grid_filter(
            pax,
            innerHeight,
            innerWidth,
            initialPaxCount,
            gap,
        );
    } else if (step == "stage03") {
        //stages full 
        rendered_data = pax_stages_grid(pax_stages, innerHeight, innerWidth);
    } else if (step == "stage04") {
        //stages gender 
        rendered_data = pax_stages_filter_grid(
            pax_stages,
            innerHeight,
            innerWidth,
            "GeWom",
        );
        // let just_quotas = d3.groups(pax, (d) => d.WggGenQuot);
        // console.log(just_quotas);

        // current_central_points = get_current_central_points(pax_gender);
        // cumulative_isos = get_current_isos(just_quotas[1][1]);


        //pax quotas timeline
        // let previousYear = null; // Track the last year seen
        // let index = 0; // Index that changes based on GeWom value
        // rendered_data = pax.map((d) => {
        //     const currentYear = d.Dat.substring(6, 10);

        //     // Reset index if the year has changed
        //     if (currentYear !== previousYear) {
        //         index = 0;
        //         previousYear = currentYear;
        //     }

        //     // Determine y position based on GeWom value
        //     const yPosition =
        //         d.WggGenQuot === "1" ? yScale(++index) : innerHeight + 100;

        //     return {
        //         x: xScale(currentYear),
        //         y: yPosition,
        //         width: xScale.bandwidth(),
        //         height: 1,
        //     };
        // });
    } 
    // else if (step == "5") {
    //     let just_quotas = d3.groups(pax, (d) => d.WggIntLaw);
    //     console.log(just_quotas);

    //     current_central_points = get_current_central_points(pax_gender);
    //     cumulative_isos = get_current_isos(just_quotas[1][1]);

    //     // ALLPAX timeline
    //     let previousYear = null; // Track the last year seen
    //     let index = 0; // Index that resets for each new year
    //     rendered_data = pax.map((d) => {
    //         const currentYear = d.Dat.substring(6, 10);

    //         // Reset index if the year has changed
    //         if (currentYear !== previousYear) {
    //             index = 0;
    //             previousYear = currentYear;
    //         }

    //         const result = {
    //             x: xScale(currentYear),
    //             y: yScale(index),
    //             width: xScale.bandwidth(),
    //             height: 1,
    //         };

    //         index += 1; // Increment index for the next entry in the same year
    //         return result;
    //     });

    //     // //pax law timeline
    //     // let previousYear = null; // Track the last year seen
    //     // let index = 0; // Index that changes based on GeWom value
    //     // rendered_data = pax.map((d) => {
    //     //     const currentYear = d.Dat.substring(6, 10);

    //     //     // Reset index if the year has changed
    //     //     if (currentYear !== previousYear) {
    //     //         index = 0;
    //     //         previousYear = currentYear;
    //     //     }

    //     //     // Determine y position based on GeWom value
    //     //     const yPosition =
    //     //         d.WggIntLaw === "1" ? yScale(++index) : innerHeight + 100;

    //     //     return {
    //     //         x: xScale(currentYear),
    //     //         y: yPosition,
    //     //         width: xScale.bandwidth(),
    //     //         height: 1,
    //     //     };
    //     // });
    // } else if (step == "6") {
    //     let just_quotas = d3.groups(pax, (d) => d.WggUnsc);

    //     current_central_points = get_current_central_points(pax_gender);
    //     cumulative_isos = get_current_isos(just_quotas[1][1]);

    //     //PAX gender timeline
    //     let previousYear = null; // Track the last year seen
    //     let index = 0; // Index that changes based on GeWom value
    //     rendered_data = pax.map((d) => {
    //         const currentYear = d.Dat.substring(6, 10);

    //         // Reset index if the year has changed
    //         if (currentYear !== previousYear) {
    //             index = 0;
    //             previousYear = currentYear;
    //         }

    //         // Determine y position based on GeWom value
    //         const yPosition = d.GeWom === "1" ? yScale(++index) : innerHeight + 100;

    //         return {
    //             x: xScale(currentYear),
    //             y: yPosition,
    //             width: xScale.bandwidth(),
    //             height: 1,
    //         };
    //     });

    //     //pax un timeline
    //     // let previousYear = null; // Track the last year seen
    //     // let index = 0; // Index that changes based on GeWom value
    //     // rendered_data = pax.map((d) => {
    //     //     const currentYear = d.Dat.substring(6, 10);

    //     //     // Reset index if the year has changed
    //     //     if (currentYear !== previousYear) {
    //     //         index = 0;
    //     //         previousYear = currentYear;
    //     //     }

    //     //     // Determine y position based on GeWom value
    //     //     const yPosition =
    //     //         d.WggUnsc === "1" ? yScale(++index) : innerHeight + 100;

    //     //     return {
    //     //         x: xScale(currentYear),
    //     //         y: yPosition,
    //     //         width: xScale.bandwidth(),
    //     //         height: 1,
    //     //     };
    //     // });
    // }

    function formatMobile(tick) {
        return "'" + tick.toString().slice(-2);
    }

    // $: console.log("rendered data: ", rendered_data);
    // $: console.log("central points: ", central_points);
</script>

{#if rendered_data && mygeojson && pax_timeline}
    <div class="wrapper" bind:clientWidth={width} bind:clientHeight={height}>
        {#if mygeojson}
            <LayerCake data={mygeojson}>
                <Svg>
                    <!-- <Map1
                        projectionName={"geoNaturalEarth1"}
                        {cumulative_isos}
                        {step}
                    /> -->
                    <Point
                        line_width={width}
                        {pax_timeline}
                        projectionName={"geoNaturalEarth1"}
                        pointsData={current_central_points}
                    />
                    <g
                        class="timeline"
                        transform="translate({margin.left}, {margin.top})"
                    >
                        <!-- <g class="axis x-axis">
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
                        </g> -->

                        {#each rendered_data as d, i}
                            <IndividualLine
                                {i}
                                x={d.x}
                                y={d.y}
                                width={d.width}
                                height={d.height}
                            />
                        {/each}
                    </g>
                </Svg>
            </LayerCake>
        {/if}
        <!-- x1={d.x1}
                                x2={d.x2}
                                y1={d.y1}
                                y2={d.y2} -->

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
