<script>
    import * as d3 from "d3";
    import { years } from "../utils";
    import { tick } from "svelte";

    export let pax;
    export let pax_timeline;
    export let step;

    let tooltip = { visible: false, x: 0, y: 0, info: "" };
    let width = 400;
    let height = 400;
    let rendered_data;
    let background_data;
    let innerWidth, innerHeight, xScale, yScale;
    let imageX;
    let imageHeight;
    let margin = { top: 20, right: 80, bottom: 20, left: 100 };

    $: innerWidth = width - margin.left - margin.right;
    $: innerHeight = height - margin.top - margin.bottom;

    $: xScale = d3
        .scaleBand()
        .domain(years)
        .range([0, innerWidth])
        .padding(0.1);

    $: yScale = d3.scaleLinear().domain([0, 100]).range([innerHeight, 0]);

    // area generator — define BEFORE the step-reactive block that uses it
    $: area = d3
        .area()
        .x((d) => xScale(d.year) + xScale.bandwidth() / 2)
        .y0(innerHeight)
        .y1((d) => yScale(d.value))
        .curve(d3.curveMonotoneX);

    // initial functions (data wrangling)
    let pax_gender_rendered;
    $: if (pax) {
        let pax_gender = pax.filter((d) => d.GeWom == 1);
        let gender_grouped_years = d3.groups(pax_gender, (d) =>
            d.Dat.substring(0, 4),
        );
        pax_gender_rendered = gender_grouped_years.map(([year, arr]) => ({
            year,
            value: arr.length,
        }));

        let grouped_years = d3.groups(pax, (d) => d.Dat.substring(0, 4));
        rendered_data = grouped_years.map(([year, arr]) => ({
            year,
            value: arr.length,
        }));
    }

    // helper collapsed version (all values -> 0)
    const collapsedFrom = (arr) =>
        arr ? arr.map((d) => ({ ...d, value: 0 })) : [];

    // Animate in/out when `step` changes
    $: if (pax_gender_rendered) {
        if (step === "area02") {
            d3.selectAll(".un_resolution").style("visibility", "visible");
            const path = d3.select(".pax_area");
            const collapsed = collapsedFrom(pax_gender_rendered);
            path.attr("d", area(collapsed)) // ensure starting shape is collapsed
                .style("opacity", 1) // make visible before animating
                .transition()
                .duration(500)
                .ease(d3.easeCubic)
                .attr("d", area(pax_gender_rendered)); // animate to full

            d3.selectAll(".gender-circles circle")
                .transition()
                .duration(500)
                .attr("cy", (d, i) => yScale(pax_gender_rendered[i].value))
                .style("opacity", 1);

            d3.selectAll(".gender-circles text")
                .transition()
                .duration(500)
                .attr("y", (d, i) => yScale(pax_gender_rendered[i].value) - 8)
                .style("opacity", 1);
        } else if (step === "area01") {
            d3.selectAll(".un_resolution").style("visibility", "hidden");
            const path = d3.select(".pax_area");
            const collapsed = collapsedFrom(pax_gender_rendered);
            path.transition()
                .duration(500)
                .ease(d3.easeCubic)
                .attr("d", area(collapsed))
                .on("end", () => path.style("opacity", 0));

            d3.selectAll(".gender-circles circle")
                .transition()
                .duration(800)
                .attr("cy", innerHeight)
                .style("opacity", 0);

            d3.selectAll(".gender-circles text")
                .transition()
                .duration(800)
                .attr("y", innerHeight)
                .style("opacity", 0);
        }
    }

    function formatMobile(tick) {
        return "'" + tick.toString().slice(-2);
    }
</script>

{#if rendered_data && pax_timeline}
    <div class="wrapper" bind:clientWidth={width} bind:clientHeight={height}>
        <svg {width} {height}>
            <g
                class="timeline"
                transform="translate({margin.left}, {margin.top})"
            >
                <g class="axis x-axis">
                    {#each years as tick}
                        <g
                            class="tick tick-{tick}"
                            transform="translate({xScale(tick) +
                                xScale.bandwidth() / 2},{innerHeight + 15})"
                        >
                            <text y="1">
                                {innerWidth > 800 ? tick : formatMobile(tick)}
                            </text>
                        </g>
                    {/each}
                </g>

                <path
                    d={area(rendered_data)}
                    fill="#333333"
                    fill-opacity="0.4"
                />

                <path
                    class="pax_area"
                    d={area(
                        pax_gender_rendered
                            ? collapsedFrom(pax_gender_rendered)
                            : [],
                    )}
                    fill="#333333"
                    fill-opacity="0.9"
                    style="opacity: 0;"
                />

                <g class="gender-circles">
                    {#each pax_gender_rendered as r, i}
                        <circle
                            class="gender-circle-{i}"
                            cx={xScale(r.year) + xScale.bandwidth() / 2}
                            cy={innerHeight}
                            r="3"
                            fill="black"
                            style="opacity: 0;"
                        />
                        <text
                            class="gender-text-{i}"
                            x={xScale(r.year) + xScale.bandwidth() / 2}
                            y={innerHeight}
                            text-anchor="middle"
                            font-size="10"
                            font-weight="500"
                            fill="black"
                            style="opacity: 0;"
                        >
                            {r.value}
                        </text>
                    {/each}
                </g>

                {#each rendered_data as r}
                    <g>
                        <circle
                            cx={xScale(r.year) + xScale.bandwidth() / 2}
                            cy={yScale(r.value)}
                            r="3"
                            fill="black"
                        />
                        <text
                            x={xScale(r.year) + xScale.bandwidth() / 2}
                            y={yScale(r.value) - 8}
                            text-anchor="middle"
                            font-size="10"
                            font-weight="500"
                            fill="black"
                        >
                            {r.value}
                        </text>
                    </g>
                {/each}

                <line
                    class="un_resolution"
                    x1={xScale("2000") + xScale.bandwidth() / 2}
                    y1={20}
                    x2={xScale("2000") + xScale.bandwidth() / 2}
                    y2={innerHeight - 80}
                    stroke="gray"
                    stroke-width="1"
                    stroke-dasharray="4,4"
                />

                <text
                    class="un_resolution"
                    x={xScale("2000") + xScale.bandwidth()}
                    y={20}
                    fill="black"
                >
                    UN Resolution 1325
                </text>
            </g>
        </svg>
    </div>
{/if}

<style>
    .wrapper {
        height: 90vh;
        position: relative;
    }
    .tick {
        font-size: 0.725em;
        font-weight: 200;
    }

    .un_resolution {
        visibility: hidden;
    }

    .tick text {
        fill: black;
        text-anchor: start;
        font-size: 10px;
        font-family: "Montserrat";
        font-weight: 400;
    }

    @media only screen and (max-width: 1200px) {
        .tick text {
            font-size: 11px;
        }
    }

    @media only screen and (max-width: 768px) {
        .tick text {
            font-size: 10px;
        }
    }

    .x-axis .tick text {
        text-anchor: middle;
    }

    #example {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        overflow: hidden;
        opacity: 0;
        transition: 0.2s ease;
        pointer-events: none;
    }

    #example img {
        position: absolute;
        background-color: #33333399;
        border-radius: 5px;
        top: 0px;
        max-width: 80%;
        padding: 10px;
        height: auto;
        display: block;
    }

    .un_resolution {
        visibility: hidden;
    }

    /* .tooltip {
        background-color: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 10px;
        border-radius: 2px;
        pointer-events: none;
        transition: opacity 0.2s ease;
        width: 150px;
    }

    p {
        margin: 5px;
        font-size: 12px;
    } */
</style>
