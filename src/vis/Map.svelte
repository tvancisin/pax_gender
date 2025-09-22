<script>
    import { tick } from "svelte";
    import * as d3 from "d3";

    export let cumulative_isos;
    export let transform;
    export let margin;
    export let countries;

    let opacity_generator = d3.scaleLinear().domain([0, 150]).range([0.2, 1]);

    $: if (cumulative_isos) {
        // d3.selectAll(".country").style("fill", "none").style("stroke", "gray");
        cumulative_isos.forEach((d) => {
            d3.selectAll("." + d.iso)
                .style("fill", "black")
                .style("fill-opacity", opacity_generator(d.count));
        });
    }

    function initial_fill(polygon) {
        return cumulative_isos.some(
            (item) => item.iso === polygon.properties.adm0_iso,
        )
            ? "black"
            : "none";
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

    //hover actions
    let textWidth = 0;
    let textEl;

    async function updateTextWidth() {
        await tick();
        if (textEl) {
            textWidth = textEl.getBBox().width;
        }
    }

    let hover = {
        iso: null,
        x: 0,
        y: 0,
        visible: false,
    };

    function handleMouseOver(event, country) {
        let country_code = country.properties.adm0_iso;
        let find_cntry = cumulative_isos.find((d) => d.iso == country_code);
        if (find_cntry) {
            const [x, y] = d3.pointer(event);
            hover = {
                iso: country.properties.admin + ": " + find_cntry.count,
                x,
                y,
                visible: true,
            };
        } else {
            hover.visible = false;
        }
    }

    function handleMouseMove(event) {
        const [x, y] = d3.pointer(event);
        hover.x = x;
        hover.y = y;
    }

    function handleMouseOut() {
        hover.visible = false;
    }

    $: if (hover.iso) {
        updateTextWidth();
    }
</script>

<g class="map-group" transform="translate({margin.left}, {margin.top})">
    {#each countries as country}
        <path
            fill={initial_fill(country)}
            stroke="#cccccc"
            stroke-width="0.5"
            fill-opacity={opacity_calculator(country)}
            class={"country " + country.properties.adm0_iso}
            d={country.path}
            on:mouseover={(e) => handleMouseOver(e, country)}
            on:mousemove={handleMouseMove}
            on:mouseout={handleMouseOut}
        />
    {/each}

    {#if hover.visible}
        <g transform="translate({hover.x + 10}, {hover.y - 10})">
            <rect
                x="0"
                y="-15"
                width={textWidth + 10}
                height="20"
                fill="black"
                rx="3"
            />
            <text x="5" y="0" font-size="12" fill="white" bind:this={textEl}>
                {hover.iso}
            </text>
        </g>
    {/if}
</g>
