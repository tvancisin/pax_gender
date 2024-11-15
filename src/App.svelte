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
	import Stages from "./vis/Stages.svelte";
	import Rectangles from "./vis/Rectangles.svelte";
	import { setColors, getGEO, getCSV } from "./utils.js";
	import { centralPointsStore } from "./store";
	import Timeline from "./vis/Timeline.svelte";
	import Geography from "./vis/Geography.svelte";

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
		}, 1000);
		idPrev = { ...id };
	});

	// Element bindings
	// let map = null; // Bound to mapbox 'map' instance once initialised
	let step = null;

	// Actions for Scroller components
	const actions = {
		map: {
			// Actions for <Scroller/> with id="map"
			map01: () => {
				step = "map_one";
			},
			map02: () => {
				step = "map_two";
			},
			map03: () => {
				step = "map_three";
			},
			map04: () => {
				step = "map_four";
			},
		},
		rect: {
			rect01: () => {
				step = "rect01";
			},
			rect02: () => {
				step = "rect02";
			},
			rect03: () => {
				step = "rect03";
			},
			rect04: () => {
				step = "rect04";
			},
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
			chart05: () => {
				step = "five";
			},
		},
		stage: {
			stage01: () => {
				step = "stage01";
			},
			stage02: () => {
				step = "stage02";
			},
			stage03: () => {
				step = "stage03";
			},
			stage04: () => {
				step = "stage04";
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

	// Run above code when 'id' object changes
	$: id && runActions(Object.keys(actions));

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
		"./data/text_corr.csv",
		"./data/wgg_text.csv",
		"./data/gender_provisions_afghanistan.csv",
	];
	let pax;
	let pax_gender;
	let pax_gender_text;
	let corr_text;
	let pax_gender_timeline;
	let pax_timeline;
	let central_points;
	let wgg_text;
	let pax_stages;
	let afghanistan;
	getCSV(path).then((data) => {
		pax = data[0];
		pax_gender = data[1];
		central_points = data[2];
		centralPointsStore.set(central_points);
		pax_gender_text = data[3];
		pax_gender_text = data[3];
		corr_text = data[4];
		wgg_text = data[5];
		afghanistan = data[6];

		// add text to every pax_gender agt
		pax_gender.forEach((genderItem) => {
			const item = pax_gender_text.find(
				(gender) => gender.AgtId === genderItem.AgtId,
			);

			const find_corr = corr_text.find(
				(gender) => gender.AgtId === genderItem.AgtId,
			);

			const detail_wgg = wgg_text.find(
				(gender) => gender.AgtId === genderItem.AgtId,
			);

			const full_text = +find_corr.Text_length;
			const women_text = item.GeWom.length;
			const quotas_text = detail_wgg.WggGenQuot.length;
			const law_text = detail_wgg.WggIntLaw.length;
			const un_text = detail_wgg.WggUnsc.length;

			if (item) {
				genderItem.text = item.GeWom;
				genderItem.quotas = quotas_text;
				genderItem.law = law_text;
				genderItem.un = un_text;
				genderItem.corr_char_no = +find_corr.Text_length;
			}
		});

		let quotas = d3.groups(pax, (d) => d.GeWom);

		// Iterate through each object in the pax array
		pax.forEach((paxItem) => {
			// Find the corresponding item in pax_gender with the same AgtId
			const genderItem = pax_gender.find(
				(gender) => gender.AgtId === paxItem.AgtId,
			);

			// If a matching item is found, add the WggPar and WggImplSign values
			if (genderItem) {
				paxItem.WggGenQuot = genderItem.WggGenQuot;
				paxItem.WggIntLaw = genderItem.WggIntLaw;
				paxItem.WggUnsc = genderItem.WggUnsc;
			} else {
				// Optionally handle cases where no matching item is found
				paxItem.WggGenQuot = "0";
				paxItem.WggIntLaw = "0";
				paxItem.WggUnsc = "0";
			}
		});

		pax.sort(function (x, y) {
			return d3.ascending(x.Dat.substring(6, 10), y.Dat.substring(6, 10));
		});

		//group by agreement stages
		pax_stages = d3.groups(pax, (d) => d.Stage);
		console.log(pax_stages);

		//group by date for timeline vis
		pax_gender_timeline = d3.groups(pax_gender, (d) =>
			d.Dat.substring(0, 4),
		);
		pax_timeline = d3.groups(pax, (d) => d.Dat.substring(6, 10));
	});
</script>

<ONSHeader filled={false} center={false} />

<Header
	bgcolor="white"
	bgfixed={false}
	theme="black"
	center={true}
	short={false}
>
	<h1>PA-X Gender</h1>
	<p style="margin-top: 5px">
		This scrollytelling visualization uses PA-X database to show how and to
		what <br />
		extent is gender taken into consideration in peacebuilding across the world.
	</p>
</Header>

<!-- <Divider /> -->

<!-- <Filler theme="light" short={true} wide={true} center={true} shadow={false}>
	<p class="text-big">
		<strong>Peace Process</strong> is an attempt to bring political and/or
		military <br /> protagonists to an agreement that could end their conflict.
	</p>
</Filler>

<Divider />

<Filler theme="light" short={true} wide={true} center={true} shadow={false}>
	<p class="text-big">
		<strong>Peace Process Stages</strong> include Ceasefire,
		Pre-Negotiation,<br /> Partial Agreement, Comprehensive Agreement, Implementation,
		Renewal and Other.
	</p>
</Filler> -->

<Divider />

<!-- RECTANGLES -->
<Scroller {threshold} bind:id={id["rect"]} splitscreen={false} shadow={false}>
	<div slot="background">
		<figure>
			<div class="col-wide height-full">
				<div class="rect">
					<Rectangles
						{mygeojson}
						{pax_stages}
						{pax}
						{pax_timeline}
						{step}
					/>
				</div>
			</div>
		</figure>
	</div>

	<div slot="foreground">
		<section data-id="rect01">
			<div class="col-medium">
				<p style="text-align: center;">
					PA-X maintains the biggest database of peace agreements in
					the world. Every rectangle in this view represents one of
					2055 agreements.
				</p>
			</div>
		</section>
		<section data-id="rect02">
			<div class="col-medium">
				<p style="text-align: center;">
					Out of the 2055 agreements, only 436 contain references to
					gender.
				</p>
			</div>
		</section>
		<section data-id="rect03">
			<div class="col-medium">
				<p style="text-align: center;">
					That's less than a quarter, despite United Nations Security
					Council Resolution 1325 which urges all actors to increase
					the participation of women and incorporate gender
					perspectives in all United Nations peace and security
					efforts.
				</p>
			</div>
		</section>
	</div>
</Scroller>

<Filler theme="light" short={true} wide={true} center={true} shadow={false}>
	<p class="text-big">Peace Process Stages</p>
</Filler>

<!-- STAGES -->
<Scroller {threshold} bind:id={id["stage"]} splitscreen={false} shadow={false}>
	<div slot="background">
		<figure>
			<div class="col-wide height-full">
				<div class="stage">
					<Stages
						{mygeojson}
						{pax_stages}
						{pax}
						{pax_timeline}
						{step}
					/>
				</div>
			</div>
		</figure>
	</div>

	<div slot="foreground">
		<section data-id="stage01">
			<div class="col-medium">
				<p style="text-align: center;">
					Dividing all PA-X agreements into different peace process
					stages shows the predominance of Partial and Pre-Negotiation
					agreements
				</p>
			</div>
		</section>
		<section data-id="stage02">
			<div class="col-medium">
				<p style="text-align: center;">PA-X Gender agreements</p>
			</div>
		</section>
	</div>
</Scroller>

<Filler theme="light" short={true} wide={true} center={true} shadow={false}>
	<p class="text-big">Timeline</p>
</Filler>

<!-- TIME -->
<Scroller {threshold} bind:id={id["time"]} splitscreen={false} shadow={false}>
	<div slot="background">
		<figure>
			<div class="col-wide height-full">
				<div class="time">
					<Timeline
						{mygeojson}
						{pax_stages}
						{pax}
						{pax_timeline}
						{step}
						{afghanistan}
					/>
				</div>
			</div>
		</figure>
	</div>

	<div slot="foreground">
		<section data-id="time01">
			<div class="col-medium">
				<p style="text-align: center;">
					All PA-X agreements over time, each line represents an
					agreement.
				</p>
			</div>
		</section>
		<section data-id="time02">
			<div class="col-medium">
				<p style="text-align: center;">PA-X Gender agreements</p>
			</div>
		</section>
		<section data-id="time03">
			<div class="col-medium">
				<p style="text-align: center;">Afghanistan</p>
			</div>
		</section>
		<section data-id="time04">
			<div class="col-medium">
				<p style="text-align: center;">afghanistan agreements</p>
			</div>
		</section>
		<section data-id="time05">
			<div class="col-medium">
				<p style="text-align: center;">
					afghanistan agreements with highlighted gender text
				</p>
			</div>
		</section>
	</div>
</Scroller>

<Filler theme="light" short={true} wide={true} center={true} shadow={false}>
	<p class="text-big">Geography</p>
</Filler>

<!-- Map -->
<Scroller {threshold} bind:id={id["map"]} splitscreen={false} shadow={false}>
	<div slot="background">
		<figure>
			<div class="col-wide height-full">
				<div class="map">
					<Geography
						{mygeojson}
						{central_points}
						{pax_stages}
						{pax}
						{pax_timeline}
						{pax_gender}
						{step}
					/>
				</div>
			</div>
		</figure>
	</div>

	<div slot="foreground">
		<section data-id="map01">
			<div class="col-medium">
				<p style="text-align: center;">all pax agreements geography</p>
			</div>
		</section>
		<section data-id="map02">
			<div class="col-medium">
				<p style="text-align: center;">
					pax gender agreements geography
				</p>
			</div>
		</section>
		<section data-id="map03">
			<div class="col-medium">
				<p style="text-align: center;">international law</p>
			</div>
		</section>
		<section data-id="map04">
			<div class="col-medium">
				<p style="text-align: center;">references to un 1325</p>
			</div>
		</section>
	</div>
</Scroller>

<!-- <Scroller {threshold} bind:id={id["chart"]} splitscreen={false}>
	<div slot="background">
		<figure>
			<div class="col-wide height-full">
				{#if pax}
					<div class="chart">
						<Lines {pax} {pax_gender} {step} {central_points} {mygeojson}/>
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
					<strong>436 agreements</strong> peace agreements specifically
					address women, their inclusion, and their rights. This includes
					references to girls, widows, mothers, sexual violence, gender
					violence, UNSC 1325 or CEDAW, and lactating women.
				</p>
			</div>
		</section>
		<section data-id="chart03">
			<div class="col-medium">
				<p style="text-align: center;">
					<strong>55 agreements</strong> outline a specific quota commitment,
					or specify particular numbers of women that are to participate.
				</p>
			</div>
		</section>
		<section data-id="chart04">
			<div class="col-medium">
				<p style="text-align: center;">
					<strong>82 agreements</strong> mention references to international
					law with regards to women.
				</p>
			</div>
		</section>
		<section data-id="chart05">
			<div class="col-medium">
				<p style="text-align: center;">
					Out of the 82 agreements, only <strong>10</strong> contain
					references to the
					<a
						href="https://www.un.org/womenwatch/osagi/wps/"
						target="_blank"
						>United Nations Security Council Resolution 1325</a
					> which urges all actors to increase the participation of women
					and incorporate gender perspectives in all United Nations peace
					and security efforts.
				</p>
			</div>
		</section>
	</div>
</Scroller> -->

<Filler theme="light" short={true} wide={true} center={true} shadow={false}>
	<p class="text-big">
		Within the 436 peace agreements that do contain references to women and
		gender, how much attention is in fact given to this topic?
	</p>
</Filler>

<!-- <Scroller {threshold} bind:id={id["rect"]} splitscreen={false}>
	<div slot="background">
		<figure>
			<div class="col-wide height-full">
				<div class="rect">
					<Rectangles {pax_gender} {step} />
				</div>
			</div>
		</figure>
	</div>

	<div slot="foreground">
		<section data-id="rect01">
			<div class="col-medium">
				<p style="text-align: center;">
					Every rectangle represents a full length of peace agreement
					that includes references to gender. The black section
					highlights the proportion of text dedicated to this topic.
				</p>
			</div>
		</section>
		<section data-id="rect02">
			<div class="col-medium">
				<p style="text-align: center;">Quotas</p>
			</div>
		</section>
		<section data-id="rect03">
			<div class="col-medium">
				<p style="text-align: center;">International Law</p>
			</div>
		</section>
		<section data-id="rect04">
			<div class="col-medium">
				<p style="text-align: center;">UN</p>
			</div>
		</section>
	</div>
</Scroller> -->

<!-- <Filler theme="dark" short={true} wide={true} center={true} shadow={true}>
	<p class="text-big">What do we do with the agreements we gather?</p>
</Filler> -->

<Filler theme="light" short={true} wide={true} center={true} shadow={false}>
	<p class="text-big">
		PA-X Gender physicalization project. [include video and screenshots
		here]
	</p>
</Filler>

<Filler theme="dark" short={true} wide={true} center={true} shadow={true}>
	<p class="text-big">
		How do we gather the agreements? How are they processed? [where to
		include provenance?<br /> beginning/end/between sections?]
	</p>
</Filler>

<Divider shadow={true} />

<Scroller {threshold} bind:id={id["prov"]} splitscreen={false} shadow={true}>
	<div slot="background">
		<figure>
			<div class="col-wide height-full">
				<div class="close_read">
					<img id="agreement" src="./img/sources.jpg" />
				</div>
			</div>
		</figure>
	</div>

	<div slot="foreground">
		<section data-id="prov01">
			<div class="col-medium">
				<p style="text-align: center;">sources</p>
			</div>
		</section>
		<section data-id="prov02">
			<div class="col-medium">
				<p style="text-align: center;">
					translation/transcription/coding/data entry
					<img id="agreement" src="./img/diagram.png" />
				</p>
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
	.rect,
	.time,
	.map,
	.stage {
		margin-top: 40px;
		width: calc(100% - 5px);
	}

	.close_read {
		display: flex;
		justify-content: center; /* Centers horizontally */
		align-items: center; /* Centers vertically */
		height: 100%; /* Takes up the full height of the parent */
	}

	#agreement {
		max-width: 100%; /* Ensures the image doesn't overflow */
		max-height: 100%; /* Ensures the image fits inside the container */
	}

	.col-medium {
		-webkit-box-shadow: 0 0 3px 1px #6d6d6d;
		-moz-box-shadow: 0 0 3px 1px #6d6d6d;
		box-shadow: 0 0 3px 1px #6d6d6d;
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
