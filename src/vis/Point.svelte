<script>
	import { getContext } from "svelte";
	import * as geo from "d3-geo";
	import * as d3 from "d3";
	import { generateHandwrittenLine } from "../utils";

	const { data, width, height } = getContext("LayerCake");

	export let projectionName = "geoNaturalEarth1";
	export let pointsData = [];

	$: projection = geo[projectionName]().fitSize([$width, $height], $data);

	const lineGenerator = d3
		.line()
		.x((d) => d[0]) // X coordinate from the generated points
		.y((d) => d[1]) // Y coordinate from the generated points
		.curve(d3.curveMonotoneX); // Ensures the line progresse

</script>

<g class="points">
	{#each pointsData as point, i}
		<!-- <circle
			cx={projection([point.longitude, point.latitude])[0]}
			cy={projection([point.longitude, point.latitude])[1]}
			r="4"
		></circle> -->
		<path
			d={lineGenerator(
				generateHandwrittenLine(
					projection([point.longitude, point.latitude])[0] - 10,
					projection([point.longitude, point.latitude])[1] - i,
					20,
				),
			)}
			fill="none"
			stroke="black"
			stroke-width="1"
		/>
	{/each}
</g>

<style>
	circle {
		fill: #000;
		stroke: #fff;
		stroke-width: 1;
	}
</style>
