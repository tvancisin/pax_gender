<script>
    import * as d3 from "d3";
    import IndividualLine from "./IndividualLine.svelte";
    import { LayerCake, Svg } from "layercake";
    import { years, pax_stages_grid, pax_stages_filter_grid } from "../utils";
    import Point from "./Point.svelte";

    export let pax;
    export let pax_stages;
    export let mygeojson;
    export let pax_timeline;
    export let step;

    let width = 400;
    let height = 400;
    let rendered_data;
    let current_central_points;
    let initialPaxCount;
    let innerWidth, innerHeight, xScale, yScale;
    let stages = [
        "Partial",
        "Pre-Negotiation",
        "Comprehensive",
        "Ceasefire",
        "Implementation",
        "Renewal",
        "Other",
    ];
    const margin = { top: 20, right: 20, bottom: 20, left: 40 };

    $: innerWidth = width - margin.left - margin.right;
    $: innerHeight = height - margin.top - margin.bottom;
    $: column_width = innerWidth / 7;

    $: xScale = d3
        .scaleBand()
        .domain(years)
        .range([0, innerWidth])
        .padding(0.1);

    $: yScale = d3.scaleLinear().domain([0, 100]).range([innerHeight, 0]);

    //initial functions
    $: if (pax && pax_stages) {
        //prepare the initial grid
        initialPaxCount = pax.length;
        rendered_data = pax_stages_grid(pax_stages, innerHeight, innerWidth);
    }

    //steps
    $: if (step == "stage01") {
        //full stages
        rendered_data = pax_stages_grid(pax_stages, innerHeight, innerWidth);
    } else if (step == "stage02") {
        //gender stages
        rendered_data = pax_stages_filter_grid(
            pax_stages,
            innerHeight,
            innerWidth,
            "GeWom",
        );
    }

    function formatMobile(tick) {
        return "'" + tick.toString().slice(-2);
    }

    // $: console.log("rendered data: ", rendered_data);
</script>

{#if rendered_data && mygeojson && pax_timeline}
    <div class="wrapper" bind:clientWidth={width} bind:clientHeight={height}>
        {#if mygeojson}
            <LayerCake data={mygeojson}>
                <Svg>
                    <g
                        class="timeline"
                        transform="translate({margin.left}, {margin.top})"
                    >
                        {#each stages as d, i}
                            <text
                                x={column_width * i + i * 2}
                                y={innerHeight + 10}
                                fill="white"
                                font-size="10px">{d}</text
                            >
                        {/each}

                        {#each rendered_data as d, i}
                            <IndividualLine
                                {i}
                                x={d.x}
                                y={d.y}
                                width={d.width}
                                height={d.height}
                            />
                        {/each}
                    </g>
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
