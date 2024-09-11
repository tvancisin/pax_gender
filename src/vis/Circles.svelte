<script>
    import { fade } from "svelte/transition"; // Import Svelte's fade transition
    import * as d3 from "d3";

    export let pax = []; // Assume pax is an array with over 2000 entries
    let width, height;
    const gap = 1; // Set the gap between rectangles

    const margin = {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10,
    };

    $: innerWidth = width - margin.left - margin.right;
    $: innerHeight = height - margin.top - margin.bottom;

    // Store initial number of rectangles to fix grid size
    const initialPaxCount = pax.length;

    // Dynamically calculate the number of columns based on the width and the initial pax count
    $: numCols = Math.ceil(Math.sqrt(initialPaxCount * (innerWidth / innerHeight)));
    $: numRows = Math.ceil(initialPaxCount / numCols);

    // Calculate available space after accounting for gaps
    $: totalGapX = (numCols - 1) * gap;
    $: totalGapY = (numRows - 1) * gap;

    // Compute the width and height of each rectangle, accounting for gaps
    $: rectWidth = (innerWidth - totalGapX) / numCols;
    $: rectHeight = (innerHeight - totalGapY) / numRows;

    // Generate grid positions for rectangles
    $: gridData = Array.from({ length: initialPaxCount }, (_, i) => {
        const col = i % numCols;
        const row = Math.floor(i / numCols);
        return { col, row };
    });

    // Function to remove 10 rectangles with a delay, one by one
    function removeTenRectanglesOneByOne() {
        let count = 0;
        const interval = setInterval(() => {
            if (count < 1800 && pax.length > 0) {
                pax = pax.slice(0, pax.length - 1); // Remove one rectangle at a time
                count++;
            } else {
                clearInterval(interval); // Stop after 10 rectangles are removed
            }
        }, 1); // Delay of 200ms between each removal
    }
</script>

<div class="wrapper" bind:clientWidth={width} bind:clientHeight={height}>
    <button on:click={removeTenRectanglesOneByOne}>Remove 10 Rectangles One by One</button>

    <svg {width} {height}>
        <g
            class="inner_chart"
            transform="translate({margin.left}, {margin.top})"
        >
            {#each gridData as { col, row }, i (i)}
                {#if pax[i]} <!-- Only show rectangles if the corresponding pax entry exists -->
                    <rect
                        x={col * (rectWidth + gap)}
                        y={row * (rectHeight + gap)}
                        width={rectWidth}
                        height={rectHeight}
                        fill="black"
                        transition:fade={{ duration: 400 }}
                    />
                {/if}
            {/each}
        </g>
    </svg>
</div>

<style>
    .wrapper {
        height: 90vh;
        position: relative;
    }

    button {
        position: absolute;
        top: 10px;
        left: 10px;
        z-index: 1;
    }
</style>