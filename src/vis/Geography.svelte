<script>
    import { createEventDispatcher } from "svelte";
    import * as d3 from "d3";
    import { LayerCake, Svg } from "layercake";
    import Map from "./Map.svelte";
    import { years, get_current_isos } from "../utils";
    import Point from "./Point.svelte";

    const dispatch = createEventDispatcher();

    export let pax;
    export let mygeojson;
    export let pax_timeline;
    export let pax_gender;
    export let step;
    // export let central_points;

    let transform = d3.zoomIdentity;
    let newTransform;

    let width = 400;
    let height = 400;
    let cumulative_isos;
    let innerWidth, innerHeight, xScale, yScale;
    let margin = { top: 20, right: 100, bottom: 20, left: 100 };

    $: projection = d3.geoNaturalEarth1().fitSize([innerWidth, innerHeight], mygeojson);
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

    // zoom to afghanistan
    function smoothZoom(newTransform) {
        const interpolate = d3.interpolateTransformSvg(transform, newTransform);
        d3.transition()
            .duration(750)
            .tween("zoom", () => (t) => {
                transform = interpolate(t);
            });
    }

    //initial functions
    $: if (pax) {
        // current_central_points = get_current_central_points(pax);
        cumulative_isos = get_current_isos(pax);
        dispatch("mapLoaded");
    }

    //steps
    $: if (step == "map_one") {
        cumulative_isos = get_current_isos(pax);
    } else if (step == "map_two") {
        cumulative_isos = get_current_isos(pax_gender);
        cumulative_isos = cumulative_isos.filter((entry) => entry.count > 1);
        // current_central_points = get_current_central_points(pax_gender);
        smoothZoom(d3.zoomIdentity);
    } else if (step == "map_three") {
        cumulative_isos = [{ iso: "AFG", count: 30 }];
        newTransform = d3.zoomIdentity
            .translate(width / 2, height / 2)
            .scale(
                Math.min(
                    2,
                    0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height),
                ),
            )
            .translate(-(x0 + x1) / 2, -(y0 + y1) / 2);

        smoothZoom(newTransform);
        // let just_quotas = d3.groups(pax, (d) => d.WggIntLaw);
        // cumulative_isos = get_current_isos(just_quotas[1][1]);
        // // current_central_points = get_current_central_points(pax_gender);
    } else if (step == "map_four") {
        // let just_quotas = d3.groups(pax, (d) => d.WggUnsc);
        // cumulative_isos = get_current_isos(just_quotas[1][1]);
        // current_central_points = get_current_central_points(pax_gender);
    }

    function formatMobile(tick) {
        return "'" + tick.toString().slice(-2);
    }
</script>

{#if mygeojson && pax_timeline}
    <div class="wrapper" bind:clientWidth={width} bind:clientHeight={height}>
        {#if mygeojson}
            <LayerCake>
                <Svg>
                    <Map {countries} {transform} {cumulative_isos} {margin} />
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
