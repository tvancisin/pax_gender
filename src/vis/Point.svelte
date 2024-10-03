<script>
	import { getContext } from "svelte";
	import * as geo from "d3-geo";

	const { data, width, height } = getContext("LayerCake");

	export let projectionName = "geoNaturalEarth1";
	export let pointsData = [];

	$: projection = geo[projectionName]().fitSize([$width, $height], $data);
</script>

<g class="points">
	{#each pointsData as point}
		<circle
			cx={projection([point.longitude, point.latitude])[0]}
			cy={projection([point.longitude, point.latitude])[1]}
			r="4"
		></circle>
	{/each}
</g>

<style>
	circle {
		fill: #000;
		stroke: #fff;
		stroke-width: 1;
	}
</style>
