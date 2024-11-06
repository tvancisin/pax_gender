<script>
    import { getContext } from "svelte";
    import * as geo from "d3-geo";
    import * as d3 from "d3";

    const { data, width, height } = getContext("LayerCake");

    export let projectionName = "geoNaturalEarth1";
    export let features = $data.features;
    export let cumulative_isos;
    export let step;

    $: if (step == "2") {
        d3.select(".map-group").style("visibility", "visible")
    } else if (step == "1") {
        d3.select(".map-group").style("visibility", "hidden")
    }

    // $: console.log(cumulative_isos);
    

    $: if (cumulative_isos) {
        let filteredIsos = cumulative_isos.filter((iso) => iso !== "");
        d3.selectAll(".country").style("fill", "#e6e6e6");
        filteredIsos.forEach((iso) => {
            d3.selectAll("." + iso).style("fill", "black");
        });
    }

    $: projection = geo[projectionName]().fitSize([$width, $height], $data);
    $: geoPath = geo.geoPath(projection);

    function polygon_hover(feature) {
        // console.log(feature);
    }

    function initial_fill(polygon) {
        return cumulative_isos.includes(polygon.properties.adm0_iso)
            ? "black"
            : "#e6e6e6";
    }

</script>

<g class="map-group">
    {#each features as feature}
        <path
            fill={initial_fill(feature)}
            class={"country " + feature.properties.adm0_iso}
            d={geoPath(feature)}
            on:mouseenter={polygon_hover(feature)}
        ></path>
    {/each}

</g>

<style>
    .map-group {
        visibility: hidden;
    }
    .country {
        stroke:none;
        stroke-width: 0.5px;
    }
</style>