<script>
    import * as d3 from "d3";
    import IndividualLine from "./IndividualLine.svelte";
    import { LayerCake, Svg } from "layercake";
    import Map from "./Map.svelte";
    import Point from "./Point.svelte";

    export let mygeojson;
    export let pax_gender_timeline;
    export let pax_timeline;
    export let pax_gender;
    export let step;
    export let central_points;

    $: console.log(mygeojson);

    let width = 400;
    let height = 400;
    let current_pax;
    let current_years;
    let current_central_points;
    let reorder = true;
    let innerWidth, innerHeight, xScale, yScale;
    const margin = { top: 20, right: 20, bottom: 20, left: 40 };

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

    $: innerWidth = width - margin.left - margin.right;
    $: innerHeight = height - margin.top - margin.bottom;

    $: xScale = d3
        .scaleBand()
        .domain(years)
        .range([0, innerWidth])
        .padding(0.1);

    $: yScale = d3.scaleLinear().domain([0, 100]).range([220, 0]);

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
        const combinedArray = data.reduce(
            (acc, yearArray) => [...acc, ...yearArray[1]],
            [],
        );
        const matchingLoc1ISO = combinedArray
            .filter((d) => d.GeWom === "1")
            .map((d) => d.Loc1ISO);

        return matchingLoc1ISO;
    }

    // wait till pax_timeline is loaded
    $: if (pax_timeline) {
        //initial timeline data
        current_pax = [pax_timeline[0]];
        current_years = pax_timeline.map((d) => d[0]);
        current_central_points = get_current_central_points(current_pax);
        cumulative_isos = get_current_isos(current_pax);
    }

    $: if (step == "1") {
        console.log("1990");
        current_pax = pax_timeline.slice(0, 1);
        current_central_points = get_current_central_points([
            current_pax[current_pax.length - 1],
        ]);
        cumulative_isos = get_current_isos(current_pax);
    } else if (step == "2") {
        console.log("1991");
        current_pax = pax_timeline.slice(0, 2);
        current_central_points = get_current_central_points([
            current_pax[current_pax.length - 1],
        ]);
        cumulative_isos = get_current_isos(current_pax);
    } else if (step == "3") {
        console.log("1992");
        current_pax = pax_timeline.slice(0, 3);
        current_central_points = get_current_central_points([
            current_pax[current_pax.length - 1],
        ]);
        cumulative_isos = get_current_isos(current_pax);
    } else if (step == "4") {
        console.log("1993");
        current_pax = pax_timeline.slice(0, 4);
        current_central_points = get_current_central_points([
            current_pax[current_pax.length - 1],
        ]);
        cumulative_isos = get_current_isos(current_pax);
    } else if (step == "5") {
        console.log("1994");
        current_pax = pax_timeline.slice(0, 5);
        current_central_points = get_current_central_points([
            current_pax[current_pax.length - 1],
        ]);
        cumulative_isos = get_current_isos(current_pax);
    } else if (step == "6") {
        console.log("1995");
        current_pax = pax_timeline.slice(0, 6);
        current_central_points = get_current_central_points([
            current_pax[current_pax.length - 1],
        ]);
        cumulative_isos = get_current_isos(current_pax);
    } else if (step == "7") {
        console.log("1996");
        current_pax = pax_timeline.slice(0, 7);
        current_central_points = get_current_central_points([
            current_pax[current_pax.length - 1],
        ]);
        cumulative_isos = get_current_isos(current_pax);
    } else if (step == "8") {
        console.log("1997");
        current_pax = pax_timeline.slice(0, 8);
        current_central_points = get_current_central_points([
            current_pax[current_pax.length - 1],
        ]);
        cumulative_isos = get_current_isos(current_pax);
    } else if (step == "9") {
        console.log("1998");
        current_pax = pax_timeline.slice(0, 9);
        current_central_points = get_current_central_points([
            current_pax[current_pax.length - 1],
        ]);
        cumulative_isos = get_current_isos(current_pax);
    } else if (step == "10") {
        console.log("1999");
        current_pax = pax_timeline.slice(0, 10);
        current_central_points = get_current_central_points([
            current_pax[current_pax.length - 1],
        ]);
        cumulative_isos = get_current_isos(current_pax);
    } else if (step == "11") {
        console.log("2000");
        current_pax = pax_timeline.slice(0, 11);
        current_central_points = get_current_central_points([
            current_pax[current_pax.length - 1],
        ]);
        cumulative_isos = get_current_isos(current_pax);
    } else if (step == "12") {
        console.log("2001");
        current_pax = pax_timeline.slice(0, 12);
        current_central_points = get_current_central_points([
            current_pax[current_pax.length - 1],
        ]);
        cumulative_isos = get_current_isos(current_pax);
    } else if (step == "13") {
        console.log("2002");
        current_pax = pax_timeline.slice(0, 13);
        current_central_points = get_current_central_points([
            current_pax[current_pax.length - 1],
        ]);
        cumulative_isos = get_current_isos(current_pax);
    } else if (step == "14") {
        console.log("2003");
        current_pax = pax_timeline.slice(0, 14);
        current_central_points = get_current_central_points([
            current_pax[current_pax.length - 1],
        ]);
        cumulative_isos = get_current_isos(current_pax);
    } else if (step == "15") {
        console.log("2004");
        current_pax = pax_timeline.slice(0, 15);
        current_central_points = get_current_central_points([
            current_pax[current_pax.length - 1],
        ]);
        cumulative_isos = get_current_isos(current_pax);
    } else if (step == "16") {
        console.log("2005");
        current_pax = pax_timeline.slice(0, 16);
        current_central_points = get_current_central_points([
            current_pax[current_pax.length - 1],
        ]);
        cumulative_isos = get_current_isos(current_pax);
    } else if (step == "17") {
        console.log("2006");
        current_pax = pax_timeline.slice(0, 17);
        current_central_points = get_current_central_points([
            current_pax[current_pax.length - 1],
        ]);
        cumulative_isos = get_current_isos(current_pax);
    } else if (step == "18") {
        console.log("2007");
        current_pax = pax_timeline.slice(0, 18);
        current_central_points = get_current_central_points([
            current_pax[current_pax.length - 1],
        ]);
        cumulative_isos = get_current_isos(current_pax);
    } else if (step == "19") {
        console.log("2008");
        current_pax = pax_timeline.slice(0, 19);
        current_central_points = get_current_central_points([
            current_pax[current_pax.length - 1],
        ]);
        cumulative_isos = get_current_isos(current_pax);
    } else if (step == "20") {
        console.log("2009");
        current_pax = pax_timeline.slice(0, 20);
        current_central_points = get_current_central_points([
            current_pax[current_pax.length - 1],
        ]);
        cumulative_isos = get_current_isos(current_pax);
    } else if (step == "21") {
        console.log("2010");
        current_pax = pax_timeline.slice(0, 21);
        current_central_points = get_current_central_points([
            current_pax[current_pax.length - 1],
        ]);
        cumulative_isos = get_current_isos(current_pax);
    } else if (step == "22") {
        console.log("2011");
        current_pax = pax_timeline.slice(0, 22);
        current_central_points = get_current_central_points([
            current_pax[current_pax.length - 1],
        ]);
        cumulative_isos = get_current_isos(current_pax);
    } else if (step == "23") {
        console.log("2012");
        current_pax = pax_timeline.slice(0, 23);
        current_central_points = get_current_central_points([
            current_pax[current_pax.length - 1],
        ]);
        cumulative_isos = get_current_isos(current_pax);
    } else if (step == "24") {
        console.log("2013");
        current_pax = pax_timeline.slice(0, 24);
        current_central_points = get_current_central_points([
            current_pax[current_pax.length - 1],
        ]);
        cumulative_isos = get_current_isos(current_pax);
    } else if (step == "25") {
        console.log("2014");
        current_pax = pax_timeline.slice(0, 25);
        current_central_points = get_current_central_points([
            current_pax[current_pax.length - 1],
        ]);
        cumulative_isos = get_current_isos(current_pax);
    } else if (step == "26") {
        console.log("2015");
        current_pax = pax_timeline.slice(0, 26);
        current_central_points = get_current_central_points([
            current_pax[current_pax.length - 1],
        ]);
        cumulative_isos = get_current_isos(current_pax);
    } else if (step == "27") {
        console.log("2016");
        current_pax = pax_timeline.slice(0, 27);
        current_central_points = get_current_central_points([
            current_pax[current_pax.length - 1],
        ]);
        cumulative_isos = get_current_isos(current_pax);
    } else if (step == "28") {
        console.log("2017");
        current_pax = pax_timeline.slice(0, 28);
        current_central_points = get_current_central_points([
            current_pax[current_pax.length - 1],
        ]);
        cumulative_isos = get_current_isos(current_pax);
    } else if (step == "29") {
        console.log("2018");
        current_pax = pax_timeline.slice(0, 29);
        current_central_points = get_current_central_points([
            current_pax[current_pax.length - 1],
        ]);
        cumulative_isos = get_current_isos(current_pax);
    } else if (step == "30") {
        console.log("2019");
        current_pax = pax_timeline.slice(0, 30);
        current_central_points = get_current_central_points([
            current_pax[current_pax.length - 1],
        ]);
        cumulative_isos = get_current_isos(current_pax);
    } else if (step == "31") {
        console.log("2020");
        current_pax = pax_timeline.slice(0, 31);
        current_central_points = get_current_central_points([
            current_pax[current_pax.length - 1],
        ]);
        cumulative_isos = get_current_isos(current_pax);
    } else if (step == "32") {
        console.log("2021");
        current_pax = pax_timeline.slice(0, 32);
        current_central_points = get_current_central_points([
            current_pax[current_pax.length - 1],
        ]);
        cumulative_isos = get_current_isos(current_pax);
    } else if (step == "33") {
        current_pax = pax_timeline.slice(0, 33);
        current_central_points = get_current_central_points([
            current_pax[current_pax.length - 1],
        ]);
        cumulative_isos = get_current_isos(current_pax);
    } else if (step == "34") {
        console.log("2023");
        reorder = true;
        years = current_years;
        current_pax = pax_timeline.slice(0, 34);
        current_central_points = get_current_central_points([
            current_pax[current_pax.length - 1],
        ]);
        cumulative_isos = get_current_isos(current_pax);
    } else if (step == "35") {
        console.log("reorder");
        reorder = true;
        years = most_women;
    }

    function formatMobile(tick) {
        return "'" + tick.toString().slice(-2);
    }
</script>

{#if current_pax}
    <div class="wrapper" bind:clientWidth={width} bind:clientHeight={height}>
        {#if mygeojson}
            <LayerCake data={mygeojson}>
                <Svg>
                    <Map
                        projectionName={"geoNaturalEarth1"}
                        {cumulative_isos}
                    />
                    <Point
                        projectionName={"geoNaturalEarth1"}
                        pointsData={current_central_points}
                    />
                    <g
                        transform="translate({margin.left}, {innerHeight -
                            200})"
                    >
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
