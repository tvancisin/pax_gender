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
	import Timeline from "./vis/Timeline.svelte";
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
		setTimeout(() => {
			window.scrollTo(0, 0);
		}, 1000);
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
			},
		},
		time: {
			time01: () => {
				step = "1";
			},
			time02: () => {
				step = "2";
			},
			time03: () => {
				step = "3";
			},
			time04: () => {
				step = "4";
			},
			time05: () => {
				step = "5";
			},
			time06: () => {
				step = "6";
			},
			time07: () => {
				step = "7";
			},
			time08: () => {
				step = "8";
			},
			time09: () => {
				step = "9";
			},
			time10: () => {
				step = "10";
			},
			time11: () => {
				step = "11";
			},
			time12: () => {
				step = "12";
			},
			time13: () => {
				step = "13";
			},
			time14: () => {
				step = "14";
			},
			time15: () => {
				step = "15";
			},
			time16: () => {
				step = "16";
			},
			time17: () => {
				step = "17";
			},
			time18: () => {
				step = "18";
			},
			time19: () => {
				step = "19";
			},
			time20: () => {
				step = "20";
			},
			time21: () => {
				step = "21";
			},
			time22: () => {
				step = "22";
			},
			time23: () => {
				step = "23";
			},
			time24: () => {
				step = "24";
			},
			time25: () => {
				step = "25";
			},
			time26: () => {
				step = "26";
			},
			time27: () => {
				step = "27";
			},
			time28: () => {
				step = "28";
			},
			time29: () => {
				step = "29";
			},
			time30: () => {
				step = "30";
			},
			time31: () => {
				step = "31";
			},
			time32: () => {
				step = "32";
			},
			time33: () => {
				step = "33";
			},
			time34: () => {
				step = "34";
			},
			time35: () => {
				step = "35";
			},
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
	let path = ["./data/pax.csv", "./data/pax_gender.csv"];
	let pax;
	let pax_gender;
	let pax_gender_timeline;
	let pax_timeline;
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
	<p class="text-big">Timeline</p>
</Filler>

<Scroller {threshold} bind:id={id["time"]} splitscreen={false}>
	<div slot="background">
		<figure>
			<div class="col-wide height-full">
				<div class="time">
					<Timeline
						{pax_gender_timeline}
						{pax_timeline}
						{pax_gender}
						{step}
					/>
				</div>
			</div>
		</figure>
	</div>

	<div slot="foreground">
		<section data-id="time01">
			<div class="col-medium">
				<p style="text-align: center;">1990</p>
			</div>
		</section>
		<section data-id="time02">
			<div class="col-medium">
				<p style="text-align: center;">1991</p>
			</div>
		</section>
		<section data-id="time03">
			<div class="col-medium">
				<p style="text-align: center;">1992</p>
			</div>
		</section>
		<section data-id="time04">
			<div class="col-medium">
				<p style="text-align: center;">1993</p>
			</div>
		</section>
		<section data-id="time05">
			<div class="col-medium">
				<p style="text-align: center;">1994</p>
			</div>
		</section>
		<section data-id="time06">
			<div class="col-medium">
				<p style="text-align: center;">1995</p>
			</div>
		</section>
		<section data-id="time07">
			<div class="col-medium">
				<p style="text-align: center;">1996</p>
			</div>
		</section>
		<section data-id="time08">
			<div class="col-medium">
				<p style="text-align: center;">1997</p>
			</div>
		</section>
		<section data-id="time09">
			<div class="col-medium">
				<p style="text-align: center;">1998</p>
			</div>
		</section>
		<section data-id="time10">
			<div class="col-medium">
				<p style="text-align: center;">1999</p>
			</div>
		</section>
		<section data-id="time11">
			<div class="col-medium">
				<p style="text-align: center;">
					The United Nations Security Council adopts resolution
					(S/RES/1325) on women and peace and security on 31 October
					2000.
				</p>
			</div>
		</section>
		<section data-id="time12">
			<div class="col-medium">
				<p style="text-align: center;">2001</p>
			</div>
		</section>
		<section data-id="time13">
			<div class="col-medium">
				<p style="text-align: center;">2002</p>
			</div>
		</section>
		<section data-id="time14">
			<div class="col-medium">
				<p style="text-align: center;">2003</p>
			</div>
		</section>
		<section data-id="time15">
			<div class="col-medium">
				<p style="text-align: center;">2004</p>
			</div>
		</section>
		<section data-id="time16">
			<div class="col-medium">
				<p style="text-align: center;">2005</p>
			</div>
		</section>
		<section data-id="time17">
			<div class="col-medium">
				<p style="text-align: center;">2006</p>
			</div>
		</section>
		<section data-id="time18">
			<div class="col-medium">
				<p style="text-align: center;">2007</p>
			</div>
		</section>
		<section data-id="time19">
			<div class="col-medium">
				<p style="text-align: center;">2008</p>
			</div>
		</section>
		<section data-id="time20">
			<div class="col-medium">
				<p style="text-align: center;">2009</p>
			</div>
		</section>
		<section data-id="time21">
			<div class="col-medium">
				<p style="text-align: center;">2010</p>
			</div>
		</section>
		<section data-id="time22">
			<div class="col-medium">
				<p style="text-align: center;">2011</p>
			</div>
		</section>
		<section data-id="time23">
			<div class="col-medium">
				<p style="text-align: center;">2012</p>
			</div>
		</section>
		<section data-id="time24">
			<div class="col-medium">
				<p style="text-align: center;">2013</p>
			</div>
		</section>
		<section data-id="time25">
			<div class="col-medium">
				<p style="text-align: center;">2014</p>
			</div>
		</section>
		<section data-id="time26">
			<div class="col-medium">
				<p style="text-align: center;">2015</p>
			</div>
		</section>
		<section data-id="time27">
			<div class="col-medium">
				<p style="text-align: center;">2016</p>
			</div>
		</section>
		<section data-id="time28">
			<div class="col-medium">
				<p style="text-align: center;">2017</p>
			</div>
		</section>
		<section data-id="time29">
			<div class="col-medium">
				<p style="text-align: center;">2018</p>
			</div>
		</section>
		<section data-id="time30">
			<div class="col-medium">
				<p style="text-align: center;">2019</p>
			</div>
		</section>
		<section data-id="time31">
			<div class="col-medium">
				<p style="text-align: center;">2020</p>
			</div>
		</section>
		<section data-id="time32">
			<div class="col-medium">
				<p style="text-align: center;">2021</p>
			</div>
		</section>
		<section data-id="time33">
			<div class="col-medium">
				<p style="text-align: center;">2022</p>
			</div>
		</section>
		<section data-id="time34">
			<div class="col-medium">
				<p style="text-align: center;">2023</p>
			</div>
		</section>
		<section data-id="time35">
			<div class="col-medium">
				<p style="text-align: center;">Reorder</p>
			</div>
		</section>
	</div>
</Scroller>

<!-- <ONSFooter /> -->

<style>
	/* Styles specific to elements within the demo */
	:global(svelte-scroller-foreground) {
		pointer-events: none !important;
	}
	:global(svelte-scroller-foreground section div) {
		pointer-events: all !important;
	}
	img {
		width: 20%;
	}
	.chart,
	.time {
		margin-top: 45px;
		width: calc(100% - 5px);
	}
	/* select {
		max-width: 350px;
	}
	.chart-full {
		margin: 0 20px;
	}
	.chart-sml {
		font-size: 0.85em;
	}
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
	} */
</style>
