<script>
	// CORE IMPORTS
	import { setContext, onMount } from "svelte";
	import { getMotion } from "./utils.js";
	import { themes } from "./config.js";
	import ONSHeader from "./layout/ONSHeader.svelte";
	import ONSFooter from "./layout/ONSFooter.svelte";
	import Header from "./layout/Header.svelte";
	import Section from "./layout/Section.svelte";
	import Media from "./layout/Media.svelte";
	import Scroller from "./layout/Scroller.svelte";
	import Filler from "./layout/Filler.svelte";
	import Divider from "./layout/Divider.svelte";
	import Toggle from "./ui/Toggle.svelte";
	import Arrow from "./ui/Arrow.svelte";
	import Em from "./ui/Em.svelte";

	import { setColors, getGEO, getCSV } from "./utils.js";

	// Set theme globally (options are 'light', 'dark' or 'lightblue')
	let theme = "dark";
	setContext("theme", theme);
	setColors(themes, theme);

	// CONFIG FOR SCROLLER COMPONENTS
	const threshold = 0.65;
	// State
	let animation = getMotion(); // Set animation preference depending on browser preference
	let id = {}; // Object to hold visible section IDs of Scroller components
	let idPrev = {}; // Object to keep track of previous IDs, to compare for changes
	onMount(() => {
		idPrev = { ...id };
	});

	// Element bindings
	let map = null; // Bound to mapbox 'map' instance once initialised

	// Actions for Scroller components
	const actions = {
		map: {
			// Actions for <Scroller/> with id="map"
			map01: () => {},
			map02: () => {},
			map03: () => {},
			map04: () => {},
		},
		chart: {
			chart01: () => {},
			chart02: () => {},
			chart03: () => {},
			chart04: () => {},
			chart05: () => {},
		},
	};

	// Code to run Scroller actions when new caption IDs come into view
	function runActions(codes = []) {
		codes.forEach((code) => {
			if (id[code] != idPrev[code]) {
				if (actions[code][id[code]]) {
					actions[code][id[code]]();
				}
				idPrev[code] = id[code];
			}
		});
	}
	$: id && runActions(Object.keys(actions)); // Run above code when 'id' object changes

	//LOAD GEOJSON
	let mygeojson;
	const myjson_path = "./data/geojson.json";
	getGEO(myjson_path).then((geo) => {
		mygeojson = geo;
	});

	//LOAD PAX
	let path = ["./data/pax.csv"];
	let pax;
	getCSV(path).then((data) => {
		pax = data;
	});

	$: console.log(mygeojson, pax);
</script>

<ONSHeader filled={true} center={false} />

<Header
	bgcolor="#206095"
	bgfixed={true}
	theme="dark"
	center={false}
	short={true}
>
	<h1>This is the title of the article</h1>
	<p class="text-big" style="margin-top: 5px">
		This is a short text description of the article that might take up a
		couple of lines
	</p>
	<p style="margin-top: 20px">DD MMM YYYY</p>
	<p>
		<Toggle
			label="Animation {animation ? 'on' : 'off'}"
			mono={true}
			bind:checked={animation}
		/>
	</p>
	<div style="margin-top: 90px;">
		<Arrow color="white" {animation}>Scroll to begin</Arrow>
	</div>
</Header>

<Scroller {threshold} bind:id={id["chart"]} splitscreen={true}>
	<div slot="background">
		<figure>
			<div class="col-wide height-full">
				<div class="chart"></div>
			</div>
		</figure>
	</div>

	<div slot="foreground">
		<section data-id="chart01">
			<div class="col-medium">
				<p>
					This chart shows the <strong
						>area in square kilometres</strong
					> of each local authority district in the UK. Each circle represents
					one district. The scale is logarithmic.
				</p>
			</div>
		</section>
		<section data-id="chart02">
			<div class="col-medium">
				<p>
					The radius of each circle shows the <strong
						>total population</strong
					> of the district.
				</p>
			</div>
		</section>
		<section data-id="chart03">
			<div class="col-medium">
				<p>
					The vertical axis shows the <strong>density</strong> of the district
					in people per hectare.
				</p>
			</div>
		</section>
		<section data-id="chart04">
			<div class="col-medium">
				<p>
					The colour of each circle shows the <strong
						>part of the country</strong
					> that the district is within.
				</p>
			</div>
		</section>
		<section data-id="chart05">
			<div class="col-medium">
				<h3>Select a district</h3>
				<p>
					Use the selection box below or click on the chart to select
					a district. The chart will also highlight the other
					districts in the same part of the country.
				</p>
			</div>
		</section>
	</div>
</Scroller>

<ONSFooter />

<style>
	/* Styles specific to elements within the demo */
	:global(svelte-scroller-foreground) {
		pointer-events: none !important;
	}
	:global(svelte-scroller-foreground section div) {
		pointer-events: all !important;
	}
	select {
		max-width: 350px;
	}
	.chart {
		margin-top: 45px;
		width: calc(100% - 5px);
	}
	.chart-full {
		margin: 0 20px;
	}
	.chart-sml {
		font-size: 0.85em;
	}
	/* The properties below make the media DIVs grey, for visual purposes in demo */
	.media {
		background-color: #f0f0f0;
		display: -webkit-box;
		display: -ms-flexbox;
		display: flex;
		-webkit-box-orient: vertical;
		-webkit-box-direction: normal;
		-ms-flex-flow: column;
		flex-flow: column;
		-webkit-box-pack: center;
		-ms-flex-pack: center;
		justify-content: center;
		text-align: center;
		color: #aaa;
	}
</style>
