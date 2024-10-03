<script>
    import { getContext } from "svelte";
    import * as geo from "d3-geo";

    const { data, width, height } = getContext("LayerCake");

    export let projectionName = "geoNaturalEarth1";

    /* --------------------------------------------
     * Add this in case you want to plot only a subset of the features
     * while keeping the zoom on the whole geojson feature set
     */

    export let features = $data.features;
    $: console.log(features);

    $: projection = geo[projectionName]().fitSize([$width, $height], $data);

    $: geoPath = geo.geoPath(projection);

    function fillRandom(random) {
        // console.log(random.properties.ADMIN);
        
        const colors = ['#ffdecc', '#ffc09c', '#ffa06b', '#ff7a33'];
        const index = Math.round(random * (colors.length - 1));
        return colors[index];
    }

    function polygon_hover () {
        console.log("brno");
        
    }
</script>

<g class="map-group">
    {#each features as feature}
        <path
            class="feature-path"
            fill="none"
            d={geoPath(feature)}
            on:mouseenter={polygon_hover}
        ></path>
    {/each}
</g>

<style>
    .feature-path {
        stroke: gray;
        stroke-width: 0.5px;
    }
</style>
