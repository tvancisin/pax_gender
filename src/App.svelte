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
	import Afghanistan from "./vis/Afghanistan.svelte";

	let mapLoaded = false;

	// Scroll references
	let scrollerRefAgreement;
	let scrollerRefRectangles;
	let scrollerRefReason;
	let scrollerRefTime;
	let scrollerRefStages;
	let scrollerRefGeo;

	// Set theme globally (options are 'light', 'dark' or 'lightblue')
	let theme = "dark";
	setContext("theme", theme);
	setColors(themes, theme);

	// CONFIG FOR SCROLLER COMPONENTS
	const threshold = 0.65;
	let id = {}; // Object to hold visible section IDs of Scroller components
	let idPrev = {}; // Object to keep track of previous IDs, to compare for changes

	// Custom smooth scroll function with slower speed
	function smoothScrollTo(targetPosition, duration = 3000) {
		const startPosition = window.scrollY;
		const distance = targetPosition - startPosition;
		let startTime = null;

		function animationStep(currentTime) {
			if (!startTime) startTime = currentTime;
			const timeElapsed = currentTime - startTime;
			const progress = Math.min(timeElapsed / duration, 1); // Ensures animation stops at 1

			window.scrollTo(
				0,
				startPosition + distance * easeInOutQuad(progress),
			);

			if (timeElapsed < duration) {
				requestAnimationFrame(animationStep);
			}
		}

		function easeInOutQuad(t) {
			return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; // Smooth easing function
		}

		requestAnimationFrame(animationStep);
	}

	// INIT functions
	onMount(() => {
		// scroll to top on loading the page
		if ("scrollRestoration" in history) {
			history.scrollRestoration = "manual";
		}
		window.scrollTo({ top: 0, behavior: "auto" });
		idPrev = { ...id };

		// indicator circle and lines
		const circle = document.querySelector(".circle");
		const indicator = document.querySelector("#indicator");
		const lineAgmt = document.querySelector(".scroll-line-agmt");
		const lineRect = document.querySelector(".scroll-line-rect");
		const lineReason = document.querySelector(".scroll-line-reason");
		const lineTime = document.querySelector(".scroll-line-time");
		const lineStage = document.querySelector(".scroll-line-stage");
		const lineGeo = document.querySelector(".scroll-line-geo");

		if (!circle || !indicator) return;

		const setFixedLinePosition = () => {
			let docHeight =
				document.documentElement.scrollHeight - window.innerHeight;

			if (docHeight <= 0) {
				requestAnimationFrame(setFixedLinePosition);
				return;
			}

			const indicatorHeight = indicator.clientHeight;

			// Position lineRect
			if (scrollerRefAgreement instanceof HTMLElement) {
				let scrollerAgmt = scrollerRefAgreement.getBoundingClientRect();
				let scrollerTop = scrollerAgmt.top + window.scrollY;
				let scrollerPercent = scrollerTop / docHeight;
				let linePositionAgreement = scrollerPercent * indicatorHeight;
				lineAgmt.style.top = `${linePositionAgreement}px`;

				// Add click listener to lineRect
				lineAgmt.addEventListener("click", () => {
					smoothScrollTo(scrollerTop, 2000); // 3 seconds slow scroll
				});
			}

			// Position lineRect
			if (scrollerRefRectangles instanceof HTMLElement) {
				let scrollerRect =
					scrollerRefRectangles.getBoundingClientRect();
				let scrollerTop = scrollerRect.top + window.scrollY;
				let scrollerPercent = scrollerTop / docHeight;
				let linePositionRectangles = scrollerPercent * indicatorHeight;
				lineRect.style.top = `${linePositionRectangles}px`;

				// Add click listener to lineRect
				lineRect.addEventListener("click", () => {
					smoothScrollTo(scrollerTop, 2000); // 3 seconds slow scroll
				});
			}

			// Position lineReason
			if (scrollerRefReason instanceof HTMLElement) {
				let scrollerReason = scrollerRefReason.getBoundingClientRect();
				console.log("here");

				let scrollerTopReason = scrollerReason.top + window.scrollY;
				let scrollerPercentReason = scrollerTopReason / docHeight;
				let linePositionReason =
					scrollerPercentReason * indicatorHeight;
				lineReason.style.top = `${linePositionReason}px`;

				// Add click listener to lineReason
				lineReason.addEventListener("click", () => {
					smoothScrollTo(scrollerTopReason, 2000); // 3 seconds slow scroll
				});
			}

			// Position lineTime
			if (scrollerRefTime instanceof HTMLElement) {
				const scrollerRectTime =
					scrollerRefTime.getBoundingClientRect();
				const scrollerTopTime = scrollerRectTime.top + window.scrollY;
				const scrollerPercentTime = scrollerTopTime / docHeight;
				const linePositionTime = scrollerPercentTime * indicatorHeight;
				lineTime.style.top = `${linePositionTime}px`;

				// Add click listener to lineTime
				lineTime.addEventListener("click", () => {
					smoothScrollTo(scrollerTopTime, 2000); // 3 seconds slow scroll
				});
			}

			// Position lineStage
			if (scrollerRefStages instanceof HTMLElement) {
				const scrollerRectStage =
					scrollerRefStages.getBoundingClientRect();
				const scrollerTopStage = scrollerRectStage.top + window.scrollY;
				const scrollerPercentStage = scrollerTopStage / docHeight;
				const linePositionStage =
					scrollerPercentStage * indicatorHeight;
				lineStage.style.top = `${linePositionStage}px`;

				// Add click listener to lineStage
				lineStage.addEventListener("click", () => {
					smoothScrollTo(scrollerTopStage, 3000); // 3 seconds slow scroll
				});
			}

			// Position lineGeo
			if (scrollerRefGeo instanceof HTMLElement) {
				const scrollerRectGeo = scrollerRefGeo.getBoundingClientRect();
				const scrollerTopGeo = scrollerRectGeo.top + window.scrollY;
				const scrollerPercentGeo = scrollerTopGeo / docHeight;
				const linePositionGeo = scrollerPercentGeo * indicatorHeight;
				lineGeo.style.top = `${linePositionGeo}px`;

				// Add click listener to lineGeo
				lineGeo.addEventListener("click", () => {
					smoothScrollTo(scrollerTopGeo, 3000); // 3 seconds slow scroll
				});
			}
		};

		const updateCircle = () => {
			const scrollTop = window.scrollY;
			let docHeight =
				document.documentElement.scrollHeight - window.innerHeight;

			if (docHeight <= 0) return;

			const indicatorHeight = indicator.clientHeight;
			const circleMaxMove = indicatorHeight - circle.clientHeight;
			const scrollPercent = scrollTop / docHeight;

			// Move the scrolling circle dynamically
			circle.style.top = `${scrollPercent * circleMaxMove}px`;
		};

		// Set the fixed line position once
		requestAnimationFrame(setFixedLinePosition);

		// Keep updating the circle, but not the line
		window.addEventListener("scroll", updateCircle);

		// Update the line positions on window resize
		window.addEventListener("resize", () => {
			requestAnimationFrame(setFixedLinePosition); // Recalculate line positions after resize
		});
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
			time08: () => {
				step = "8";
			},
			time09: () => {
				step = "9";
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
		afgh: {
			afgh01: () => {
				step = "afgh01";
			},
			afgh02: () => {
				step = "afgh02";
			},
			afgh03: () => {
				step = "afgh03";
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
				paxItem.WggHR = genderItem.WggHR;
			} else {
				// Optionally handle cases where no matching item is found
				paxItem.WggRehab = "0";
				paxItem.WggImplRole = "0";
				paxItem.WggHR = "0";
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

<div id="indicator">
	<div class="circle"></div>
	<div class="line"></div>
	<div class="scroll-line-agmt"><img src="./img/agmt.png" alt="rect" /></div>
	<div class="scroll-line-rect"><img src="./img/recs.png" alt="rect" /></div>
	<!-- <div class="scroll-line-reason"><img src="./img/fem.png" alt="rect" /></div> -->
	<div class="scroll-line-time"><img src="./img/line.png" alt="rect" /></div>
	<div class="scroll-line-stage"><img src="./img/bar.png" alt="rect" /></div>
	<div class="scroll-line-geo"><img src="./img/globe.png" alt="rect" /></div>
</div>

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
	<img
		class="peace_logo"
		src="./img/pax_gender.svg"
		alt="peacerep logo"
		style="width: 45%;"
	/>
	<h1>Gender</h1>
	<p style="margin: 20px">
		This visualization uses PA-X database to show how and to what extent
		women, girls and gender are taken into consideration in peace agreements
		around the world.
	</p>
</Header>

<Divider />

<div class="filler" bind:this={scrollerRefAgreement}>
	<p>
		A <strong>peace agreement</strong> is a document produced after discussion
		with conflict protagonists and mutually agreed to by them, addressing conflict
		with a view to ending it. Below is a ceasefire agreement from 1990 Nicaragua.
	</p>
</div>

<div class="filler">
	<img
		src="./img/toncontin.png"
		alt="peace agreement example"
		style="width: 100%;"
	/>
</div>

<Filler short={false} wide={true} center={true} shadow={false}>
	<p>
		PA-X contains 2055 peace agreements signed from 1990 and the map below
		shows where in the world these agreements have been signed.
	</p>
</Filler>

<!-- Map -->
<Scroller {threshold} bind:id={id["map"]} splitscreen={false} shadow={false}>
	<div slot="background">
		<figure>
			<div class="col-wide height-full">
				<div class="map" bind:this={scrollerRefGeo}>
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
					The brighter the colour, the more signed agreements.
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
		<!-- <section data-id="map03">
			<div class="col-medium">
				<p style="text-align: center;">
					Let's have a closer look at Afghanistan.
				</p>
			</div>
		</section> -->
	</div>
</Scroller>

<div class="filler">
	<p>
		To get a better idea about how much is gender taken into consideration
		in peace agreements, below is a visualization of all peace agreements
		represented as rectangles.
	</p>
</div>

<!-- RECTANGLES -->
<Scroller {threshold} bind:id={id["rect"]} splitscreen={false} shadow={false}>
	<div slot="background">
		<figure>
			<div class="col-wide height-full">
				<div class="rect" bind:this={scrollerRefRectangles}>
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

<!-- <div class="filler" bind:this={scrollerRefReason}>
	<p style="margin: 20px">
		Why should peace agreements incorporate a gender perspective?
	</p>
</div>

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
</Filler> -->



<div class="filler" bind:this={scrollerRefStages}>
	<p style="margin: 20px">
		There are different stages of peace processes, from pre-negotiation to
		implementation. If peace negotiations went smoothly from one stage to
		the next, the process would look like this:
	</p>
</div>

<Filler short={false} wide={true} center={true} shadow={true}>
	<img
		src="./img/messy_1.png"
		alt="peace agreement example"
		style="width: 100%;"
	/>
</Filler>

<div class="filler">
	<p style="margin: 20px">
		Instead, peace processes frequently involve a series of back-and-forth
		movements, reflecting the reality that progress is rarely uniform or
		predictable.
	</p>
</div>

<Filler short={false} wide={true} center={true} shadow={true}>
	<img
		src="./img/messy_2.png"
		alt="peace agreement example"
		style="width: 100%;"
	/>
</Filler>

<div class="filler">
	<p style="margin: 20px">
		At which stage of peace negotiations does gender get discussed?
	</p>
</div>

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
					A common perception is that dealing with 'gender' must wait
					until comprehensive stages of negotiations, so that
					pre-negotiation or ceasefire talks can focus on more
					'urgent' issues.
				</p>
			</div>
		</section>
		<section data-id="stage03">
			<div class="col-medium">
				<p style="text-align: center;">
					For example, the 2014 Brazzaville Agreement on Cessation of
					Hostilities in Central African Republic included sexual
					violence as an act that parties would cease under the
					agreement.
				</p>
			</div>
		</section>
	</div>
</Scroller>


<Divider />

<Filler short={false} wide={true} center={true} shadow={false}>
	<p>
		In 2000, the United Nations Security Council passed Resolution 1325 on
		Women, Peace, and Security, calling on all actors involved in
		negotiating and implementing peace agreements to adopt a gender
		perspective, including:
	</p>
</Filler>

<Filler short={false} wide={true} center={true} shadow={false}>
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

<div class="filler" bind:this={scrollerRefTime}>
	<p style="margin: 20px">
		How did this influence the number of gender-related peace agreements
		over time?
	</p>
</div>

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
					Each line represents a peace agreements listed in PA-X that
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
					What's important to consider is that gender references
					differ hugely in terms of their substantive quality and
					specificity, ranging from detailed commitments to rhetorical
					references to 'women'. [make them different opacity]
				</p>
			</div>
		</section>
		<section data-id="time04">
			<div class="col-medium">
				<p style="text-align: center;">
					The highlighted agreements include references to the special
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
					The highlighted peace agreements include references to women
					playing a role in implementing the agreement.
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
		<section data-id="time08">
			<div class="col-medium">
				<p style="text-align: center;">
					Turning to the protection of human rights of women and
					girls, the highlighted peace agreements include references
					to international human rights laws relating to women and
					gender, including specific human rights standards.
				</p>
			</div>
		</section>
		<section data-id="time09">
			<div class="col-medium">
				<p style="text-align: center;">
					For example, in a 1996 peace agreement from Guatemala, the
					government agreed to revise national legislation to
					eliminate all forms of discrimination against women, and to
					give effect to the government commitments deriving from the
					ratification of the Convention on the Elimination of All
					Forms of Discrimination against Women.
				</p>
			</div>
		</section>
	</div>
</Scroller>

<!-- <Filler short={false} wide={true} center={true} shadow={true}></Filler> -->

<!-- TIME -->
<!-- <Scroller {threshold} bind:id={id["afgh"]} splitscreen={false} shadow={false}>
	<div slot="background">
		<figure>
			<div class="col-wide height-full">
				<div class="afgh">
					<Afghanistan {pax} {pax_timeline} {step} {afghanistan} />
				</div>
			</div>
		</figure>
	</div>

	<div slot="foreground">
		<section data-id="afgh01">
			<div class="col-medium">
				<p style="text-align: center;">
					Each line represents a peace agreements listed on PA-X that
					was reached between 1990 and 2023.
				</p>
			</div>
		</section>
		<section data-id="afgh02">
			<div class="col-medium">
				<p style="text-align: center;">
					PA-X Gender agreements over time.
				</p>
			</div>
		</section>
		<section data-id="afgh03">
			<div class="col-medium">
				<p style="text-align: center;">
					Gender references can differ hugely in terms of their
					substantive quality and specificity, ranging from detailed
					commitments to rhetorical references to 'women'.
				</p>
			</div>
		</section>
	</div>
</Scroller> -->

<style>
	#indicator {
		position: fixed;
		top: 0;
		left: 0;
		width: 30px;
		height: 100%;
		background-color: none;
		z-index: 100;
		display: flex;
		justify-content: center;
		align-items: flex-start;
	}

	.line {
		position: fixed;
		top: 0;
		left: 0px;
		width: 1px;
		height: 100%;
		background-color: rgb(110, 110, 110);
		display: flex;
	}

	.circle {
		width: 5px;
		height: 5px;
		background-color: white;
		border-radius: 50%;
		position: absolute;
		/* border: 1px solid white; */
		top: 0;
		left: 4px;
		transform: translateX(-50%);
		transition: top 0.1s linear;
	}

	:global(
			.scroll-line-agmt,
			.scroll-line-rect,
			.scroll-line-reason,
			.scroll-line-stage,
			.scroll-line-time,
			.scroll-line-geo
		) {
		position: absolute;
		width: 100%;
		height: 5px;
		/* background-color: yellow; */
		cursor: pointer;
	}

	.scroll-line-agmt img,
	.scroll-line-rect img,
	.scroll-line-reason img,
	.scroll-line-time img,
	.scroll-line-stage img,
	.scroll-line-geo img {
		height: 20px;
		padding-left: 8px;
	}

	.filler {
		padding: 50px;
		height: 100%;
		justify-content: center;
		display: flex;
		flex-direction: column;
		text-align: center;
	}

	#loading_screen {
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0px;
		left: 0px;
		background-color: black;
		display: flex;
		justify-content: center;
		z-index: 100;
	}

	#loading_text {
		position: absolute;
		top: 40%;
		color: rgb(255, 255, 255);
		margin: 0px;
		font-weight: 300;
		font-size: 16px;
	}

	#loading_button {
		font-family: "Montserrat";
		font-size: 14px;
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
	.stage,
	.afgh {
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
</style>
