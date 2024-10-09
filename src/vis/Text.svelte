<script>
    export let pax_gender;

    $: console.log(pax_gender);
    

    let width = 400;
    let height = 400;

    const margin = {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10,
    };

    // Number of rectangles and grid dimensions
    const totalRectangles = 436;
    let numCols, numRows;

    // Reactive calculation of rows, columns, and rectangle dimensions
    $: {
        numCols = Math.ceil(Math.sqrt(totalRectangles));
        numRows = Math.ceil(totalRectangles / numCols);
    }

    // Reactive generation of rectangle data (x, y, width, height)
    $: rectangles = Array.from({ length: totalRectangles }).map((_, i) => {
        const rectWidth = (width - margin.left - margin.right) / numCols;
        const rectHeight = (height - margin.top - margin.bottom) / numRows;
        return {
            x: (i % numCols) * rectWidth + margin.left,
            y: Math.floor(i / numCols) * rectHeight + margin.top,
            width: rectWidth,
            height: rectHeight,
        };
    });
</script>

{#if pax_gender}
    <div class="wrapper" bind:clientWidth={width} bind:clientHeight={height}>
        <svg {width} {height}>
            {#each rectangles as rect}
                <rect
                    x={rect.x}
                    y={rect.y}
                    width={rect.width}
                    height={rect.height}
                    fill="lightblue"
                    stroke="white" />
            {/each}
        </svg>
    </div>
{/if}

<style>
    .wrapper {
        height: 90vh;
        position: relative;
    }
</style>
