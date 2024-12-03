<script>
    import { getContext } from "svelte";
    import * as geo from "d3-geo";
    import * as d3 from "d3";

    const { data, width, height } = getContext("LayerCake");

    export let final_iso;
    export let transform;
    export let countries;

    $: if (final_iso) {
        d3.selectAll(".country").style("fill", " black");
        final_iso.forEach((iso) => {
            d3.selectAll("." + iso).style("fill", "#f6f1d6");
        });
    }

    function polygon_hover(feature) {
        // console.log(feature);
    }

    function initial_fill(polygon) {
        return final_iso.includes(polygon.properties.adm0_iso)
            ? "#f6f1d6"
            : "black";
    }

</script>

<g class="map-group" {transform}>
    {#each countries as country}
        <path
            fill={initial_fill(country)}
            class={"country " + country.properties.adm0_iso}
            stroke="gray"
            stroke-width="0.5"
            d={country.path}
        ></path>
    {/each}
</g>

<style>
    .country {
        stroke-width: 0.5px;
    }
</style>
