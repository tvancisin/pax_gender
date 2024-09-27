<script>
	// CORE IMPORTS
	import * as d3 from "d3";
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

	import Lines from "./vis/Lines.svelte";

	import { setColors, getGEO, getCSV } from "./utils.js";
	import Timeline from "./vis/Timeline.svelte";

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
	let step = null;

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
			chart01: () => {
				step = "one";
			},
			chart02: () => {
				step = "two";
			},
			chart03: () => {
				step = "three";
			},
			chart04: () => {
				step = "four";
			}
		},
		time: {
			time01: () => {
				step = "time_one"
			},
			time02: () => {
				step = "time_two"
			},
			time03: () => {
				step = "time_three"
			},
			time04: () => {
				step = "time_four"
			}
		}
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
	let path = ["./data/pax.csv", "./data/pax_gender.csv"];
	let pax;
	let pax_gender;
	let pax_gender_timeline;
	let pax_timeline;
	let parser = d3.timeParse("%Y-%m-%d");

	getCSV(path).then((data) => {
		pax = data[0];
		pax_gender = data[1];

		// Iterate through each object in the pax array
		pax.forEach((paxItem) => {
			// Find the corresponding item in pax_gender with the same AgtId
			const genderItem = pax_gender.find(
				(gender) => gender.AgtId === paxItem.AgtId,
			);

			// If a matching item is found, add the WggPar and WggImplSign values
			if (genderItem) {
				paxItem.WggPar = genderItem.WggPar;
				paxItem.WggImplSign = genderItem.WggImplSign;
			} else {
				// Optionally handle cases where no matching item is found
				paxItem.WggPar = "0";
				paxItem.WggImplSign = "0";
			}
		});

		pax.sort(function (x, y) {
			return d3.ascending(x.Dat, y.Dat);
		});

		//group by date for timeline vis
		pax_gender_timeline = d3.groups(pax_gender, (d) =>
			d.Dat.substring(0, 4),
		);
		pax_timeline = d3.groups(pax, (d) => d.Dat.substring(0, 4));

	});
</script>

<!-- <ONSHeader filled={true} center={false} /> -->

<Header
	bgcolor="white"
	bgfixed={true}
	theme="light"
	center={true}
	short={false}
>
	<img src="./img/logo.png" alt="Logo" />
	<h1>PA-X Gender</h1>
	<!-- <p class="text-big" style="margin-top: 5px">
		This is a short text description of the article that might take up a
		couple of lines
	</p> -->
	<!-- <div style="margin-top: 90px;">
		<Arrow color="black" {animation}>Scroll to begin</Arrow>
	</div> -->
</Header>

<Scroller {threshold} bind:id={id["chart"]} splitscreen={false}>
	<div slot="background">
		<figure>
			<div class="col-wide height-full">
				{#if pax}
					<div class="chart">
						<Lines {pax} {pax_gender} {step} />
					</div>
				{/if}
			</div>
		</figure>
	</div>

	<div slot="foreground">
		<section data-id="chart01">
			<div class="col-medium">
				<p style="text-align: center;">
					These are <strong>all 2055 agreements</strong> in PA-X database.
					Each line/signature represents an agreement.
				</p>
			</div>
		</section>
		<section data-id="chart02">
			<div class="col-medium">
				<p style="text-align: center;">
					<strong>436 agreements</strong> contain information about
					<strong> women, girls, gender or sexual violence.</strong>
				</p>
			</div>
		</section>
		<section data-id="chart03">
			<div class="col-medium">
				<p style="text-align: center;">
					Women <strong>directly participated</strong> in the creation
					of the agreement in
					<strong>177 cases.</strong>
				</p>
			</div>
		</section>
		<section data-id="chart04">
			<div class="col-medium">
				<p style="text-align: center;">
					Signing or witnessing of agreement "as women" was recorded <strong
						>52 times since 1990.</strong
					>
				</p>
			</div>
		</section>
	</div>
</Scroller>

<Filler theme="light" short={true} wide={true} center={true}>
	<p class="text-big">UN Security Council Permanent Members</p>
</Filler>

<Scroller {threshold} bind:id={id["time"]} splitscreen={false}>
	<div slot="background">
		<figure>
			<div class="col-wide height-full">
				<div class="time">
					<Timeline {pax_gender_timeline} {pax_timeline} {pax_gender} {step} />
				</div>
			</div>
		</figure>
	</div>

	<div slot="foreground">
		<section data-id="time01">
			<div class="col-medium">
				<p>
					This chart shows <strong>all 2055 agreements</strong> in PA-X
					database.
				</p>
			</div>
		</section>
		<section data-id="time02">
			<div class="col-medium">
				<p>
					Only 436 agreements contain information about <strong>
						women, girls, gender or sexual violence</strong
					> of the district.
				</p>
			</div>
		</section>
		<section data-id="time03">
			<div class="col-medium">
				<p>
					The vertical axis shows the <strong>density</strong> of the district
					in people per hectare.
				</p>
			</div>
		</section>
		<section data-id="time04">
			<div class="col-medium">
				<p>
					The colour of each circle shows the <strong
						>part of the country</strong
					> that the district is within.
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
	img {
		width: 50%;
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
