<script>
    import { fade } from "svelte/transition"; // Import Svelte's fade transition
    import * as d3 from "d3";

    export let pax;
    export let pax_gender;
    export let step;
    let width, height, current_pax;
    const gap = 1;
    current_pax = pax;

    const gender_id_list = [];
    pax_gender.forEach(function (d) {
        gender_id_list.push(d.AgtId);
    });
    $: console.log(gender_id_list.length);
     

    const all_id_list = [];
    pax.forEach(function (d) {
        all_id_list.push(d.AgtId);
    });

    function diffArray(arr1, arr2) {
        return [
            ...arr1.filter((elem1) => arr2.every((elem2) => elem2 != elem1)),
            ...arr2.filter((elem1) => arr1.every((elem2) => elem2 != elem1)),
        ];
    }

    const non_gender_id_list = diffArray(all_id_list, gender_id_list)

    const margin = {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10,
    };

    $: if (step == "one") {
        // get_them_back();
        non_gender_id_list.forEach(function (d) {
            d3.select("._" + d).style("fill", "steelblue");
        });
    } else if (step == "two") {
        removeTenRectanglesOneByOne();
        non_gender_id_list.forEach(function (d) {
            d3.select("._" + d).style("fill", "white");
        });
    } else if (step == "three") {
        // current_pax = pax_gender
        console.log("three");
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

    // Generate grid positions for rectangles
    $: gridData = Array.from({ length: initialPaxCount }, (_, i) => {
        const col = i % numCols;
        const row = Math.floor(i / numCols);
        return { col, row };
    });

    function get_them_back() {
        current_pax = pax;
    }

    // Function to remove 10 rectangles with a delay, one by one
    function removeTenRectanglesOneByOne() {
        const filteredArray = pax.filter(item => gender_id_list.includes(item.AgtId));
        console.log(filteredArray);
        


        // current_pax = pax_gender;
        // let count = 0;
        // const interval = setInterval(() => {
        //     if (count < 1567 && pax.length > 0) {
        //         pax = pax.slice(0, pax.length - 1); // Remove one rectangle at a time
        //         count++;
        //     } else {
        //         clearInterval(interval); // Stop after 10 rectangles are removed
        //     }
        // }, 1); // Delay of 200ms between each removal
    }

</script>

<div class="wrapper" bind:clientWidth={width} bind:clientHeight={height}>
    <svg {width} {height}>
        <g
            class="inner_chart"
            transform="translate({margin.left}, {margin.top})"
        >
            {#each gridData as { col, row }, i (i)}
                {#if current_pax[i]}
                    <!-- Only show rectangles if the corresponding pax entry exists -->
                    <circle
                        cx={col * (rectWidth + gap)}
                        cy={row * (rectHeight + gap)}
                        r={rectWidth / 2}
                        fill="steelblue"
                        class={"_" + current_pax[i].AgtId}
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
    circle {
        transition: 1s;
    }
</style>
