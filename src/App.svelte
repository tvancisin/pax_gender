<script>
	// CORE IMPORTS
	import * as d3 from "d3";
	import { setContext, onMount } from "svelte";
	import { themes } from "./config.js";
	import ONSHeader from "./layout/ONSHeader.svelte";
	import ONSFooter from "./layout/ONSFooter.svelte";
	import Header from "./layout/Header.svelte";
	import Scroller from "./layout/Scroller.svelte";
	import Filler from "./layout/Filler.svelte";
	import Divider from "./layout/Divider.svelte";
	import Lines from "./vis/Lines.svelte";
	import Stages from "./vis/Stages.svelte";
	import Rectangles from "./vis/Rectangles.svelte";
	import { setColors, getGEO, getCSV } from "./utils.js";
	import { centralPointsStore } from "./store";
	import Timeline from "./vis/Timeline.svelte";
	import Geography from "./vis/Geography.svelte";
	import OnsFooter from "./layout/ONSFooter.svelte";

	// Set theme globally (options are 'light', 'dark' or 'lightblue')
	let theme = "dark";
	setContext("theme", theme);
	setColors(themes, theme);

	// CONFIG FOR SCROLLER COMPONENTS
	const threshold = 0.65;
	let id = {}; // Object to hold visible section IDs of Scroller components
	let idPrev = {}; // Object to keep track of previous IDs, to compare for changes
	onMount(() => {
		// scroll to top on loading the page
		if ("scrollRestoration" in history) {
			history.scrollRestoration = "manual";
		}
		window.scrollTo({ top: 0, behavior: "auto" });

		idPrev = { ...id };
	});

	// Actions for Scroller components
	let step = null;
	const actions = {
		rect: {
			rect01: () => {
				step = "rect01";
			},
			rect02: () => {
				step = "rect02";
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
		map: {
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
		let order = ["Pre", "Cea", "SubPar", "SubComp", "Imp", "Ren", "Oth"];
		pax_stages.sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]));

		//group by date for timeline vis
		pax_gender_timeline = d3.groups(pax_gender, (d) =>
			d.Dat.substring(0, 4),
		);
		pax_timeline = d3.groups(pax, (d) => d.Dat.substring(6, 10));
	});
</script>

<ONSHeader filled={false} center={false} />

<Header bgfixed={false} center={true} short={false}>
	<h1>PA-X Gender</h1>
	<p class="text-big">
		This scrollytelling visualization uses PA-X database to show how and to
		what extent women, girls and gender are taken into consideration in
		peace agreements around the world.
	</p>
</Header>

<Divider />

<Filler short={true} wide={true} center={true} shadow={false}>
	<p style="font-size: 1.1em; margin-bottom:40px">
		<strong>Peace agreement</strong> is a document produced after discussion
		with conflict protagonists and mutually agreed to by some or all of them,
		addressing conflict with a view to ending it. Below is a ceasefire agreement
		from 1990 Nicaragua.
	</p>
	<img src="./img/agt.PNG" alt="agreement example" style="width: 100%;" />
</Filler>

<Divider />

<!-- RECTANGLES -->
<Scroller {threshold} bind:id={id["rect"]} splitscreen={false} shadow={false}>
	<div slot="background">
		<figure>
			<div class="col-wide height-full">
				<div class="rect">
					<Rectangles {pax} {step} />
				</div>
			</div>
		</figure>
	</div>

	<div slot="foreground">
		<section data-id="rect01">
			<div class="col-medium">
				<p style="text-align: center;">
					Every rectangle in this view represents one of 2055
					agreements in PA-X database. PA-X maintains world's biggest
					database of peace agreements.<br />
				</p>
			</div>
		</section>
		<section data-id="rect02">
			<div class="col-medium">
				<p style="text-align: center;">
					Out of the 2055 agreements, only 436 contain references to
					gender.<br /> That's less than a quarter.
				</p>
			</div>
		</section>
	</div>
</Scroller>

<!-- <Filler short={true} wide={true} center={true} shadow={false}>
	<p class="text-big">
		Why should gender be taken into consideration in peace agreements?
	</p>
</Filler> -->

<Filler short={true} wide={true} center={true} shadow={false}>
	<p class="text-big">
		Why should gender be taken into consideration in peace agreements?
	</p>
	<video
		poster="./img/lr_bl.png"
		controls
		style="width: 80%; height: auto; margin: auto; border-radius: 5px;"
	>
		<source src="./img/laura.mp4" type="video/mp4" />
		<track
			src="captions_en"
			kind="captions"
			srclang="en"
			label="english_captions"
		/>

		Your browser does not support the video tag.
	</video>
</Filler>

<Filler short={true} wide={true} center={true} shadow={false}>
	<p class="text-big">Peace Agreements over Time</p>
</Filler>

<Divider />

<!-- TIME -->
<Scroller {threshold} bind:id={id["time"]} splitscreen={false} shadow={false}>
	<div slot="background">
		<figure>
			<div class="col-wide height-full">
				<div class="time">
					<Timeline {pax} {pax_timeline} {step} />
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
				<p style="text-align: center;">
					Despite it being 25 years since the Resolution which urged
					all actors to incorporate gender perspectives when
					negotiating and implementing peace agreements, we have seen
					only a minor increase.
				</p>
			</div>
		</section>
		<section data-id="time04">
			<div class="col-medium">
				<p style="text-align: center;">
					Let's enlarge PA-X Gender Agreements
				</p>
			</div>
		</section>
		<section data-id="time05">
			<div class="col-medium">
				<p style="text-align: center;">
					Agreement provisions outlining a specific quota commitment,
					or specifying particular numbers of women that are to
					participate.
				</p>
			</div>
		</section>
		<section data-id="time06">
			<div class="col-medium">
				<p style="text-align: center;">
					Agreements with references to the UN Security Council
					Resolution.
				</p>
			</div>
		</section>
	</div>
</Scroller>

<Filler short={true} wide={true} center={true} shadow={false}>
	<p class="text-big">Peace Process Stages</p>
</Filler>

<!-- STAGES -->
<Scroller {threshold} bind:id={id["stage"]} splitscreen={false} shadow={false}>
	<div slot="background">
		<figure>
			<div class="col-wide height-full">
				<div class="stage">
					<Stages {pax_stages} {pax} {step} />
				</div>
			</div>
		</figure>
	</div>

	<div slot="foreground">
		<section data-id="stage01">
			<div class="col-medium">
				<p style="text-align: center;">
					Dividing all PA-X agreements into different peace process
					stages shows the predominance of <strong
						>Pre-Negotiation, Ceasefire, and Partial</strong
					>
					agreements.
				</p>
			</div>
		</section>
		<section data-id="stage02">
			<div class="col-medium">
				<p style="text-align: center;">
					The agreement stages division is rather different when only
					looking at PA-X Gender agreements
				</p>
			</div>
		</section>
	</div>
</Scroller>

<Filler short={true} wide={true} center={true} shadow={false}>
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
				<p style="text-align: center;">
					Countries where peace agreements have been signed since
					1990. The brighter the colour, the more signed agreements.
				</p>
			</div>
		</section>
		<section data-id="map02">
			<div class="col-medium">
				<p style="text-align: center;">
					Countries with at least 2 signed agreements containing
					references to gender.
				</p>
			</div>
		</section>
		<section data-id="map03">
			<div class="col-medium">
				<p style="text-align: center;">
					Let's have a closer look at Afghanistan.
				</p>
			</div>
		</section>
		<!-- <section data-id="map04">
			<div class="col-medium">
				<p style="text-align: center;">references to un 1325</p>
			</div>
		</section> -->
	</div>
</Scroller>

<Filler short={true} wide={true} center={true} shadow={true}></Filler>
<Filler short={true} wide={true} center={true} shadow={true}></Filler>

<Filler short={true} wide={true} center={true} shadow={true}>
	<p class="text-big">
		How do we gather the agreements? How are they processed? [where to
		include provenance?<br /> beginning/end/between sections?]
	</p>
</Filler>

<Scroller {threshold} bind:id={id["prov"]} splitscreen={false} shadow={true}>
	<div slot="background">
		<figure>
			<div class="col-wide height-full">
				<div class="close_read">
					<img id="agreement" alt="notes" src="./img/sources.jpg" />
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
					<img id="agreement" alt="notes" src="./img/diagram.png" />
				</p>
			</div>
		</section>
	</div>
</Scroller>

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
</style>
