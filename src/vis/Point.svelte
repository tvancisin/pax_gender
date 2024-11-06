<script>
	import { getContext } from "svelte";
	import * as geo from "d3-geo";
	import * as d3 from "d3";
	import { years } from "../utils";
	import { generateHandwrittenLine } from "../utils";

	const { data, width, height } = getContext("LayerCake");

	export let projectionName = "geoNaturalEarth1";
	export let pointsData = [];
	export let line_width;
	export let pax_timeline;

	let innerWidth, innerHeight, xScale, yScale;
	const margin = { top: 20, right: 20, bottom: 20, left: 40 };

	$: innerWidth = line_width - margin.left - margin.right;
	$: console.log(innerWidth);

	$: xScale = d3
		.scaleBand()
		.domain(years)
		.range([0, innerWidth])
		.padding(0.1);

	$: yScale = d3.scaleLinear().domain([0, 100]).range([100, 0]);

	$: projection = geo[projectionName]().fitSize([$width, $height], $data);

	function checking(data) {
		// console.log(projection([data.longitude, data.latitude]));
		return 3;
	}

	function chaa(d) {
		// console.log(d);
		const result = pax_timeline.find(item => item[0] === d);
		let final = result[1].length
		
		return 500 - final;
	}
</script>

<g class="points">
	<!-- {#each pointsData as point, i}
		<circle
			cx={projection([point.longitude, point.latitude])[0]}
			cy={projection([point.longitude, point.latitude])[1]}
			r={checking(point)}
		></circle>
	{/each}
	{#each years as yr}
		<line
			x1={projection([-103, 12])[0]}
			y1={projection([-103, 12])[1]}
			x2={xScale(yr) + 40}
			y2={chaa(yr)}
		></line>
	{/each} -->
</g>

<style>
	circle {
		fill: yellow;
		stroke: black;
		stroke-width: 1;
	}
	line {
		stroke: black;
	}
</style>
