<script>
    import { getContext } from "svelte";
    import * as geo from "d3-geo";
    import * as d3 from "d3";

    const { data, width, height } = getContext("LayerCake");

    export let projectionName = "geoNaturalEarth1";
    export let features = $data.features;
    export let cumulative_isos;

    $: if (cumulative_isos) {
        let filteredIsos = cumulative_isos.filter((iso) => iso !== "");
        d3.selectAll(".country").style("fill", "white");
        filteredIsos.forEach((iso) => {
            d3.selectAll("." + iso).style("fill", "gray");
        });
    }

    /* --------------------------------------------
     * Add this in case you want to plot only a subset of the features
     * while keeping the zoom on the whole geojson feature set
     */

    $: projection = geo[projectionName]().fitSize([$width, $height - 100], $data);

    $: geoPath = geo.geoPath(projection);

    function fillRandom(random) {
        // console.log(random.properties.ADMIN);

        const colors = ["#ffdecc", "#ffc09c", "#ffa06b", "#ff7a33"];
        const index = Math.round(random * (colors.length - 1));
        return colors[index];
    }

    function polygon_hover(feature) {
        // console.log(feature);
    }
</script>

<g class="map-group">
    {#each features as feature}
        <path
            class={"country " + feature.properties.adm0_iso}
            fill="white"
            d={geoPath(feature)}
            on:mouseenter={polygon_hover(feature)}
        ></path>
    {/each}
</g>

<style>
    .country {
        stroke:black;
        stroke-width: 0.5px;
    }
</style>
