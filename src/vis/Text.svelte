<script>
    export let pax_gender;

    let width = 400;
    let height = 400;

    const margin = {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10,
    };

    const totalRectangles = 436;
    const gap = 3; // Gap between rectangles

    let numCols, numRows;

    // Reactive calculation of rows, columns, and rectangle dimensions
    $: {
        numCols = Math.ceil(Math.sqrt(totalRectangles));
        numRows = Math.ceil(totalRectangles / numCols);
    }

    // Reactive generation of rectangle data (x, y, width, height)
    let rectangles;
    $: if (pax_gender) {
        rectangles = pax_gender.map((item, i) => {
            const maxNCharacters = +item.N_characters; // Total characters
            const womCharacters = +item.text.length; // Women characters

            // console.log(maxNCharacters, womCharacters);
            if (womCharacters > maxNCharacters) {
                console.log(item);
                
            }
            
            const rectWidth =
                (width - margin.left - margin.right) / numCols - gap;

            const rectHeight =
                (height - margin.top - margin.bottom) / numRows - gap;

            // Full area for the maximum number of characters
            const fullArea = rectWidth * rectHeight;

            // Calculate the height (wHeight) that corresponds to womCharacters
            const wArea = (womCharacters / maxNCharacters) * fullArea;
            const wHeight = wArea / rectWidth; // Since width remains the same

            return {
                x: (i % numCols) * (rectWidth + gap) + margin.left,
                y: Math.floor(i / numCols) * (rectHeight + gap) + margin.top,
                width: rectWidth,
                height: rectHeight,
                wHeight: wHeight, // Height representing womCharacters
            };
        });
    }
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
                    fill="white"
                    stroke="gray"
                    stroke-width="0.5"
                />
            {/each}
            {#each rectangles as rect}
                <rect
                    x={rect.x}
                    y={rect.y}
                    width={rect.width}
                    height={rect.wHeight}
                    fill="black"
                />
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
