<script>
    import { interpolateMagma } from "d3";
    import IndividualRectangle from "./IndividualRectangle.svelte";

    export let pax_gender;
    export let step;

    let width = 400;
    let height = 400;

    const margin = {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10,
    };

    const totalRectangles = 436;
    const gap = 6; // Gap between rectangles

    let numCols, numRows;

    // Reactive calculation of rows, columns, and rectangle dimensions
    $: {
        numCols = Math.ceil(Math.sqrt(totalRectangles));
        numRows = Math.ceil(totalRectangles / numCols);
    }

    // Reactive generation of rectangle data (x, y, width, height)
    let rectangles;
    $: if (pax_gender || step == "rect_one") {
        rectangles = pax_gender.map((item, i) => {
            const maxNCharacters = +item.corr_char_no; // Total characters
            const womCharacters = +item.text.length; // Women characters
            const quotCharacters = item.quotas;
            const lawCharacters = item.law;
            const unCharacters = item.un;

            // console.log(quotCharacters, lawCharacters, unCharacters);
            
            const rectWidth =
                (width - margin.left - margin.right) / numCols - gap;

            const rectHeight =
                (height - margin.top - margin.bottom) / numRows - gap;

            // Full area for the maximum number of characters
            const fullArea = rectWidth * rectHeight;

            // Calculate the height (wHeight) that corresponds to womCharacters
            const wArea = (womCharacters / maxNCharacters) * fullArea;
            const qArea = (quotCharacters / maxNCharacters) * fullArea;
            const lawArea = (lawCharacters / maxNCharacters) * fullArea;
            const unArea = (unCharacters / maxNCharacters) * fullArea;

            const wHeight = wArea / rectWidth; // Since width remains the same
            const qHeight = qArea / rectWidth;
            const lHeight = lawArea / rectWidth;
            const uHeight = unArea / rectWidth;

            return {
                x: (i % numCols) * (rectWidth + gap) + margin.left,
                y: Math.floor(i / numCols) * (rectHeight + gap) + margin.top,
                width: rectWidth,
                height: rectHeight,
                wHeight: wHeight, // Height representing womCharacters
                qHeight: qHeight,
                lHeight: lHeight,
                uHeight: uHeight,
                int_law: item.WggIntLaw,
                unsc: item.WggUnsc,
            };
        });
    }

    $: if (step == "rect_two") {
        rectangles.map((item) => {
            item.wHeight = item.qHeight;
        });
        rectangles = rectangles;
    } else if (step == "rect_three") {
        rectangles.map((item) => {
            item.wHeight = item.lHeight;
        });
        rectangles = rectangles;
    } else if (step == "rect_four") {
        rectangles.map((item) => {
            item.wHeight = item.uHeight;
        });
        rectangles = rectangles;
    }

</script>

{#if rectangles}
    <div class="wrapper" bind:clientWidth={width} bind:clientHeight={height}>
        <svg {width} {height}>
            {#each rectangles as rect}
                <IndividualRectangle
                    x={rect.x + Math.random() * 2 - 1}
                    y={rect.y}
                    {rect}
                    {step}
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
