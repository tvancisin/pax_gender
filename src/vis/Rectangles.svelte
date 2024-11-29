<script>
    import * as d3 from "d3";
    import IndividualLine from "./IndividualLine.svelte";
    import { LayerCake, Svg } from "layercake";
    import { years, full_grid, full_grid_filter } from "../utils";
    import Background from "./background.svelte";

    export let pax;
    export let pax_stages;
    export let step;

    let tooltip = { visible: false, x: 0, y: 0, info: "" }; // Tooltip state

    let width = 400;
    let height = 400;
    let rendered_data;
    let background_data;
    let initialPaxCount;
    let innerWidth, innerHeight, xScale, yScale;
    const margin = { top: 20, right: 20, bottom: 20, left: 40 };

    $: innerWidth = width - margin.left - margin.right;
    $: innerHeight = height - margin.top - margin.bottom;

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
        rendered_data = full_grid(
            pax,
            innerHeight,
            innerWidth,
            initialPaxCount,
        );
        background_data = full_grid(
            pax,
            innerHeight,
            innerWidth,
            initialPaxCount,
        );

        
    }

    //steps
    $: if (step == "rect01") {
        // full grid
        rendered_data = full_grid(
            pax,
            innerHeight,
            innerWidth,
            initialPaxCount,
        );
        d3.selectAll(".ind_rect").style("fill", "#F6F1D6");
    } else if (step == "rect02") {
        //full grid gender
        rendered_data = full_grid_filter(
            pax,
            innerHeight,
            innerWidth,
            initialPaxCount,
        );
    }

    function formatMobile(tick) {
        return "'" + tick.toString().slice(-2);
    }

    // Event handlers for tooltip
    const handleHover = (event) => {
        let dyn_x;
        let dyn_y;
        if (event.detail.x >= innerWidth / 2) {
            dyn_x = event.detail.x - 140;
        } else if (event.detail.x < innerWidth / 2) {
            dyn_x = event.detail.x + 70;
        }

        if (event.detail.y >= innerHeight / 2) {
            dyn_y = event.detail.y - 50;
        } else if (event.detail.y < innerHeight / 2) {
            dyn_y = event.detail.y;
        }

        tooltip = {
            visible: true,
            x: dyn_x,
            y: dyn_y,
            info: event.detail.info,
        };
    };

    const handleLeave = () => {
        tooltip = { ...tooltip, visible: false };
    };

    // $: console.log("rendered data: ", rendered_data);
</script>

{#if rendered_data}
    <div class="wrapper" bind:clientWidth={width} bind:clientHeight={height}>
        <LayerCake>
            <Svg>
                <g
                    class="timeline"
                    transform="translate({margin.left}, {margin.top})"
                >
                    {#each background_data as d, i}
                        <Background
                            x={d.x}
                            y={d.y}
                            width={d.width}
                            height={d.height}
                            info={d.info}
                            on:hover={handleHover}
                            on:leave={handleLeave}
                        />
                    {/each}
                    {#each rendered_data as d, i}
                        <IndividualLine
                            {i}
                            x={d.x}
                            y={d.y}
                            width={d.width}
                            height={d.height}
                            info={d.info}
                            on:hover={handleHover}
                            on:leave={handleLeave}
                        />
                    {/each}
                </g>
            </Svg>
        </LayerCake>
        {#if tooltip.visible}
            <div
                class="tooltip"
                style="position: absolute; left: {tooltip.x}px; top: {tooltip.y}px;"
            >
                <p>{tooltip.info}</p>
            </div>
        {/if}
    </div>
{/if}

<style>
    .wrapper {
        height: 90vh;
        position: relative;
    }

    .tooltip {
        background-color: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 10px;
        border-radius: 2px;
        pointer-events: none;
        transition: opacity 0.3s ease;
        width: 150px;
    }

    p {
        margin: 5px;
        font-size: 12px;
    }
</style>
