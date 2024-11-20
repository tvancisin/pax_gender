<script>
    import * as d3 from "d3";
    import IndividualLine from "./IndividualLine.svelte";
    import { LayerCake, Svg } from "layercake";
    import Map from "./Map.svelte";
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
        // current_central_points = get_current_central_points(pax);
        cumulative_isos = get_current_isos(pax);
    }

    //steps
    $: if (step == "map_one") {
        cumulative_isos = get_current_isos(pax);
    } else if (step == "map_two") {
        cumulative_isos = get_current_isos(pax_gender);
        // current_central_points = get_current_central_points(pax_gender);
    } else if (step == "map_three") {
        let just_quotas = d3.groups(pax, (d) => d.WggIntLaw);
        cumulative_isos = get_current_isos(just_quotas[1][1]);
        // current_central_points = get_current_central_points(pax_gender);
    } else if (step == "map_four") {
        let just_quotas = d3.groups(pax, (d) => d.WggUnsc);
        cumulative_isos = get_current_isos(just_quotas[1][1]);
        // current_central_points = get_current_central_points(pax_gender);
    }

    function formatMobile(tick) {
        return "'" + tick.toString().slice(-2);
    }

    // $: console.log("rendered data: ", rendered_data);
    // $: console.log("central points: ", central_points);
</script>

{#if mygeojson && pax_timeline}
    <div class="wrapper" bind:clientWidth={width} bind:clientHeight={height}>
        {#if mygeojson}
            <LayerCake data={mygeojson}>
                <Svg>
                    <Map
                        projectionName={"geoNaturalEarth1"}
                        {cumulative_isos}
                        {step}
                    />
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
