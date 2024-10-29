<script>
    import { getContext } from "svelte";
    import { onDestroy } from "svelte";
    import * as geo from "d3-geo";
    import * as d3 from "d3";

    export let mygeojson;
    export let map_svg_width;
    export let height;
    export let projectionName = "geoNaturalEarth1";
    export let features = mygeojson.features;
    export let cumulative_isos;
    export let scaleFactor = 1.1; // Adjust this value to control zoom level

    let projection;
    let geoPath;

    $: {
        // Set the initial projection with fitSize
        projection = geo[projectionName]().fitSize(
            [map_svg_width, height],
            mygeojson,
        );

        // Apply custom scaling
        projection.scale(projection.scale() * scaleFactor);


        // Define the geoPath with the updated projection
        geoPath = geo.geoPath(projection);
    }

    // Handle highlighted colors for different steps
    $: if (cumulative_isos) {
        let filteredIsos = cumulative_isos.filter((iso) => iso !== "");
        d3.selectAll(".country").style("fill", "white");
        filteredIsos.forEach((iso) => {
            d3.selectAll("." + iso).style("fill", "black");
        });
    }

    // Function to set initial fill color
    function initial_fill(polygon) {
        return cumulative_isos.includes(polygon.properties.adm0_iso)
            ? "black"
            : "white";
    }

    // Resize handler to maintain responsiveness
    function updateProjection() {
        projection
            .fitSize([map_svg_width, height], mygeojson)
            .scale(projection.scale() * scaleFactor);
        geoPath = geo.geoPath(projection);
    }

    // Add event listener for resize
    window.addEventListener("resize", updateProjection);
    onDestroy(() => window.removeEventListener("resize", updateProjection));

    function polygon_hover(d) {}
</script>

{#if features && cumulative_isos}
    <svg width={map_svg_width} {height}>
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
    </svg>
{/if}

<style>
    .country {
        stroke: rgb(126, 126, 126);
        stroke-width: 0.5px;
        shape-rendering: geometricPrecision;
    }
</style>
