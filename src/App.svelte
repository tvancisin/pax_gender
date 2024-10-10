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
	import Text from "./vis/Text.svelte";
	import { setColors, getGEO, getCSV } from "./utils.js";

	// Set theme globally (options are 'light', 'dark' or 'lightblue')
	let theme = "light";
	setContext("theme", theme);
	setColors(themes, theme);

	// CONFIG FOR SCROLLER COMPONENTS
	const threshold = 0.65;
	// State
	let id = {}; // Object to hold visible section IDs of Scroller components
	let idPrev = {}; // Object to keep track of previous IDs, to compare for changes
	onMount(() => {
		setTimeout(() => {
			window.scrollTo(0, 0);
		}, 500);
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
	const myjson_path = "./data/custom.geo.json";
	getGEO(myjson_path).then((geo) => {
		mygeojson = geo;
	});

	//LOAD PAX
	let path = [
		"./data/pax.csv",
		"./data/pax_gender.csv",
		"./data/pax_central_points.csv",
		"./data/pax_gender_text.csv",
	];
	let pax;
	let pax_gender;
	let pax_gender_text;
	let pax_gender_timeline;
	let pax_timeline;
	let central_points;
	getCSV(path).then((data) => {
		pax = data[0];
		pax_gender = data[1];
		central_points = data[2];
		pax_gender_text = data[3];

		// add text to every pax_gender agt
		pax_gender.forEach((genderItem) => {
			const item = pax_gender_text.find(
				(gender) => gender.AgtId === genderItem.AgtId,
			);

			if (item) {
				genderItem.text = item.GeWom;
			}
		});

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

<!-- <ONSHeader filled={false} center={false} /> -->

<Header
	bgcolor="white"
	bgfixed={false}
	theme="light"
	center={true}
	short={false}
>
	<h1>PA-X Gender</h1>
	<p style="margin-top: 5px">
		This scrollytelling visualization uses PA-X Gender database to show how
		and to what <br />
		extent is gender taken into consideration in peacebuilding across the world.
	</p>
</Header>

<!-- <Filler theme="light" short={true} wide={true} center={true}>
	<p class="text-big">How many agreements mention gender?</p>
</Filler> -->

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
					Every line represents one of <strong>2055 agreements</strong
					> in PA-X database.
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
	<p class="text-big">How much text is dedicated to gender?</p>
</Filler>

<Scroller {threshold} bind:id={id["text"]} splitscreen={false}>
	<div slot="background">
		<figure>
			<div class="col-wide height-full">
				<div class="text">
					<Text {pax_gender} />
				</div>
			</div>
		</figure>
	</div>

	<div slot="foreground">
		<section data-id="text01">
			<div class="col-medium">
				<p style="text-align: center;">text</p>
			</div>
		</section>
		<section data-id="text02">
			<div class="col-medium">
				<p style="text-align: center;">text</p>
			</div>
		</section>
	</div>
</Scroller>

<Section>
	<!-- <h2>This is a full-width chart demo</h2> -->
	<!-- <p>
		Below is an example of a media grid where the column with is set to "full". This allows for full width images and charts.
	</p> -->
	<img id="agreement" src="./img/agt.PNG" />
</Section>

<Filler theme="light" short={true} wide={true} center={true}>
	<p class="text-big">Agreements over Time</p>
</Filler>

<Scroller {threshold} bind:id={id["time"]} splitscreen={false}>
	<div slot="background">
		<figure>
			<div class="col-wide height-full">
				<div class="time">
					<Timeline
						{mygeojson}
						{pax_gender_timeline}
						{pax_timeline}
						{pax_gender}
						{step}
						{central_points}
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
	#agreement {
		width: 100%;
	}
	.chart,
	.text,
	.time {
		margin-top: 40px;
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
