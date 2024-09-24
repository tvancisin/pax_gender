<script>
    import * as d3 from "d3";

    export let pax;
    export let pax_gender;
    export let step;
    let width, height, current_pax;
    const gap = 3;
    current_pax = pax;

    const margin = {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10,
    };

    $: if (step == "one") {
        current_pax = pax;
    } else if (step == "two") {
        current_pax = pax_gender;
    } else if (step == "three") {
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

    // Generate a more controlled line that mimics handwriting
    function generateHandwrittenLine(x, y, length) {
        const points = [];
        const segments = 5; // Number of segments
        const segmentLength = length / segments;

        let currentX = x;
        let currentY = y;

        for (let i = 0; i <= segments; i++) {
            const randomOffsetX = Math.random() * segmentLength * 0.3; // Small variation in X
            const randomOffsetY = Math.random() * 3 - 1.5; // Controlled Y deviation (no sharp deviations)

            currentX += segmentLength; // Move right progressively
            currentY += randomOffsetY; // Apply subtle up-down variations

            points.push([currentX + randomOffsetX, currentY]);
        }
        return points;
    }

    // Create a line generator using d3.line with curveMonotoneX to maintain left-to-right flow
    const lineGenerator = d3
        .line()
        .x((d) => d[0]) // X coordinate from the generated points
        .y((d) => d[1]) // Y coordinate from the generated points
        .curve(d3.curveMonotoneX); // Ensures the line progresses monotonically in the X direction

</script>

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
                                (i % numCols) * (rectWidth + gap),
                                Math.floor(i / numCols) * (rectHeight + gap),
                                rectWidth,
                            ),
                        )}
                        fill="none"
                        stroke="black"
                        stroke-width="0.5"
                    />
            {/each}
        </g>
    </svg>
</div>

<style>
    .wrapper {
        height: 90vh;
        position: relative;
    }
</style>