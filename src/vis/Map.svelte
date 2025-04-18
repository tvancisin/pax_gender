<script>
    import { getContext } from "svelte";
    import * as geo from "d3-geo";
    import * as d3 from "d3";

    export let cumulative_isos;
    export let transform;
    export let countries;

    const { data, width, height } = getContext("LayerCake");
    let opacity_generator = d3.scaleLinear().domain([0, 150]).range([0.2, 1]);

    $: if (cumulative_isos) {
        d3.selectAll(".country").style("fill", " black");
        cumulative_isos.forEach((d) => {
            d3.selectAll("." + d.iso)
                .style("fill", "#f6f1d6")
                .style("fill-opacity", opacity_generator(d.count));
        });
    }

    function polygon_hover(feature) {
        // console.log(feature);
    }

    function initial_fill(polygon) {
        return cumulative_isos.some(
            (item) => item.iso === polygon.properties.adm0_iso,
        )
            ? "#f6f1d6"
            : "black";
    }


    function opacity_calculator(country) {
        let country_code = country.properties.adm0_iso;
        let find_cntry = cumulative_isos.find((d) => d.iso == country_code);
        if (find_cntry) {
            return opacity_generator(find_cntry.count);
        } else {
            return 1;
        }
    }
</script>

<g class="map-group" {transform}>
    {#each countries as country}
        <path
            fill={initial_fill(country)}
            fill-opacity={opacity_calculator(country)}
            class={"country " + country.properties.adm0_iso}
            d={country.path}
        ></path>
    {/each}
</g>

<style>
    .country {
        stroke-width: 0.5px;
    }
</style>
