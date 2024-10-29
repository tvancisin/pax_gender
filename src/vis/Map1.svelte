<script>
    import { getContext } from "svelte";
    import * as geo from "d3-geo";
    import * as d3 from "d3";

    const { data, width, height } = getContext("LayerCake");

    export let projectionName = "geoNaturalEarth1";
    export let features = $data.features;
    export let cumulative_isos;


    // $: if (cumulative_isos) {
    //     let filteredIsos = cumulative_isos.filter((iso) => iso !== "");
    //     filteredIsos.forEach((iso) => {
    //         d3.selectAll("." + iso).style("fill", "red");
    //         d3.selectAll("." + iso).style("fill", "gray");
    //     });
    // }

    $: projection = geo[projectionName]().fitSize([$width, $height - 100], $data);
    $: geoPath = geo.geoPath(projection);

    function polygon_hover(feature) {
        // console.log(feature);
    }

    function initial_fill(polygon) {
        return cumulative_isos.includes(polygon.properties.adm0_iso)
            ? "black"
            : "white";
    }

</script>

<g class="map-group">
    {#each features as feature}
        <path
            class={"country " + feature.properties.adm0_iso}
            fill={initial_fill(feature)}
            d={geoPath(feature)}
            on:mouseenter={polygon_hover(feature)}
        ></path>
    {/each}
</g>

<style>
    .country {
        stroke:gray;
        stroke-width: 0.5px;
    }
</style>