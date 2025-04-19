<script>
	import * as d3 from "d3";
	import { setContext, onMount } from "svelte";
	import { themes } from "./config.js";
	import {
		setColors,
		getGEO,
		getCSV,
		keysToCount,
		hierarchy,
	} from "./utils.js";
	import { centralPointsStore } from "./store";
	import Header from "./layout/Header.svelte";
	import Scroller from "./layout/Scroller.svelte";
	import Filler from "./layout/Filler.svelte";
	import Divider from "./layout/Divider.svelte";
	import Stages from "./vis/Stages.svelte";
	import Rectangles from "./vis/Rectangles.svelte";
	import Timeline from "./vis/Timeline.svelte";
	import Geography from "./vis/Geography.svelte";
	import Dendrogram from "./vis/Dendrogram.svelte";

	// Scroll references
	let scrollerRefAgreement;
	let scrollerRefRectangles;
	let scrollerRefReason;
	let scrollerRefTime;
	let scrollerRefStages;
	let scrollerRefGeo;
	let scrollerRefDend;

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
		const lineDend = document.querySelector(".scroll-line-dendr");

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
					smoothScrollTo(scrollerTop, 2000);
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
					smoothScrollTo(scrollerTop, 2000);
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
					smoothScrollTo(scrollerTopReason, 2000);
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
					smoothScrollTo(scrollerTopTime, 2000);
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
					smoothScrollTo(scrollerTopStage, 2000);
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
					smoothScrollTo(scrollerTopGeo, 2000);
				});
			}

			if (scrollerRefDend instanceof HTMLElement) {
				const scrollerRectDend =
					scrollerRefDend.getBoundingClientRect();
				const scrollerTopDend = scrollerRectDend.top + window.scrollY;
				const scrollerPercentDend = scrollerTopDend / docHeight;
				const linePositionDend = scrollerPercentDend * indicatorHeight;

				lineDend.style.top = `${linePositionDend}px`;

				// Add click listener to lineGeo
				lineDend.addEventListener("click", () => {
					smoothScrollTo(scrollerTopDend, 2000);
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
	];
	let pax;
	let pax_gender;
	let pax_gender_text;
	let corr_text;
	let pax_timeline;
	let central_points;
	let wgg_text;
	let pax_stages;
	getCSV(path).then((data) => {
		centralPointsStore.set(central_points);
		pax = data[0];
		pax_gender = data[1];
		central_points = data[2];
		pax_gender_text = data[3];
		corr_text = data[4];
		wgg_text = data[5];

		const counter = {};
		keysToCount.forEach((key) => {
			counter[key] = 0;
		});

		// add text to every pax_gender agt
		// pax_gender.forEach((genderItem) => {
		// 	const item = pax_gender_text.find(
		// 		(gender) => gender.AgtId === genderItem.AgtId,
		// 	);

		// 	const find_corr = corr_text.find(
		// 		(gender) => gender.AgtId === genderItem.AgtId,
		// 	);

		// 	const detail_wgg = wgg_text.find(
		// 		(gender) => gender.AgtId === genderItem.AgtId,
		// 	);

		// 	const quotas_text = detail_wgg.WggGenQuot.length;
		// 	const law_text = detail_wgg.WggIntLaw.length;
		// 	const un_text = detail_wgg.WggUnsc.length;

		// 	if (item) {
		// 		genderItem.text = item.GeWom;
		// 		genderItem.quotas = quotas_text;
		// 		genderItem.law = law_text;
		// 		genderItem.un = un_text;
		// 		genderItem.corr_char_no = +find_corr.Text_length;
		// 	}
		// });

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

		pax_timeline = d3.groups(pax, (d) => d.Dat.substring(6, 10));
	});

	let mapLoaded = false;
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

<!-- navigation -->
<div id="indicator">
	<div class="circle"></div>
	<div class="line"></div>
	<div class="scroll-line-agmt"><img src="./img/agmt.png" alt="rect" /></div>
	<div class="scroll-line-rect"><img src="./img/recs.png" alt="rect" /></div>
	<div class="scroll-line-time"><img src="./img/line.png" alt="rect" /></div>
	<div class="scroll-line-stage"><img src="./img/bar.png" alt="rect" /></div>
	<div class="scroll-line-geo"><img src="./img/globe.png" alt="rect" /></div>
	<div class="scroll-line-dendr">
		<img src="./img/dendr.png" alt="rect" />
	</div>
</div>

<!-- loading screen -->
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

<Header center={true} short={false}>
	<img
		class="peace_logo"
		src="./img/pax_gender.svg"
		alt="peacerep logo"
		style="width: 200px;"
	/>
	<h1>Women, Girls, and Gender in Peace Agreements</h1>
	<p>
		This visualization uses PA-X database to show how and to what extent
		women, girls, and gender are taken into consideration in peace
		agreements around the world.
	</p>
</Header>

<div class="filler" bind:this={scrollerRefAgreement}>
	<p>
		A <strong>peace agreement</strong> is a document produced after
		discussion with conflict protagonists and mutually agreed to by them,
		addressing conflict with a view to ending it.
		<a
			href="https://pax.peaceagreements.org/agreements/search/"
			style="color:white">PA-X Database</a
		> collects and archives formal, publicly-available, signed peace agreements.
	</p>

	<p>Below is a ceasefire agreement from 1990 Nicaragua.</p>
</div>

<div class="filler" style="padding: 50px;">
	<a
		href="https://pax.peaceagreements.org/agreements/wgg/589/"
		target="_blank"
		style="color: white;"
	>
		<img
			src="./img/toncontin.png"
			alt="peace agreement example"
			style="width: 100%;"
		/>
	</a>
</div>

<div class="filler">
	<p>
		PA-X contains 2,055 peace agreements that have been signed since 1990.
	</p>
	<p>
		The map below shows the geographical spread of where these agreements
		are from and the primary location of the conflict they are addressing.
	</p>
</div>

<!-- Map -->
<Scroller {threshold} bind:id={id["map"]} splitscreen={false} shadow={false}>
	<div slot="background">
		<figure>
			<div class="col-wide height-full">
				<div class="map" bind:this={scrollerRefGeo}>
					<Geography
						{mygeojson}
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
					Brighter colour (white) indicates a higher number of peace
					agreements signed.
				</p>
			</div>
		</section>
		<section data-id="map02">
			<div class="col-medium">
				<p style="text-align: center;">
					Now, the map shows the number of peace agreements that
					contain at least two references to women, girls, and gender.
				</p>
			</div>
		</section>
	</div>
</Scroller>

<div class="filler">
	<p>
		To get a better idea about how often women, girls and gender are taken
		into consideration in peace agreements, below is a representation of all
		peace agreements in PA-X.
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
					Every rectangle in this view represents one of the 2,055
					formal agreements signed since 1990. You can see the example
					of the Toncontin Agreement from earlier in blue.
				</p>
			</div>
		</section>
		<section data-id="rect02">
			<div class="col-medium">
				<p style="text-align: center;">
					Out of all these agreements, less than a quarter contain
					references to women, girls, and gender (436 agreements).
				</p>
			</div>
		</section>
	</div>
</Scroller>

<div class="filler">
	<p style="margin: 20px">
		Why should peace agreements incorporate a gender perspective?
	</p>
</div>

<!-- <Filler short={true} wide={true} center={true} shadow={false}>
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

<div class="filler">
	<p>
		<strong>Peace agreements can provide a formalised blueprint</strong> to
		shape the political settlement that emerges from a peace deal, both
		legally and socially.<br /><br /> This can have consequences for how women,
		gender minorities, and sexual minorities may experience the transition that
		the peace agreement stipulates.
	</p>
</div>

<div class="filler">
	<p>
		<strong
			>Peace agreements can create 'sticky' institutional arrangements
			that can be hard to later re-negotiate.</strong
		><br /><br /> Any gaps in how the peace agreement understands or responds
		to gender, may become stuck and difficult to resolve through institutional
		mechanisms.
	</p>
</div>

<div class="filler">
	<p>
		<strong>Peace agreements are not gender neutral by default</strong> They
		contain institutional configurations, security mechanisms and human
		rights regimes that all shape different gender outcomes or impacts
		women's lives.
		<br />
		<br />
		Hear more on this from PeaceRep's Women Peace and Security expert, Laura
		Wise in this short, informative video (3 mins).
		<!-- ask laura about the video. youtube?  -->
	</p>
</div>


<div class="filler" bind:this={scrollerRefStages}>
	<p style="margin: 20px">
		There are different <strong>stages of peace processes</strong> depending
		on the content included in agreements: from pre-neogtiation/process
		agreements where there are 'talks about talks', to ceasefires, to more
		comprehensive agreements and implementation agreeements.<br /><br /> If the
		process went smoothly from one stage to the next it would look like this
		over time:
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
		predictable.<br /><br /> For example, here is the trajectory of the Philippines-Mindano
		Process.
	</p>
</div>

<Filler short={false} wide={true} center={true} shadow={true}>
	<img
		src="./img/messy_2.png"
		alt="peace agreement example"
		style="width: 100%;"
	/>
	<p>
		Explore the trajectory of other processes in PA-X on our <a
			href="https://pax.peaceagreements.org/visualizations/messy-peace-processes/"
			target="_blank"
			style="color: white;">Messy Timeline Visualization</a
		>
	</p>
</Filler>

<div class="filler">
	<p style="margin: 20px">
		At which stage of peace negotiations do women, girls, and gender get
		discussed?
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
					When viewing all PA-X agreements by the stage of the peace
					process they were signed at, the chart below shows the
					predominance of <strong>pre-negotiation/process</strong>,
					<strong>ceasefire</strong>, and
					<strong>substantive-partial</strong> agreements.
				</p>
			</div>
		</section>
		<section data-id="stage02">
			<div class="col-medium">
				<p style="text-align: center;">
					A common perception is that dealing with 'gender' must wait
					until substantive stages of negotiations (partial and
					comprehensive), so that the earlier pre-negotiation or
					ceasefire talks can focus on more 'urgent' issues.
				</p>
			</div>
		</section>
		<section data-id="stage03">
			<div class="col-medium">
				<p style="text-align: center;">
					For example, a ceasefire in Central African Republic in 2014
					- the <a
						href="https://pax.peaceagreements.org/media/documents/ag818_573ed266c7c9c.pdf"
						target="_blank"
						style="color: white;"
						>Brazzaville Agreement on Cessation of Hostilities</a
					> - included 'gender' by stipulating that under the agreement
					the parties would cease the act of sexual violence.
				</p>
			</div>
		</section>
	</div>
</Scroller>


<div class="filler">
	<p>
		In 2000, the United Nations Security Council passed Resolution 1325 on
		Women, Peace, and Security, calling on all actors involved in
		negotiating and implementing peace agreements to adopt a gender
		perspective, including:
	</p>
</div>

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
					Each line represents a peace agreement signed between 1990 and 2023.
				</p>
			</div>
		</section>
		<section data-id="time02">
			<div class="col-medium">
				<p style="text-align: center;">
					These are the agreements included in PA-X Gender.
				</p>
			</div>
		</section>
		<section data-id="time03">
			<div class="col-medium">
				<p style="text-align: center;">
					What's important to consider is that gender references
					differ hugely in terms of their substantive quality and
					specificity, ranging from detailed commitments to rhetorical
					references to 'women'.
					<!-- [make them different opacity] -->
				</p>
			</div>
		</section>
		<section data-id="time04">
			<div class="col-medium">
				<p style="text-align: center;">
					For example, only these highlighted agreements include
					substantive references to the special needs of women and
					girls during rehabilitation and reconstruction. However,
					they often are not a large proportion of the agreement
					focus.
				</p>
			</div>
		</section>
		<section data-id="time05">
			<div class="col-medium">
				<p style="text-align: center;">
					One instance is the <a
						href="https://pax.peaceagreements.org/media/documents/ag478_55d493ee828e7.pdf"
						target="_blank"
						style="color: white;">Lome Agreement</a
					>
					for Sierra Leone in 1999 that acknowledged women's victimization
					during the war, and stated that
					<i style="font-size: 18px;"
						>'special attention shall be accorded to their needs and
						potentials in formulating and implementing national
						rehabilitation, reconstruction and development
						programmes, to enable them to play a central role in the
						moral, social and physical reconstruction of Sierra
						Leone.'</i
					> This was the only reference to gender (highlighted in red)
					in the entire agreement text.
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
					For example, the 2016 <a
						href="https://pax.peaceagreements.org/media/documents/ag1845_593e97bdd6f32.pdf"
						target="_blank"
						style="color: white;">Final Agreement</a
					> between the Colombian Government and the FARC set up a special
					forum comprising representatives from 6 national and regional
					Colombian women's organisations, to work with the implementation
					commission on monitoring and guaranteeing the rights of women
					in the implementation of the peace agreement.
				</p>
			</div>
		</section>
		<section data-id="time08">
			<div class="col-medium">
				<p style="text-align: center;">
					Turning to the protection of human rights of women and
					girls, the highlighted peace agreements include references
					to <strong>international human rights laws</strong> relating
					to women and gender, including specific human rights standards.
				</p>
			</div>
		</section>
		<section data-id="time09">
			<div class="col-medium">
				<p style="text-align: center;">
					For example, in a 1996 <a
						href="https://pax.peaceagreements.org/media/documents/ag291_5630f71a3ae07.pdf"
						style="color: white;"
						target="_blank">peace agreement from Guatemala</a
					>, the government agreed to revise national legislation to
					eliminate all forms of discrimination against women, and to
					give effect to the government commitments deriving from the
					ratification of the Convention on the Elimination of All
					Forms of Discrimination against Women.
				</p>
			</div>
		</section>
	</div>
</Scroller>

<div class="filler" bind:this={scrollerRefDend}>
	<p style="margin: 20px">
		As you can see, peace agreements cover different topics related to
		women, girls and gender. Sometimes there are a lot of topics addressed,
		and sometimes there are very few. <br /><br />
		Below shows a representation of all topics related to women, girls and gender
		that are coded for all agreements in PA-X Gender.
	</p>
</div>

<Scroller {threshold} bind:id={id["afgh"]} splitscreen={false} shadow={false}>
	<div slot="background">
		<figure>
			<div class="col-wide height-full">
				<div class="afgh">
					<Dendrogram {pax_gender} {step} />
				</div>
			</div>
		</figure>
	</div>

	<div slot="foreground">
		<section data-id="afgh01">
			<div class="col-medium">
				<p style="text-align: center;">
					This is the distribution of gender-related topic in all 436
					agreements. You can see the majority of references across
					all the agreements are regarding women's participation, and
					sexual violence.
				</p>
			</div>
		</section>
		<section data-id="afgh02">
			<div class="col-medium">
				<p style="text-align: center;">
					The earlier referenced Toncontin Agreement from 1990,
					includes these gender-related topics.
				</p>
			</div>
		</section>
		<section data-id="afgh03">
			<div class="col-medium">
				<p style="text-align: center;">
					In contrast, the more recent 2016 Colombian Final Agreement
					includes these topics.
				</p>
			</div>
		</section>
	</div>
</Scroller>

<style>
	h1 {
		font-size: 1em;
	}
	p {
		font-size: 0.8em;
	}
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
		top: 0;
		left: 4px;
		transform: translateX(-50%);
		transition: top 0.1s linear;
	}

	:global(
			.scroll-line-agmt,
			.scroll-line-rect,
			.scroll-line-stage,
			.scroll-line-time,
			.scroll-line-geo,
			.scroll-line-dendr
		) {
		position: absolute;
		width: 100%;
		height: 5px;
		cursor: pointer;
	}

	.scroll-line-agmt img,
	.scroll-line-rect img,
	.scroll-line-dendr img,
	.scroll-line-time img,
	.scroll-line-stage img,
	.scroll-line-geo img {
		height: 20px;
		padding-left: 8px;
	}

	.filler {
		padding: 20%;
		height: 100%;
		justify-content: center;
		display: flex;
		flex-direction: column;
	}

	#loading_screen {
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0px;
		left: 0px;
		background-color: #001C23;
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
		background-color: #001C23;
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
