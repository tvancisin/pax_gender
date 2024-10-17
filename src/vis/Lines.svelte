<script>
    import * as d3 from "d3";
    import { generateHandwrittenLine, lineGenerator } from "../utils";

    export let pax;
    export let pax_gender;
    export let step;

    let width = 400;
    let height = 400;
    let current_pax, def_pax, def_pax_gender;
    let gap = 4;

    current_pax = pax;
    def_pax = pax;
    def_pax_gender = pax_gender;

    const margin = {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10,
    };

    $: if (step == "one") {
        current_pax = pax;
        d3.selectAll(".agt").style("stroke", "black");
    } else if (step == "two") {
        d3.selectAll(".agt").style("stroke", "#e6e6e6");
        d3.selectAll(".quotas").style("stroke", "black");
    } else if (step == "three") {
        d3.selectAll(".agt").style("stroke", "#e6e6e6");
        d3.selectAll(".inter_law").style("stroke", "black");
    } else if (step == "four") {
        d3.selectAll(".agt").style("stroke", "#e6e6e6");
        d3.selectAll(".un").style("stroke", "black");
    }

    $: innerWidth = width - margin.left - margin.right;
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

    //Construct the class string
    function getClassString(paxItem) {
        let classes = ["agt"];
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

    function show_info (d) {
        console.log(d)
        
    }

</script>

{#if current_pax}
    <div class="wrapper" bind:clientWidth={width} bind:clientHeight={height}>
        <svg {width} {height}>
            <g
                class="inner_chart"
                transform="translate({margin.left}, {margin.top})"
            >
                {#each current_pax as paxItem, i (i)}
                    <!-- Calculate col and row based on the index -->
                    <path
                        d={lineGenerator(
                            generateHandwrittenLine(
                                (i % numCols) * (rectWidth + gap) +
                                    Math.random() * 4 -
                                    2, // X position remains the same
                                innerHeight -
                                    (Math.floor(i / numCols) + 1) *
                                        (rectHeight + gap), // Invert Y position
                                rectWidth,
                            ),
                        )}
                        fill="none"
                        stroke="black"
                        stroke-width="2"
                        class={getClassString(paxItem)}
                        cursor="pointer"
                        on:mouseover={() => show_info(paxItem)}
                        on:focus={() => show_info(paxItem)}
                    />
                {/each}
            </g>
        </svg>
    </div>
{/if}

<style>
    .wrapper {
        height: 90vh;
        position: relative;
    }
</style>
