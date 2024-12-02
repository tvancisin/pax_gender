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

    let transform = d3.zoomIdentity;
    let newTransform;

    let width = 400;
    let height = 400;
    let cumulative_isos;
    let innerWidth, innerHeight, xScale, yScale;
    const margin = { top: 20, right: 20, bottom: 20, left: 40 };

    $: projection = d3.geoNaturalEarth1().fitSize([width, height], mygeojson);
    $: pathGenerator = d3.geoPath(projection);

    let countries = [];
    $: if (mygeojson)
        countries = mygeojson.features.map((feature) => {
            return {
                ...feature,
                path: pathGenerator(feature),
                bounds: pathGenerator.bounds(feature),
                centroid: pathGenerator.centroid(feature), // Get the country's central point
            };
        });

    let afg;
    let x0, y0, x1, y1;
    $: if (countries.length > 0) {
        afg = countries.find((d) => d.properties.admin == "Afghanistan");
        [[x0, y0], [x1, y1]] = afg.bounds;
    }

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

    function smoothZoom(newTransform) {
        const interpolate = d3.interpolateTransformSvg(transform, newTransform);
        d3.transition()
            .duration(750)
            .tween("zoom", () => (t) => {
                transform = interpolate(t);
            });
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
        smoothZoom(d3.zoomIdentity);
    } else if (step == "map_four") {
        let just_quotas = d3.groups(pax, (d) => d.WggUnsc);
        cumulative_isos = get_current_isos(just_quotas[1][1]);
        // current_central_points = get_current_central_points(pax_gender);
        newTransform = d3.zoomIdentity
            .translate(width / 2, height / 2)
            .scale(
                Math.min(
                    8,
                    0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height),
                ),
            )
            .translate(-(x0 + x1) / 2, -(y0 + y1) / 2);

        smoothZoom(newTransform);
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
                    <Map {countries} {transform} {cumulative_isos} />
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
