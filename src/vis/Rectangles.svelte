<script>
    import * as d3 from "d3";
    import IndividualLine from "./IndividualLine.svelte";
    import { LayerCake, Svg } from "layercake";
    import {
        years,
        full_grid,
        full_grid_hide_non_gender,
        full_grid_filter,
    } from "../utils";

    export let pax;
    export let pax_stages;
    export let mygeojson;
    export let pax_timeline;
    export let step;

    let width = 400;
    let height = 400;
    let rendered_data;
    let wom_first_pax;
    let gap = 2;
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
    $: if (step == "rect01") {
        // full grid
        rendered_data = full_grid(
            pax,
            innerHeight,
            innerWidth,
            initialPaxCount,
            gap,
        );
    } else if (step == "rect02") {
        //0 height for non-gender
        rendered_data = full_grid_hide_non_gender(
            pax,
            innerHeight,
            innerWidth,
            initialPaxCount,
            gap,
        );
        // // d3.selectAll(".non-gender").style("fill", "gray");
    } else if (step == "rect03") {

        //full grid gender
        rendered_data = full_grid_filter(
            pax,
            innerHeight,
            innerWidth,
            initialPaxCount,
            gap,
        );
    }

    function formatMobile(tick) {
        return "'" + tick.toString().slice(-2);
    }

    // $: console.log("rendered data: ", rendered_data);
</script>

{#if rendered_data && mygeojson && pax_timeline}
    <div class="wrapper" bind:clientWidth={width} bind:clientHeight={height}>
        {#if mygeojson}
            <LayerCake data={mygeojson}>
                <Svg>
                    <g
                        class="timeline"
                        transform="translate({margin.left}, {margin.top})"
                    >
                        {#each rendered_data as d, i}
                            <IndividualLine
                                {i}
                                x={d.x}
                                y={d.y}
                                width={d.width}
                                height={d.height}
                                cls={d.class}
                            />
                        {/each}
                    </g>
                </Svg>
            </LayerCake>
        {/if}
    </div>
{/if}

<style>
    .wrapper {
        height: 90vh;
        position: relative;
    }
</style>
