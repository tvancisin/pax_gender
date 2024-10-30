<script>
    import * as d3 from "d3";
    import IndividualLine from "./IndividualLine.svelte";
    import { LayerCake, Svg } from "layercake";
    import Map1 from "./Map1.svelte";
    import Point from "./Point.svelte";

    export let mygeojson;
    export let pax_gender_timeline;
    export let pax_timeline;
    export let pax_gender;
    export let step;
    export let central_points;

    let years = [
        "1990",
        "1991",
        "1992",
        "1993",
        "1994",
        "1995",
        "1996",
        "1997",
        "1998",
        "1999",
        "2000",
        "2001",
        "2002",
        "2003",
        "2004",
        "2005",
        "2006",
        "2007",
        "2008",
        "2009",
        "2010",
        "2011",
        "2012",
        "2013",
        "2014",
        "2015",
        "2016",
        "2017",
        "2018",
        "2019",
        "2020",
        "2021",
        "2022",
        "2023",
    ];
    let most_women = [
        "2015",
        "2016",
        "2008",
        "2014",
        "2013",
        "2003",
        "2006",
        "2011",
        "2004",
        "2018",
        "1996",
        "2002",
        "2012",
        "2019",
        "1994",
        "1995",
        "1999",
        "1993",
        "2005",
        "2007",
        "2021",
        "2001",
        "2020",
        "2023",
        "1991",
        "1998",
        "2009",
        "2000",
        "2010",
        "2017",
        "2022",
        "1992",
        "1997",
        "1990",
    ];

    let width = 400;
    let height = 400;
    let rendered_data;
    let current_years;
    let current_central_points;
    let reorder = true;
    let innerWidth, innerHeight, xScale, yScale;
    const margin = { top: 20, right: 20, bottom: 20, left: 40 };

    $: current_pax = pax_timeline;
    $: innerWidth = width - margin.left - margin.right;
    $: innerHeight = height - margin.top - margin.bottom;

    $: console.log("current pax: ", current_pax);

    $: xScale = d3
        .scaleBand()
        .domain(years)
        .range([0, innerWidth])
        .padding(0.1);

    $: yScale = d3.scaleLinear().domain([0, 100]).range([100, 0]);

    let current_isos;
    let cumulative_isos;
    function get_current_central_points(pax) {
        current_isos = pax[0][1]
            .map((d) => {
                if (d.GeWom == "1") {
                    return d.Loc1ISO;
                }
            })
            .filter((iso) => iso !== undefined && iso !== null);

        // Create the new array of objects
        let points = current_isos
            .map((code) => {
                // Find the matching country object
                const country = central_points.find((c) => c.iso_code === code);

                if (country) {
                    return {
                        name: country.name,
                        code: code,
                        longitude: +country.central_longitude,
                        latitude: +country.central_latitude,
                    };
                } else {
                    // Return null or any fallback in case no match is found
                    return null;
                }
            })
            .filter((item) => item !== null); // Remove null entries

        return points;
    }

    function get_current_isos(data) {
        let iso_array = [];
        //construct array of iso's
        data.forEach((d) => {
            iso_array = iso_array.concat(d[1].map((x) => x.Loc1ISO)); // Reassign to iso_array
        });
        //remove duplicates
        iso_array = [...new Set(iso_array)];

        return iso_array;
    }

    let degrouped_pax = [];
    // wait till pax_timeline is loaded
    $: if (current_pax) {
        if (degrouped_pax.length == 0) {
            current_pax.forEach((d) => {
                degrouped_pax = degrouped_pax.concat(d[1]); // Reassign to iso_array
            });
        }
        console.log("degrouped_pax: ", degrouped_pax);

        //initial timeline data
        current_years = pax_timeline.map((d) => d[0]);
        current_central_points = get_current_central_points(current_pax);
        cumulative_isos = get_current_isos(current_pax);

        let previousYear = null; // Track the last year seen
        let index = 0; // Index that resets for each new year

        rendered_data = degrouped_pax.map((d) => {
            const currentYear = d.Dat.substring(6, 10);

            // Reset index if the year has changed
            if (currentYear !== previousYear) {
                index = 0;
                previousYear = currentYear;
            }

            const result = {
                x1: xScale(currentYear),
                x2: xScale.bandwidth(),
                y1: yScale(index),
                y2: yScale(index),
            };

            index += 1; // Increment index for the next entry in the same year
            return result;
        });
    }

    $: if (step == "1") {
        // current_pax = pax_timeline;
        // current_central_points = get_current_central_points([
        //     current_pax[current_pax.length - 1],
        // ]);
        // cumulative_isos = get_current_isos(current_pax);
        let previousYear = null; // Track the last year seen
        let index = 0; // Index that resets for each new year
        rendered_data = degrouped_pax.map((d) => {
            const currentYear = d.Dat.substring(6, 10);

            // Reset index if the year has changed
            if (currentYear !== previousYear) {
                index = 0;
                previousYear = currentYear;
            }

            const result = {
                x1: xScale(currentYear),
                x2: xScale.bandwidth(),
                y1: yScale(index),
                y2: yScale(index),
            };

            index += 1; // Increment index for the next entry in the same year
            return result;
        });
    } else if (step == "2") {
        // current_pax = pax_timeline;
        // current_central_points = get_current_central_points([
        //     current_pax[current_pax.length - 1],
        // ]);
        // cumulative_isos = get_current_isos(current_pax);

        // let previousYear = null; // Track the last year seen
        // let index = 0; // Index that resets for each new year
        // rendered_data = degrouped_pax.map((d) => {
        //     const currentYear = d.Dat.substring(6, 10);

        //     // Reset index if the year has changed
        //     if (currentYear !== previousYear) {
        //         index = 0;
        //         previousYear = currentYear;
        //     }

        //     const result = {
        //         x1: xScale(currentYear),
        //         x2: 0,
        //         y1: yScale(index),
        //         y2: yScale(index),
        //     };

        //     index += 1; // Increment index for the next entry in the same year
        //     return result;
        // });

        let previousYear = null; // Track the last year seen
        let index = 0; // Index that changes based on GeWom value

        rendered_data = degrouped_pax.map((d) => {
            const currentYear = d.Dat.substring(6, 10);

            // Reset index if the year has changed
            if (currentYear !== previousYear) {
                index = 0;
                previousYear = currentYear;
            }

            let result;
            // Adjust index based on GeWom value
            if (d.GeWom === "1") {
                index += 1;
                result = {
                    x1: xScale(currentYear),
                    x2: xScale.bandwidth(),
                    y1: yScale(index),
                    y2: yScale(index),
                };
            } else if (d.GeWom === "0") {
                result = {
                    x1: xScale(currentYear),
                    x2: xScale.bandwidth(),
                    y1: 150,
                    y2: 150,
                };
            }

            // Return the result using the updated index value

            return result;
        });
    } else if (step == "3" && pax_timeline) {

        let previousYear = null; // Track the last year seen
        let index = 0; // Index that changes based on GeWom value

        rendered_data = degrouped_pax.map((d) => {
            const currentYear = d.Dat.substring(6, 10);

            // Reset index if the year has changed
            if (currentYear !== previousYear) {
                index = 0;
                previousYear = currentYear;
            }

            let result;
            // Adjust index based on GeWom value
            if (d.WggGenQuot === "1") {
                index += 1;
                result = {
                    x1: xScale(currentYear),
                    x2: xScale.bandwidth(),
                    y1: yScale(index),
                    y2: yScale(index),
                };
            } else if (d.WggGenQuot === "0") {
                result = {
                    x1: xScale(currentYear),
                    x2: xScale.bandwidth(),
                    y1: 150,
                    y2: 150,
                };
            }

            // Return the result using the updated index value

            return result;
        });
        // current_pax = pax_timeline.slice(0, 3);
        // current_central_points = get_current_central_points([
        //     current_pax[current_pax.length - 1],
        // ]);
        // cumulative_isos = get_current_isos(current_pax);
        // let previousYear = null; // Track the last year seen
        // let index = 0; // Index that changes based on GeWom value
        // rendered_data = degrouped_pax.map((d) => {
        //     const currentYear = d.Dat.substring(6, 10);
        //     // Reset index if the year has changed
        //     if (currentYear !== previousYear) {
        //         index = 0;
        //         previousYear = currentYear;
        //     }
        //     // Adjust index based on GeWom value
        //     if (d.GeWom === "1") {
        //         index += 1;
        //     } else if (d.GeWom === "0") {
        //         index = -50;
        //     }
        //     // Return the result using the updated index value
        //     const result = {
        //         x1: xScale(currentYear),
        //         x2: xScale.bandwidth(),
        //         y1: yScale(index),
        //         y2: yScale(index),
        //     };
        //     return result;
        // });
    }

    // else if (step == "4" && pax_timeline) {
    //     console.log("1993");
    //     current_pax = pax_timeline.slice(0, 4);
    //     current_central_points = get_current_central_points([
    //         current_pax[current_pax.length - 1],
    //     ]);
    //     cumulative_isos = get_current_isos(current_pax);
    // }

    function formatMobile(tick) {
        return "'" + tick.toString().slice(-2);
    }

    $: console.log("rendered data: ", rendered_data);
</script>

{#if rendered_data && mygeojson}
    <div class="wrapper" bind:clientWidth={width} bind:clientHeight={height}>
        {#if mygeojson}
            <LayerCake data={mygeojson}>
                <Svg>
                    <Map1
                        projectionName={"geoNaturalEarth1"}
                        {cumulative_isos}
                    />
                    <!-- <Point
                        projectionName={"geoNaturalEarth1"}
                        pointsData={current_central_points}
                    /> -->
                    <g
                        transform="translate({margin.left}, {innerHeight -
                            150})"
                    >
                        <!-- <g class="axis x-axis">
                            {#each years as tick}
                                <g
                                    class="tick tick-{tick}"
                                    transform="translate({xScale(tick) +
                                        xScale.bandwidth() / 2},{220})"
                                >
                                    <text y="-2"
                                        >{innerWidth > 380
                                            ? tick
                                            : formatMobile(tick)}</text
                                    >
                                </g>
                            {/each}
                        </g> -->

                        {#each rendered_data as d}
                            <IndividualLine
                                x1={d.x1}
                                x2={d.x2}
                                y1={d.y1}
                                y2={d.y2}
                            />
                        {/each}
                    </g>
                </Svg>
            </LayerCake>
        {/if}
        <!-- <svg {width} {height}>
            <g transform="translate({margin.left}, {innerHeight - 200})">
                <g class="axis x-axis">
                    {#each years as tick}
                        <g
                            class="tick tick-{tick}"
                            transform="translate({xScale(tick) +
                                xScale.bandwidth() / 2},{235})"
                        >
                            <text y="-2"
                                >{innerWidth > 380
                                    ? tick
                                    : formatMobile(tick)}</text
                            >
                        </g>
                    {/each}
                </g>

                {#each current_pax as [year, entries]}
                    <IndividualLine
                        x={xScale(year)}
                        y={yScale(entries.length)}
                        {innerHeight}
                        width={xScale.bandwidth()}
                        {entries}
                        {reorder}
                    />
                {/each}
            </g>
        </svg> -->
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

    .tick text {
        fill: black;
        text-anchor: start;
        font-size: 10px;
    }

    .x-axis .tick text {
        text-anchor: middle;
    }
</style>
