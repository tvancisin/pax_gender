<script>
    import * as d3 from "d3";
    import { generateHandwrittenLine, lineGenerator } from "../utils";
    import Map from "./Map.svelte";
    import { slide } from "svelte/transition";
    import Datapoint from "./Datapoint.svelte";

    export let pax;
    export let pax_gender;
    export let step;
    export let central_points;
    export let mygeojson;

    let width = 400;
    let height = 400;
    let current_central_points;
    let current_pax, def_pax, def_pax_gender;
    let gap = 2;

    let current_isos;
    let cumulative_isos;
    function get_current_central_points(pax) {
        current_isos = pax
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
        const matchingLoc1ISO = data
            // .filter((d) => d.GeWom === "1")
            .map((d) => d.Loc1ISO);

        return matchingLoc1ISO;
    }

    current_pax = pax;
    def_pax = pax;
    def_pax_gender = pax_gender;

    $: rects_svg_width = width * 0.2;
    $: map_svg_width = width * 0.8 - margin.left - margin.right;

    $: innerWidth = rects_svg_width - margin.left - margin.right;
    $: innerHeight = height - margin.top - margin.bottom;

    // Store initial number of rectangles to fix grid size
    const initialPaxCount = pax.length;

    // Dynamically calculate the number of columns based on the width and the initial pax count
    $: numCols = Math.ceil(
        Math.sqrt(initialPaxCount * (innerWidth / innerHeight)),
    );
    $: numRows = Math.ceil(initialPaxCount / numCols);

    // Calculate available space after accounting for gaps
    $: totalGapX = (numCols - 1) * gap;
    $: totalGapY = (numRows - 1) * gap;

    // Compute the width and height of each rectangle, accounting for gaps
    $: rectWidth = (innerWidth - totalGapX) / numCols;
    $: rectHeight = (innerHeight - totalGapY) / numRows;

    $: if (current_pax && central_points) {
        current_central_points = get_current_central_points(current_pax);
        cumulative_isos = get_current_isos(current_pax);
    }

    const margin = {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10,
    };

    $: if (step == "one") {
        current_pax = pax;
        d3.selectAll(".agt").style("fill", "black");
    } else if (step == "two") {
        rendered_data = current_pax.map((d, i) => {
            return {
                x: (i % numCols) * (rectWidth + gap),
                y:
                    innerHeight -
                    (Math.floor(i / numCols) + 1) * (rectHeight + gap),
                width: rectWidth,
                height: rectHeight,
            };
        });

    } else if (step == "three") {
        rendered_data = current_pax.map((d, i) => {
            return {
                x: d.GeWom === "1" ? (i % numCols) * (rectWidth + gap) : -50,
                y:
                    innerHeight -
                    (Math.floor(i / numCols) + 1) * (rectHeight + gap),
                width: rectWidth,
                height: rectHeight, // Conditional height
            };
        });

        d3.selectAll(".agt").style("fill", "white");
        d3.selectAll(".quotas").style("fill", "black");
    } else if (step == "four") {
        d3.selectAll(".agt").style("fill", "white");
        d3.selectAll(".inter_law").style("fill", "black");
    } else if (step == "five") {
        d3.selectAll(".agt").style("fill", "white");
        d3.selectAll(".un").style("fill", "black");
    }

    $: rendered_data = current_pax.map((d, i) => {
        return {
            x: 0,
            y: innerHeight - (Math.floor(i / numCols) + 1) * (rectHeight + gap),
            width: 1,
            height: 1,
        };
    });

    //Construct the class string
    function getClassString(paxItem) {
        let classes = ["agt"];
        if (paxItem.GeWom == "1") {
            classes.push("gender");
        }
        if (paxItem.WggGenQuot === "1") {
            classes.push("quotas");
        }
        if (paxItem.WggIntLaw === "1") {
            classes.push("inter_law");
        }

        if (paxItem.WggUnsc === "1") {
            classes.push("un");
        }
        return classes.join(" ");
    }

    function show_info(d) {
        // console.log(d);
    }
</script>

{#if current_pax}
    <div class="wrapper" bind:clientWidth={width} bind:clientHeight={height}>
        <svg width={rects_svg_width} {height}>
            <g
                class="inner_chart"
                transform="translate({margin.left}, {margin.top})"
            >
                {#each rendered_data as d, i}
                    <Datapoint
                        {i}
                        x={d.x}
                        y={d.y}
                        width={d.width}
                        height={d.height}
                    />
                {/each}
            </g>
        </svg>
        <!-- <Map
            projectionName={"geoNaturalEarth1"}
            {cumulative_isos}
            {map_svg_width}
            {height}
            {mygeojson}
        /> -->
    </div>
{/if}

<style>
    .wrapper {
        height: 90vh;
        position: relative;
    }
</style>
