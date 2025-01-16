<script>
    import * as d3 from "d3";
    import IndividualRectangle from "./IndividualRectangle.svelte";
    import { years } from "../utils";

    export let pax;
    export let pax_timeline;
    export let step;
    export let afghanistan;

    let width = 400;
    let height = 400;
    let gender_text = [];
    let rendered_data;
    let innerWidth, innerHeight, xScale, yScale;
    let margin = { top: 20, right: 20, bottom: 20, left: 40 };

    $: innerWidth = width - margin.left - margin.right;
    $: innerHeight = height - margin.top - margin.bottom;

    $: xScale = d3
        .scaleBand()
        .domain(years)
        .range([0, innerWidth])
        .padding(0.1);

    $: yScale = d3.scaleLinear().domain([0, 100]).range([innerHeight, 0]);
    $: yHeight = d3.scaleLinear().domain([0, 40000]).range([0, innerHeight]);

    function position_calc(pax, innerWidth, filter) {
        let previousYear = null; // Track the last year seen
        let index;
        index = filter === "none" ? 0 : -1;

        let calculated_positions = pax.map((d) => {
            let yPosition;

            const currentYear = d.Dat.substring(6, 10);
            // Reset index if the year has changed
            if (currentYear !== previousYear) {
                index = filter === "none" ? 0 : -1;
                previousYear = currentYear;
            }

            if (filter == "none") {
                yPosition = yScale(index);
            } else {
                yPosition =
                    d[filter] === "1" ? yScale(++index) : innerHeight + 100;
            }

            const result = {
                x: xScale(currentYear) + Math.random() * 2 - 1,
                y: yPosition + Math.random() * 2 - 1,
                width: xScale.bandwidth(),
                height: 3,
                info: d.Agt,
            };

            if (filter === "none") index++;
            return result;
        });
        return calculated_positions;
    }

    //initial functions
    $: if (pax) {
        let previousYear = null; // Track the last year seen
        let index = 0; // Index that changes based on GeWom value
        rendered_data = pax.map((d) => {
            const currentYear = d.Dat.substring(6, 10);

            // Reset index if the year has changed
            if (currentYear !== previousYear) {
                index = 0;
                previousYear = currentYear;
            }

            // Determine y position based on GeWom value
            const yPosition =
                d.Con === "Afghanistan" ? yScale(++index) : innerHeight + 100;

            return {
                x: xScale(currentYear),
                y: yPosition,
                width: xScale.bandwidth(),
                height: 3,
            };
        });
    }
    //steps
    $: if (step == "afgh01") {
        let previousYear = null; // Track the last year seen
        let index = 0; // Index that changes based on GeWom value
        rendered_data = pax.map((d) => {
            const currentYear = d.Dat.substring(6, 10);

            // Reset index if the year has changed
            if (currentYear !== previousYear) {
                index = 0;
                previousYear = currentYear;
            }

            // Determine y position based on GeWom value
            const yPosition =
                d.Con === "Afghanistan" ? yScale(++index) : innerHeight + 100;

            return {
                x: xScale(currentYear),
                y: yPosition,
                width: xScale.bandwidth(),
                height: 3,
            };
        });
    } else if (step == "afgh02") {
        let index = 0; // Index that changes based on GeWom value
        rendered_data = pax.map((d) => {
            // Calculate the width of each part and apply a gap
            const partWidth = innerWidth / 22;
            const elementWidth = partWidth - 4; // Leave 4px gap

            // Set x position based on the current index
            const xPosition = index * partWidth;

            // Determine y position based on GeWom value
            const yPosition = d.Con === "Afghanistan" ? 10 : innerHeight + 100;

            // Increment index only if d.Con is "Afghanistan"
            if (d.Con === "Afghanistan") {
                index++;
                // Reset index if it exceeds 22 parts to loop back
                if (index >= 22) {
                    index = 0;
                }
            }

            return {
                x: xPosition,
                y: yPosition,
                width: elementWidth,
                height: 3,
                info: d.info,
            };
        });
    } else if (step == "afgh03") {
        // all agreements
        //lenghts of agreements and gender text highlight
        gender_text = []; // Reset before populating it in this step
        function construct_gender(id, x, w, h, y) {
            let filteredResults = afghanistan.filter(
                (item) => item.AgtID === id,
            );

            if (filteredResults.length !== 0) {
                filteredResults.forEach((d) => {
                    // Push the new object into the persistent `blaa` array
                    gender_text.push({
                        x: x,
                        y: y + (h / 100) * d.provisionLocation,
                        width: w,
                        height: 3,
                    });
                });
                // Reassign to itself to trigger reactivity
                gender_text = [...gender_text];
            }
        }

        let index = 0; // Index that changes based on GeWom value
        rendered_data = pax.map((d) => {
            // Calculate the width of each part and apply a gap
            const partWidth = innerWidth / 22;
            const elementWidth = partWidth - 4; // Leave 4px gap

            // Set x position based on the current index
            let xPosition = index * partWidth;
            let agt_height;
            let yPosition;
            // Increment index only if d.Con is "Afghanistan"
            if (d.Con === "Afghanistan") {
                index++;
                // Reset index if it exceeds 22 parts to loop back
                if (index >= 22) {
                    index = 0;
                }

                yPosition = 10;
                agt_height = yHeight(d.N_characters);
                construct_gender(
                    d.AgtId,
                    xPosition,
                    elementWidth,
                    agt_height,
                    yPosition,
                );
            } else {
                yPosition = innerHeight + 100;
                agt_height = 0;
            }

            return {
                x: xPosition,
                y: yPosition,
                width: elementWidth,
                height: agt_height,
                info: d.Agt,
            };
        });
    }

    function formatMobile(tick) {
        return "'" + tick.toString().slice(-2);
    }

    $: console.log(step);
</script>

{#if rendered_data && pax_timeline}
    <div class="wrapper" bind:clientWidth={width} bind:clientHeight={height}>
        <svg {width} {height}>
            <g
                class="timeline"
                transform="translate({margin.left}, {margin.top})"
            >
                {#each rendered_data as d, i}
                    <IndividualRectangle
                        {i}
                        id={d.id}
                        x={d.x}
                        y={d.y}
                        width={d.width}
                        height={d.height}
                        info={d.info}
                    />
                {/each}
                {#each gender_text as d}
                    <rect
                        class="gender_text"
                        x={d.x + 2}
                        y={+d.y - 2}
                        width={d.width - 4}
                        height={d.height}
                        fill="black"
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
    .tick {
        font-size: 0.725em;
        font-weight: 200;
    }

    .un_resolution {
        visibility: hidden;
    }

    .tick text {
        fill: white;
        text-anchor: start;
        font-size: 12px;
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
        width: 100%; /* Full width of the parent/container */
        height: 100%; /* Full height of the parent/container if needed */
        display: flex; /* Enables flexbox for centering */
        justify-content: center;
        overflow: hidden; /* Prevents content overflow */
        opacity: 0;
        transition: 0.5s ease;
    }

    #example img {
        position: absolute;
        top: 0px;
        max-width: 80%; /* Ensures the image scales within the width of its container */
        height: auto; /* Maintains the aspect ratio of the image */
        display: block; /* Removes extra space below the image (from inline elements) */
    }
</style>
