<script>
    import { getContext } from "svelte";
    import * as geo from "d3-geo";
    import * as d3 from "d3";

    const { data, width, height } = getContext("LayerCake");

    export let cumulative_isos;
    export let transform;
    export let countries;

    $: if (cumulative_isos) {
        let filteredIsos = cumulative_isos.filter((iso) => iso !== "");
        d3.selectAll(".country").style("fill", " #4d4d4d");
        filteredIsos.forEach((iso) => {
            d3.selectAll("." + iso).style("fill", "#f6f1d6");
        });
    }

    function polygon_hover(feature) {
        // console.log(feature);
    }

    function initial_fill(polygon) {
        return cumulative_isos.includes(polygon.properties.adm0_iso)
            ? "#f6f1d6"
            : "#4d4d4d";
    }

</script>

<g class="map-group" {transform}>
    {#each countries as country}
        <path
            fill={initial_fill(country)}
            class={"country " + country.properties.adm0_iso}
            stroke="#333333"
            stroke-width="0.5"
            d={country.path}
        ></path>
    {/each}
</g>

<style>
    /* .map-group {
        visibility: hidden;
    } */
    .country {
        stroke: none;
        stroke-width: 0.5px;
    }
</style>
