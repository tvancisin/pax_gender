<script>
    import * as d3 from "d3";

    export let pax_gender_timeline;
    $: console.log(pax_gender_timeline);

    let width, height, years, maxEntries;

    // Margins and scales
    const margin = { top: 20, right: 20, bottom: 20, left: 40 };
    let innerWidth, innerHeight, xScale, yScale;

    $: if (pax_gender_timeline) {
        innerWidth = width - margin.left - margin.right;
        innerHeight = height - margin.top - margin.bottom;

        years = pax_gender_timeline.map((d) => d[0]);
        console.log(years);

        xScale = d3
            .scaleBand()
            .domain(years)
            .range([0, innerWidth])
            .padding(0.1);

        maxEntries = d3.max(pax_gender_timeline, (d) => d[1].length);
        console.log(maxEntries);

        yScale = d3
            .scaleLinear()
            .domain([0, 100])
            .range([innerHeight, 0]);

        // // Function to generate line paths
    }
    function lineGenerator(x, y) {
        const points = [
            [x, y],
            [x + xScale.bandwidth() / 2, y + Math.random() * 10 - 5],
            [x + xScale.bandwidth(), y],
        ];
        return d3.line()(points);
    }
</script>

{#if pax_gender_timeline}
    <div class="wrapper" bind:clientWidth={width} bind:clientHeight={height}>
        <svg {width} {height}>
            <g transform="translate({margin.left}, {margin.top})">
                {#each pax_gender_timeline as [year, entries]}
                    <!-- Draw paths for each year -->
                    {#each entries as entry, i}
                        <path
                            d={lineGenerator(
                                xScale(year),
                                yScale(i + 1), // Stack paths based on the index
                            )}
                            fill="none"
                            stroke="black"
                            stroke-width="1"
                        />
                    {/each}
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
