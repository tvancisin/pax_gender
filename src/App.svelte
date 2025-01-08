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

	let mapLoaded = false;

	// Set theme globally (options are 'light', 'dark' or 'lightblue')
	let theme = "dark";
	setContext("theme", theme);
	setColors(themes, theme);

	// CONFIG FOR SCROLLER COMPONENTS
	const threshold = 0.65;
	let id = {}; // Object to hold visible section IDs of Scroller components
	let idPrev = {}; // Object to keep track of previous IDs, to compare for changes

	// SCROLL TO TOP ON MOUNT
	onMount(() => {
		// scroll to top on loading the page
		if ("scrollRestoration" in history) {
			history.scrollRestoration = "manual";
		}
		window.scrollTo({ top: 0, behavior: "auto" });
		idPrev = { ...id };
	});

	// STEPS
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
			time07: () => {
				step = "7";
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
				paxItem.WggRehab = genderItem.WggRehab;
				paxItem.WggImplRole = genderItem.WggImplRole;
				paxItem.WggUnsc = genderItem.WggUnsc;
			} else {
				// Optionally handle cases where no matching item is found
				paxItem.WggRehab = "0";
				paxItem.WggImplRole = "0";
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

	//map loaded, show start button
	function handleMapLoaded() {
		mapLoaded = true;
		document.getElementById("loading_text").style.visibility = "hidden";
		document.getElementById("loading_button").style.visibility = "visible";
	}

	//clicking on screen or button after map is loaded
	function handleScreenClick(event) {
		// Recalculate width and height
		// width = window.innerWidth;
		// height = window.innerHeight;

		if (mapLoaded) {
			document.getElementById("loading_screen").style.visibility =
				"hidden";
			document.getElementById("loading_button").style.visibility =
				"hidden";
			document.documentElement.style.overflow = "visible"; // For <html>
			document.body.style.overflow = "visible"; // For <body>
		}
	}
</script>

<div
	role="presentation"
	id="loading_screen"
	style="height: calc(var(--vh, 1vh) * 100);"
	on:click={handleScreenClick}
>
	<button id="loading_button" on:click={handleScreenClick}
		>Visualization</button
	>
	<p id="loading_text">loading...</p>
</div>

<ONSHeader filled={false} center={false} />

<Header bgfixed={false} center={true} short={false}>
	<h1>PA-X Gender</h1>
	<p>
		This scrollytelling visualization uses PA-X database to show how and to
		what extent women, girls and gender are taken into consideration in
		peace agreements around the world.
	</p>
</Header>

<Divider />

<Filler short={true} wide={true} center={true} shadow={true}>
	<img
		src="./img/toncontin.png"
		alt="peace agreement example"
		style="width: 100%;"
	/>
	<p>
		A <strong>peace agreement</strong> is a document produced after discussion
		with conflict protagonists and mutually agreed to by some or all of them,
		addressing conflict with a view to ending it. Below is a ceasefire agreement
		from 1990 Nicaragua.
	</p>
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
					agreements in the PA-X Peace Agreement Database, the most
					expansive collection of peace agreements data in the world.
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

<Divider />

<Filler short={false} wide={true} center={true} shadow={false}>
	<p>Why should peace agreements incorporate a gender perspective?</p>
</Filler>

<Filler short={true} wide={true} center={true} shadow={false}>
	<video
		poster="./img/lr_bl.png"
		controls
		style="width: 80%; height: auto; margin: auto; border-radius: 3px;"
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

<Filler short={false} wide={true} center={true} shadow={false}>
	<p>
		In 2000, the United Nations Security Council passed Resolution 1325 on
		Women, Peace, and Security, calling on all actors involved in
		negotiating and implementing peace agreements to adopt a gender
		perspective, including:
	</p>
	<div id="icons">
		<div class="icon-item">
			<img
				src="./img/fir.svg"
				alt="peace agreement example"
				style="height: 100px;"
			/>
			<p style="text-align: left; font-size: 14px">
				Responding to the special needs of women and girls during
				repatriation, resettlement, rehabilitation, reintegration and
				post-conflict reconstruction
			</p>
		</div>
		<div class="icon-item">
			<img
				src="./img/sec.svg"
				alt="peace agreement example"
				style="height: 100px;"
			/>
			<p style="text-align: left; font-size: 14px">
				Supporting local women’s and indigenous initiatives for conflict
				resolution, and involving women in all implementation mechanisms
			</p>
		</div>
		<div class="icon-item">
			<img
				src="./img/thi.svg"
				alt="peace agreement example"
				style="height: 100px;"
			/>
			<p style="text-align: left; font-size: 14px">
				Ensuring the protection of human rights of women and girls,
				particularly relating to the constitution, the electoral system,
				the police and the judiciary
			</p>
		</div>
	</div>
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
					Each line represents a peace agreements listed on PA-X that
					was reached between 1990 and 2023.
				</p>
			</div>
		</section>
		<section data-id="time02">
			<div class="col-medium">
				<p style="text-align: center;">
					PA-X Gender agreements over time.
				</p>
			</div>
		</section>
		<section data-id="time03">
			<div class="col-medium">
				<p style="text-align: center;">
					It's crucial to emphasize that gender references can differ
					hugely in terms of their substantive quality and
					specificity, ranging from detailed commitments to rhetorical
					references to 'women'.
				</p>
			</div>
		</section>
		<section data-id="time04">
			<div class="col-medium">
				<p style="text-align: center;">
					These peace agreements included references to the special
					needs of women and girls during rehabilitation and
					reconstruction.
				</p>
			</div>
		</section>
		<section data-id="time05">
			<div class="col-medium">
				<p style="text-align: center;">
					For example, the Lome Agreement for Sierra Leone in 1999
					acknowledged women's victimization during the war, and
					stated that 'special attention shall be accorded to their
					needs and potentials in formulating and implementing
					national rehabilitation, reconstruction and development
					programmes, to enable them to play a central role in the
					moral, social and physical reconstruction of Sierra Leone.'
				</p>
			</div>
		</section>
		<section data-id="time06">
			<div class="col-medium">
				<p style="text-align: center;">
					Turning to involving women in all implementation mechanisms,
					these peace agreements included references to women playing
					a role in implementing the agreement.
				</p>
			</div>
		</section>
		<section data-id="time07">
			<div class="col-medium">
				<p style="text-align: center;">
					For example, the 2016 Final Agreement between the Colombian
					Government and the FARC set up a special forum comprising
					representatives from 6 national and regional Colombian
					women's organisations, to work with the implementation
					commission on monitoring and guaranteeing the rights of
					women in the implementation of the peace agreement.
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
						on:mapLoaded={handleMapLoaded}
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
					<!-- <img id="agreement" alt="notes" src="./img/sources.jpg" /> -->
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
					<!-- <img id="agreement" alt="notes" src="./img/diagram.png" /> -->
				</p>
			</div>
		</section>
	</div>
</Scroller>

<style>
	#loading_screen {
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0px;
		left: 0px;
		background-color: black;
		display: flex;
		justify-content: center;
		z-index: 3;
	}

	#loading_text {
		position: absolute;
		top: 40%;
		color: rgb(255, 255, 255);
		margin: 0px;
		font-weight: 300;
	}

	#loading_button {
		font-family: "Montserrat";
		font-size: 16px;
		font-weight: 400;
		position: absolute;
		top: 40%;
		background-color: black;
		color: white;
		border: 1px solid rgb(69, 69, 69);
		border-radius: 2px;
		padding: 10px 15px;
		cursor: pointer;
		transition:
			background-color 0.2s ease,
			color 0.2s ease;
		visibility: hidden;
	}

	#loading_button:hover {
		background-color: white;
		color: black;
	}

	.rect,
	.time,
	.map,
	.stage {
		margin-top: 40px;
		width: calc(100% - 5px);
	}

	#icons {
		margin: 50px;
		display: flex;
		flex-wrap: wrap; /* Allows items to wrap onto the next line */
		justify-content: space-between; /* Adjust spacing between items */
	}

	.icon-item {
		flex: 1 1 calc(33.33% - 10px); /* Ensure three items per row, with some spacing */
		margin: 5px; /* Adds spacing between items */
		text-align: center; /* Center content inside the items */
		padding: 20px; /* Example padding */
		box-sizing: border-box; /* Ensures padding is included in width calculation */
	}

	@media (max-width: 768px) {
		.icon-item {
			flex: 1 1 100%; /* Items stack on top of each other on small screens */
		}
	}

	.close_read {
		display: flex;
		justify-content: center; /* Centers horizontally */
		align-items: center; /* Centers vertically */
		height: 100%; /* Takes up the full height of the parent */
	}
</style>
