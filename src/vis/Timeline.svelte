<script>
    import * as d3 from "d3";

    export let pax_gender_timeline;
    export let pax_timeline;
    export let pax_gender;
    export let step;

    let width, height, years, maxEntries, current_pax;

    // Margins and scales
    const margin = { top: 20, right: 20, bottom: 20, left: 40 };
    let innerWidth, innerHeight, xScale, yScale;

    $: current_pax = pax_timeline;

    $: if (step == "time_one") {
        console.log("one");
        current_pax = pax_timeline;
    } else if (step == "time_two") {
        console.log("two");
        current_pax = pax_gender_timeline;
    } else if (step == "time_three") {
        let participation = pax_gender.filter((d) => d.WggPar == 1);
        current_pax = d3.groups(participation, (d) => d.Dat.substring(0, 4));
    } else if (step == "time_four") {
        let implementation = pax_gender.filter((d) => d.WggImplSign == 1);
        current_pax = d3.groups(implementation, (d) => d.Dat.substring(0, 4));
    }

    $: if (current_pax) {
        innerWidth = width - margin.left - margin.right;
        innerHeight = height - margin.top - margin.bottom;

        years = current_pax.map((d) => d[0]);
        console.log(years);

        xScale = d3
            .scaleBand()
            .domain(years)
            .range([0, innerWidth])
            .padding(0.1);

        maxEntries = d3.max(current_pax, (d) => d[1].length);
        console.log(maxEntries);

        yScale = d3.scaleLinear().domain([0, 100]).range([innerHeight, 0]);

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

{#if current_pax}
    <div class="wrapper" bind:clientWidth={width} bind:clientHeight={height}>
        <svg {width} {height}>
            <g transform="translate({margin.left}, {margin.top})">
                {#each current_pax as [year, entries]}
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
