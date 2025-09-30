<script>
	import * as d3 from "d3";
	import { onMount, onDestroy } from "svelte";
	import { getGEO, getCSV, keysToCount } from "./utils.js";
	import { centralPointsStore } from "./store";
	import Header from "./layout/Header.svelte";
	import Scroller from "./layout/Scroller.svelte";
	import Stages from "./vis/Stages.svelte";
	import Rectangles from "./vis/Rectangles.svelte";
	import Timeline from "./vis/Timeline.svelte";
	import Area from "./vis/Area.svelte";
	import Geography from "./vis/Geography.svelte";
	import Dendrogram from "./vis/Dendrogram.svelte";

	// Scroll references
	let scrollerRefAgreement,
		scrollerRefRectangles,
		scrollerRefReason,
		scrollerRefTime,
		scrollerRefStages,
		scrollerRefGeo,
		scrollerRefDend,
		scrollerRefResearch;

	let scrollerTopAgmt,
		scrollerTopGeo,
		scrollerTopRect,
		scrollerTopReason,
		scrollerTopStage,
		scrollerTopTime,
		scrollerTopDend,
		scrollerTopRes;

	//handlers
	let resizeHandler;
	let onScroll;

	// CONFIG FOR SCROLLER COMPONENTS
	const threshold = 0.65;
	let id = {}; // Object to hold visible section IDs of Scroller components
	let idPrev = {}; // Object to keep track of previous IDs, to compare for changes

	// Custom smooth scroll function with slower speed
	function smoothScrollTo(targetPosition) {
		const start = window.scrollY;
		const distance = targetPosition - start;
		const direction = distance > 0 ? 1 : -1;
		const totalDistance = Math.abs(distance);
		let startTime = null;

		function step(currentTime) {
			if (!startTime) startTime = currentTime;
			const elapsed = currentTime - startTime;
			const traveled = Math.min(elapsed * 5, totalDistance);
			window.scrollTo(0, start + traveled * direction);

			if (traveled < totalDistance) {
				requestAnimationFrame(step);
			}
		}
		requestAnimationFrame(step);
	}

	let active = {
		agreement: false,
		geo: false,
		rect: false,
		reason: false,
	};

	// in/out of viewpoint functions
	function handleEnter(section) {
		d3.select(".rotated").transition().style("opacity", 0);
		d3.selectAll(
			".scroll-line-agmt img, .scroll-line-geo img, .scroll-line-rect img, .scroll-line-reason img, .scroll-line-stage img, .scroll-line-time img, .scroll-line-dendr img",
		).style("opacity", 0.5);
		// Set opacity to 1 for the corresponding icon
		d3.select(`.scroll-line-${section} img`).style("opacity", 1);
	}

	function handleLeave(section) {
		// Set opacity to 0.5 for the corresponding icon
		d3.select(`.scroll-line-${section} img`).style("opacity", 0.5);
		if (section == "geo") {
			d3.select(`.scroll-line-agmt img`).style("opacity", 1);
		} else if (section == "rect") {
			d3.select(`.scroll-line-geo img`).style("opacity", 1);
		} else if (section == "reason") {
			d3.select(`.scroll-line-rect img`).style("opacity", 1);
		} else if (section == "stage") {
			d3.select(`.scroll-line-reason img`).style("opacity", 1);
		} else if (section == "time") {
			d3.select(`.scroll-line-stage img`).style("opacity", 1);
		} else if (section == "dendr") {
			d3.select(`.scroll-line-time img`).style("opacity", 1);
		} else if (section == "research") {
			d3.select(`.scroll-line-dendr img`).style("opacity", 1);
		} else {
			d3.select(".rotated").transition().style("opacity", 1);
		}
	}

	// INIT functions
	onMount(() => {
		// scroll to top on loading the page
		if ("scrollRestoration" in history) {
			history.scrollRestoration = "manual";
		}
		window.scrollTo({ top: 0, behavior: "auto" });
		idPrev = { ...id };

		// indicator
		const indicator = document.querySelector("#indicator");
		const lineAgmt = document.querySelector(".scroll-line-agmt");
		const lineGeo = document.querySelector(".scroll-line-geo");
		const lineRect = document.querySelector(".scroll-line-rect");
		const lineReason = document.querySelector(".scroll-line-reason");
		const lineTime = document.querySelector(".scroll-line-time");
		const lineStage = document.querySelector(".scroll-line-stage");
		const lineDend = document.querySelector(".scroll-line-dendr");
		const lineResearch = document.querySelector(".scroll-line-research");

		if (!indicator) return;

		const setFixedLinePosition = () => {
			let docHeight =
				document.documentElement.scrollHeight - window.innerHeight;

			if (docHeight <= 0) {
				requestAnimationFrame(setFixedLinePosition);
				return;
			}

			// Position agt
			if (scrollerRefAgreement instanceof HTMLElement) {
				let scrollerAgmt = scrollerRefAgreement.getBoundingClientRect();
				scrollerTopAgmt = scrollerAgmt.top + window.scrollY;

				// Add click listener to lineRect
				lineAgmt.addEventListener("click", () => {
					smoothScrollTo(scrollerTopAgmt);
				});
			}

			// Position map
			if (scrollerRefGeo instanceof HTMLElement) {
				const scrollerRectGeo = scrollerRefGeo.getBoundingClientRect();
				scrollerTopGeo = scrollerRectGeo.top + window.scrollY;
				lineGeo.addEventListener("click", () => {
					smoothScrollTo(scrollerTopGeo);
				});
			}

			// Position rects
			if (scrollerRefRectangles instanceof HTMLElement) {
				let scrollerRect =
					scrollerRefRectangles.getBoundingClientRect();
				scrollerTopRect = scrollerRect.top + window.scrollY;
				lineRect.addEventListener("click", () => {
					smoothScrollTo(scrollerTopRect);
				});
			}

			// Position lineReason
			if (scrollerRefReason instanceof HTMLElement) {
				let scrollerReason = scrollerRefReason.getBoundingClientRect();
				scrollerTopReason = scrollerReason.top + window.scrollY;
				lineReason.addEventListener("click", () => {
					smoothScrollTo(scrollerTopReason);
				});
			}

			// Position lineStage
			if (scrollerRefStages instanceof HTMLElement) {
				const scrollerRectStage =
					scrollerRefStages.getBoundingClientRect();
				scrollerTopStage = scrollerRectStage.top + window.scrollY;
				lineStage.addEventListener("click", () => {
					smoothScrollTo(scrollerTopStage);
				});
			}

			// Position lineTime
			if (scrollerRefTime instanceof HTMLElement) {
				const scrollerRectTime =
					scrollerRefTime.getBoundingClientRect();
				scrollerTopTime = scrollerRectTime.top + window.scrollY;
				lineTime.addEventListener("click", () => {
					smoothScrollTo(scrollerTopTime);
				});
			}

			if (scrollerRefDend instanceof HTMLElement) {
				const scrollerRectDend =
					scrollerRefDend.getBoundingClientRect();
				scrollerTopDend = scrollerRectDend.top + window.scrollY;
				lineDend.addEventListener("click", () => {
					smoothScrollTo(scrollerTopDend);
				});
			}

			if (scrollerRefResearch instanceof HTMLElement) {
				const scrollerRectRes =
					scrollerRefResearch.getBoundingClientRect();
				scrollerTopRes = scrollerRectRes.top + window.scrollY;
				lineResearch.addEventListener("click", () => {
					smoothScrollTo(scrollerTopRes);
				});
			}
		};

		// scroll handler
		onScroll = () => {
			const scrollPos = window.scrollY + window.innerHeight * 0.5; // trigger roughly at middle

			// Agreement
			if (scrollerTopAgmt) {
				if (!active.agreement && scrollPos >= scrollerTopAgmt) {
					active.agreement = true;
					handleEnter("agmt");
				} else if (active.agreement && scrollPos < scrollerTopAgmt) {
					active.agreement = false;
					handleLeave("agmt");
				}
			}

			// Geo
			if (scrollerTopGeo) {
				if (!active.geo && scrollPos >= scrollerTopGeo) {
					active.geo = true;
					handleEnter("geo");
				} else if (active.geo && scrollPos < scrollerTopGeo) {
					active.geo = false;
					handleLeave("geo");
				}
			}

			// Rect
			if (scrollerTopRect) {
				if (!active.rect && scrollPos >= scrollerTopRect) {
					active.rect = true;
					handleEnter("rect");
				} else if (active.rect && scrollPos < scrollerTopRect) {
					active.rect = false;
					handleLeave("rect");
				}
			}

			// Reason
			if (scrollerTopReason) {
				if (!active.reason && scrollPos >= scrollerTopReason) {
					active.reason = true;
					handleEnter("reason");
				} else if (active.reason && scrollPos < scrollerTopReason) {
					active.reason = false;
					handleLeave("reason");
				}
			}

			// stages
			if (scrollerTopStage) {
				if (!active.stage && scrollPos >= scrollerTopStage) {
					active.stage = true;
					handleEnter("stage");
				} else if (active.stage && scrollPos < scrollerTopStage) {
					active.stage = false;
					handleLeave("stage");
				}
			}

			// time
			if (scrollerTopTime) {
				if (!active.time && scrollPos >= scrollerTopTime) {
					active.time = true;
					handleEnter("time");
				} else if (active.time && scrollPos < scrollerTopTime) {
					active.time = false;
					handleLeave("time");
				}
			}

			// dend
			if (scrollerTopDend) {
				if (!active.dendr && scrollPos >= scrollerTopDend) {
					active.dendr = true;
					handleEnter("dendr");
				} else if (active.dendr && scrollPos < scrollerTopDend) {
					active.dendr = false;
					handleLeave("dendr");
				}
			}

			// research
			if (scrollerTopRes) {
				if (!active.research && scrollPos >= scrollerTopRes) {
					active.research = true;
					handleEnter("research");
				} else if (active.research && scrollPos < scrollerTopRes) {
					active.research = false;
					handleLeave("research");
				}
			}
		};

		window.addEventListener("scroll", onScroll);
		onScroll(); // initial check

		// Set the fixed line position once
		requestAnimationFrame(setFixedLinePosition);

		// global resize handler
		resizeHandler = () => requestAnimationFrame(setFixedLinePosition);
		window.addEventListener("resize", resizeHandler);
	});

	// cleanup on destroy
	onDestroy(() => {
		window.removeEventListener("resize", resizeHandler);
	});

	onDestroy(() => {
		window.removeEventListener("scroll", onScroll);
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
		area: {
			area01: () => {
				step = "area01";
			},
			area02: () => {
				step = "area02";
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
			afgh04: () => {
				step = "afgh04";
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
		"./data/pax_v9.csv",
		"./data/pax_gender_v9.csv",
		"./data/gender_categories.csv",
	];
	let pax;
	let pax_gender;
	let pax_timeline;
	let central_points;
	let pax_stages;
	let categories;
	getCSV(path).then((data) => {
		centralPointsStore.set(central_points);
		pax = data[0];
		pax_gender = data[1];
		categories = data[2];

		const counter = {};
		keysToCount.forEach((key) => {
			counter[key] = 0;
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
			return d3.ascending(x.Dat.substring(0, 4), y.Dat.substring(0, 4));
		});

		//group by agreement stages
		pax_stages = d3.groups(pax, (d) => d.Stage);
		let order = ["Pre", "Cea", "SubPar", "SubComp", "Imp", "Ren", "Oth"];
		pax_stages.sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]));

		pax_timeline = d3.groups(pax, (d) => d.Dat.substring(0, 4));
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

	let info_checker = 0;
	function infoPressed() {
		if (info_checker % 2 == 0) {
			d3.select(".info_div").style("top", "1px");
		} else {
			d3.select(".info_div").style("top", "-100%");
		}
		info_checker += 1;
	}

	$: console.log(step);
</script>

<!-- navigation -->
<div id="indicator">
	<p class="rotated" style="color: black;">CHAPTERS</p>
	<div class="scroll-line-agmt" data-tooltip="Peace Agreement">
		<img src="./img/agt.svg" alt="rect" />
	</div>
	<div class="scroll-line-geo" data-tooltip="Geography">
		<img src="./img/glb.svg" alt="rect" />
	</div>
	<div class="scroll-line-rect" data-tooltip="All Agreements">
		<img src="./img/rects.svg" alt="rect" />
	</div>
	<div class="scroll-line-reason" data-tooltip="UN Resolution">
		<img src="./img/un.svg" alt="rect" />
	</div>
	<div class="scroll-line-stage" data-tooltip="Negotiation Stages">
		<img src="./img/bars.svg" alt="rect" />
	</div>
	<div class="scroll-line-time" data-tooltip="Reference Quality">
		<img src="./img/ref.svg" alt="rect" />
	</div>
	<div class="scroll-line-dendr" data-tooltip="Topics">
		<img src="./img/dendr.svg" alt="rect" />
	</div>
	<div class="scroll-line-research" data-tooltip="Research">
		<img src="./img/research.svg" alt="rect" />
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
	<button
		class="info"
		on:mouseenter={() => infoPressed()}
		on:mouseleave={() => infoPressed()}
		><i class="fa fa-info" aria-hidden="true"></i></button
	>
	<div class="info_div">
		This 'scrollytelling' tool allows users to scroll through key findings
		and insights from data in the PA-X Peace Agreements Database, with a
		specific view on Gender inclusion in formal peace agreements in the
		context of the UN Security Resolution 1325. Cite the data shown in this
		tool using: <br /><br /><i
			>Bell, Christine, Sanja Badanjak, Juline Beaujouan, Tim Epple, Adam
			Farquhar, Robert Forster, Astrid Jamar, Sean Molloy, Kevin
			McNicholl, Kathryn Nash, Jan Pospisil, Robert Wilson, and Laura Wise
			(2025). PA-X Gender Peace Agreements Database and Dataset, Version
			9.</i
		>
		<br />
		<br />
		<strong>Visualization</strong>: Tomas Vancisin<br /><strong
			>Data Preparation</strong
		>: Niamh Henry <br /> <strong>Text</strong>: Laura Wise
	</div>

	<img
		class="peace_logo"
		src="./img/pax.png"
		alt="peacerep logo"
		style="width: 200px;"
	/>
	<h1>Women, Girls, and Gender in Peace Agreements</h1>
	<div id="text_field" style="padding-left: 20%; padding-right:20%">
		<p>
			Marking the 25<sup>th</sup> Anniversary of the Women, Peace and Security
			agenda, this visualization uses the PA-X database to show how and to
			what extent women, girls, and gender are taken into consideration in
			peace agreements around the world.
		</p>
	</div>
	<br />
	<p style="font-weight: 700;">SCROLL DOWN</p>
	<img src="./img/down.svg" alt="scroll down" class="scroll-down-icon" />
</Header>

<div class="filler" bind:this={scrollerRefAgreement}>
	<div id="text_field">
		<p style="text-align: center;">
			A <strong>peace agreement</strong> is a document produced after
			discussion with conflict protagonists and mutually agreed to by
			them, addressing conflict with a view to ending it. <br /><br />
			The
			<a href="https://pax.peaceagreements.org/agreements/search/"
				>PA-X Peace Agreement Database</a
			>
			collects and archives formal, publicly-available, signed peace agreements.
			PA-X Gender is a sub-database of PA-X that includes agreements that contain
			mentions to Women, Girls or Gender. Below is a ceasefire agreement from
			1990 Nicaragua.
		</p>
	</div>
</div>

<div class="filler">
	<a
		href="https://pax.peaceagreements.org/agreements/wgg/589/"
		target="_blank"
		style="color: white;"
	>
		<img
			src="./img/toncontin.png"
			alt="peace agreement example"
			style="width: 100%; box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;"
		/>
	</a>
</div>

<div class="filler">
	<div id="text_field">
		<p style="text-align: center;">
			In 2000, the United Nations Security Council passed Resolution 1325
			on Women, Peace, and Security, calling on all actors involved in
			negotiating and implementing peace agreements to adopt a gender
			perspective, including the following:
		</p>
	</div>
</div>

<div id="icons">
	<div class="icon-item">
		<img
			src="./img/fir.svg"
			alt="peace agreement example"
			style="height: 100px;"
		/>
		<p
			style="text-align: center; font-size: 14px; padding-left: 10%; padding-right: 10%;"
		>
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
		<p
			style="text-align: center; font-size: 14px; padding-left: 10%; padding-right: 10%"
		>
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
		<p
			style="text-align: center; font-size: 14px; padding-left: 10%; padding-right: 10%"
		>
			Ensuring the protection of human rights of women and girls,
			particularly relating to the constitution, the electoral system, the
			police and the judiciary
		</p>
	</div>
</div>

<div class="filler">
	<div id="text_field">
		<p style="text-align: center; background-color:white">
			Why should peace agreements incorporate a gender perspective?
		</p>
	</div>
</div>

<div id="icons">
	<div class="icon-item">
		<img
			src="./img/blueprint.png"
			alt="peace agreement example"
			style="height: 100px;"
		/>
		<p
			style="text-align: center; font-size: 14px; padding-left: 5%; padding-right: 5%"
		>
			<strong
				>Peace agreements can provide a formalised blueprint to shape
				the political settlement that emerges from a peace deal.</strong
			> <br /><br /> This can have consequences for how women, gender minorities,
			and sexual minorities may experience the transition that the peace agreement
			stipulates.
		</p>
	</div>
	<div class="icon-item">
		<img
			src="./img/negotiation.png"
			alt="peace agreement example"
			style="height: 100px;"
		/>
		<p
			style="text-align: center; font-size: 14px; padding-left: 5%; padding-right: 5%"
		>
			<strong
				>Peace agreements can create 'sticky' institutional arrangements
				that can be hard to later re-negotiate.</strong
			> <br /><br />Any gaps in how the peace agreement understands or
			responds to gender, may become stuck and difficult to resolve
			through institutional mechanisms.
		</p>
	</div>
	<div class="icon-item">
		<img
			src="./img/gender.png"
			alt="peace agreement example"
			style="height: 100px;"
		/>
		<p
			style="text-align: center; font-size: 14px; padding-left: 5%; padding-right: 5%"
		>
			<strong>Peace agreements are not gender neutral by default.</strong
			><br /><br />
			They contain institutional configurations, security mechanisms and human
			rights regimes that all shape different gender outcomes or impacts women's
			lives.
		</p>
	</div>
	<div id="text_field">
		<p style="text-align: center;">
			Hear more on this from PeaceRep Women Peace and Security expert,
			Laura Wise in this short, informative <a
				href="https://www.youtube.com/watch?v=52GFh0r6Zj8"
				target="_blank"
				style="color: black;">video</a
			> (3 mins).
		</p>
	</div>
</div>

<div class="filler" bind:this={scrollerRefGeo}>
	<div id="text_field">
		<p style="text-align: center;">
			PA-X contains 2,144 peace agreements that have been signed since
			1990. The map below shows the geographical spread of where these
			agreements are from and the primary location of the conflict they
			are addressing.
		</p>
	</div>
</div>

<!-- Map -->
<Scroller {threshold} bind:id={id["map"]} splitscreen={false} shadow={false}>
	<div slot="background">
		<figure>
			<div class="col-wide height-full">
				<div class="map">
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
					Darker colour (black) indicates a higher number of peace
					agreements signed. <span style="color: gray;"
						>[<i
							>hover over a country for the exact number of peace
							agreements</i
						>]</span
					>
				</p>
			</div>
		</section>
		<section data-id="map02">
			<div class="col-medium">
				<p style="text-align: center;">
					Now, the map shows the number of peace agreements that
					contain at least <strong>two</strong> references to women, girls,
					and gender.
				</p>
			</div>
		</section>
	</div>
</Scroller>

<div class="filler" bind:this={scrollerRefRectangles}>
	<div id="text_field">
		<p style="text-align: center;">
			To get a better idea about how often women, girls and gender are
			taken into consideration in peace agreements, below is a
			representation of all peace agreements in PA-X.
		</p>
	</div>
</div>

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
					Every rectangle in this view represents one of the 2,144
					formal agreements signed since 1990.
				</p>
			</div>
		</section>
		<section data-id="rect02">
			<div class="col-medium">
				<p style="text-align: center;">
					Out of all these agreements, less than a quarter contain
					references to women, girls, and gender (465 agreements).
				</p>
			</div>
		</section>
	</div>
</Scroller>

<div class="filler" bind:this={scrollerRefReason}>
	<div id="text_field">
		<p style="text-align: center">
			How did UNSCR 1325 influence the number of gender-related peace
			agreements over time?
		</p>
	</div>
</div>

<!-- TIME -->
<Scroller {threshold} bind:id={id["area"]} splitscreen={false} shadow={false}>
	<div slot="background">
		<figure>
			<div class="col-wide height-full">
				<div class="area">
					<Area {pax} {pax_timeline} {step} />
				</div>
			</div>
		</figure>
	</div>

	<div slot="foreground">
		<section data-id="area01">
			<div class="col-medium">
				<p style="text-align: center;">
					This area chart shows the number of peace agreements signed
					per year since 1990.
				</p>
			</div>
		</section>
		<section data-id="area02">
			<div class="col-medium">
				<p style="text-align: center;">
					The dark area chart shows the number of peace agreements
					containing references to women, girls, and gender.
				</p>
			</div>
		</section>
	</div>
</Scroller>

<div class="filler" bind:this={scrollerRefStages}>
	<div id="text_field">
		<p style="text-align: center">
			There are different <strong>stages of peace processes</strong>
			depending on the content included in agreements: from pre-neogtiation
			agreements where there are 'talks about talks', to ceasefires, to more
			comprehensive agreements and implementation agreements.<br /><br />
			If the process went smoothly from one stage to the next it would look
			like this over time:
		</p>
	</div>
</div>

<div class="filler">
	<img
		src="./img/messy_1.png"
		alt="messy timeline visualization picutre"
		style="width: 100%;"
	/>
</div>

<div class="filler">
	<div id="text_field">
		<p style="text-align:center">
			Instead, peace processes frequently involve a series of
			back-and-forth movements, reflecting the reality that progress is
			rarely uniform or predictable. For example, here is the trajectory
			of the Philippines-Mindanao Process.
		</p>
	</div>
</div>

<div class="filler">
	<img
		src="./img/messy_2.png"
		alt="peace agreement example"
		style="width: 100%;"
	/>
	<p style="color: black;">
		Explore the trajectory of other processes in PA-X on our <a
			href="https://pax.peaceagreements.org/visualizations/messy-peace-processes/"
			target="_blank"
			style="color: black;">Messy Timeline Visualization</a
		>
	</p>
</div>

<div class="filler">
	<div id="text_field">
		<p style="text-align: center">
			At which stage of peace negotiations do women, girls, and gender get
			discussed?
		</p>
	</div>
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
		<section>
			<div class="col-medium">
				<p style="text-align: center;">
					However, gendered issues can be included in agreements at
					any stage of a peace process.
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
						style="color: black;"
						>Brazzaville Agreement on Cessation of Hostilities</a
					> - included 'gender' by stipulating that under the agreement
					the parties would cease the act of sexual violence.
				</p>
			</div>
		</section>
	</div>
</Scroller>

<div class="filler" bind:this={scrollerRefTime}>
	<div id="text_field">
		<p style="text-align: center">
			Beyond the numbers, gender references differ hugely in terms of
			their substantive quality and specificity, ranging from detailed
			commitments to rhetorical references to 'women'.
		</p>
	</div>
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
		<section>
			<div class="col-medium">
				<p style="text-align: center;">
					These are all peace agreements signed since 1990, each
					represented as a line.
				</p>
			</div>
		</section>
		<section data-id="time01">
			<div class="col-medium">
				<p style="text-align: center;">
					Let’s explore gender reference quality and specificity
					through three focus areas of a gender perspective according
					to UNSCR 1325: women’s special needs during rehabilitation
					and reconstruction, involving women in implementation, and
					protecting the human rights of women and girls.
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
						style="color: black">Lome Agreement</a
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
						style="color: black;">Final Agreement</a
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
						style="color: black;"
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
	<div id="text_field">
		<p style="text-align: center">
			As you can see, peace agreements cover different topics related to
			women, girls and gender. Sometimes there are a lot of topics
			addressed, and sometimes there are very few. <br /><br />
			Below shows a representation of all topics related to women, girls and
			gender that are coded for all agreements in PA-X Gender.
		</p>
	</div>
</div>

<Scroller {threshold} bind:id={id["afgh"]} splitscreen={false} shadow={false}>
	<div slot="background">
		<figure>
			<div class="col-wide height-full">
				<div class="afgh">
					<Dendrogram {pax_gender} {step} {categories} />
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
		<section data-id="afgh04">
			<div class="col-medium">
				<p style="text-align: center;">
					You can choose an agreement from the list on the right.
				</p>
			</div>
		</section>
	</div>
</Scroller>

<div class="filler">
	<div id="text_field">
		<p style="text-align: center">
			PA-X Gender shows that 25 years after UNSCR 1325 was passed, peace
			agreements still do not consistently incorporate a gender
			perspective.
			<br /><br /><br />
			However, women and their allies continue to push for peace processes
			to recognise the importance of gender, both from within and outside of
			formal institutions.
			<br /><br /><br />
			PA-X Gender is an archive of processes where women were successful at
			getting gender into peace agreements, and pays tribute to their historical
			efforts.
		</p>
	</div>
</div>

<div class="filler" bind:this={scrollerRefResearch}>
	<p style="text-align: center; color: black">
		Explore our research and data on gender in peace agreements, and how
		this work informs Women, Peace and Security monitoring.
	</p>
	<div id="research_field">
		<div class="research_item">
			<a
				href="https://www.peaceagreements.org/agreements/wggsearch/"
				target="_blank"
			>
				<img src="./img/gender_db.png" alt="PA-X Gender Database" />
			</a>
			<p>PA-X Gender Database</p>
		</div>
		<div class="research_item">
			<a
				href="https://peacerep.org/2025/07/24/women-peace-and-security-at-25/"
				target="_blank"
			>
				<img
					src="./img/one.png"
					alt="Women, Peace and Security at 25"
				/>
			</a>
			<p>
				Women, Peace and Security at 25: Assessing Implementation
				through Gender Perspectives in Peace Agreements
			</p>
		</div>
		<div class="research_item">
			<a
				href="https://peacerep.org/2024/10/28/un-report-cites-peacerep-research-on-stagnation-of-gender-references-in-peace-agreements/"
				target="_blank"
			>
				<img
					src="./img/two.png"
					alt="UN Report Cites PeaceRep Research"
				/>
			</a>
			<p>
				UN Report Cites PeaceRep Research on Stagnation of Gender
				References in Peace Agreements
			</p>
		</div>
		<div class="research_item">
			<a
				href="https://peacerep.org/publication/principled-pragmatism-and-the-inclusion-project-implementing-a-gender-perspective-in-peace-agreements/"
				target="_blank"
			>
				<img src="./img/four.png" alt="Principled Pragmatism Paper" />
			</a>
			<p>
				Principled Pragmatism and the ‘Inclusion Project’: Implementing
				a Gender Perspective in Peace Agreements
			</p>
		</div>
		<div class="research_item">
			<a
				href="https://peacerep.org/digital-resources/peacefem/"
				target="_blank"
			>
				<img src="./img/three.png" alt="PeaceFem App" />
			</a>
			<p>PeaceFem</p>
		</div>
	</div>
</div>

<style>
	h1 {
		font-size: 1em;
	}

	p {
		font-size: 0.8em;
	}

	#indicator {
		position: fixed; /* stays fixed when scrolling */
		top: 50%; /* halfway down the screen */
		left: 0; /* stick to the left edge */
		transform: translateY(-50%); /* shift up by half its height */

		display: flex; /* flexbox for layout */
		flex-direction: column; /* stack children vertically */
		align-items: left; /* center images horizontally inside */
		gap: 12px; /* spacing between images */
		padding: 5px; /* optional, keeps from touching edge */
		z-index: 99;
	}

	#indicator > div {
		position: relative; /* so tooltip positions relative to each icon */
		cursor: pointer;
	}

	#indicator > div::after {
		content: attr(data-tooltip);
		position: absolute;
		left: 35px; /* place to the right of the icon */
		top: 50%;
		transform: translateY(-50%);
		white-space: nowrap;

		background: white;
		color: black;
		font-size: 14px;
		font-weight: 400;
		padding: 4px 8px;
		border-radius: 4px;
		opacity: 0;
		pointer-events: none;
		transition: opacity 0.2s ease;
	}

	#indicator > div:hover::after {
		opacity: 1;
	}

	.scroll-line-agmt img,
	.scroll-line-rect img,
	.scroll-line-reason img,
	.scroll-line-dendr img,
	.scroll-line-time img,
	.scroll-line-stage img,
	.scroll-line-research img,
	.scroll-line-geo img {
		height: 25px;
		padding: 3px;
		cursor: pointer;
		opacity: 0.5;
		transition: transform 0.2s ease;
	}

	.scroll-line-agmt img:hover,
	.scroll-line-rect img:hover,
	.scroll-line-reason img:hover,
	.scroll-line-dendr img:hover,
	.scroll-line-time img:hover,
	.scroll-line-stage img:hover,
	.scroll-line-research img:hover,
	.scroll-line-geo img:hover {
		transform: scale(1.2);
	}

	.filler {
		text-align: center;
		padding: 5%;
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
		background-color: white;
		display: flex;
		justify-content: center;
		z-index: 100;
	}

	#loading_text {
		position: absolute;
		top: 40%;
		color: black;
		margin: 0px;
		font-weight: 300;
		font-size: 20px;
	}

	#loading_button {
		font-family: "Montserrat";
		box-shadow: rgba(0, 0, 0, 0.35) 0px 1px 5px;
		font-size: 16px;
		font-weight: 400;
		position: absolute;
		top: 40%;
		background-color: white;
		color: black;
		border: 1px solid rgb(199, 199, 199);
		border-radius: 5px;
		padding: 15px 15px;
		cursor: pointer;
		transition:
			background-color 0.2s ease,
			color 0.2s ease;
		visibility: hidden;
	}

	#loading_button:hover {
		background-color: rgb(44, 44, 44);
		color: white;
	}

	.rect,
	.time,
	.area,
	.map,
	.stage,
	.afgh {
		margin-top: 40px;
		width: calc(100% - 5px);
	}

	#icons {
		margin: 100px;
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		color: black;
		box-sizing: border-box; /* include padding/margin in width calculations */
	}

	.icon-item {
		flex: 1 1 calc(33.33% - 10px); /* 3 per row on large screens */
		margin: 5px;
		text-align: center;
		padding: 50px 20px; /* shorthand: top/bottom 50px, left/right 20px */
		box-sizing: border-box; /* important! */
		box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
	}

	/* Small screens */
	@media (max-width: 768px) {
		#icons {
			justify-content: center; /* center the stacked items */
		}

		.icon-item {
			flex: 0 0 100%; /* take full width */
			max-width: 100%; /* ensure no extra width */
			margin: 10px 0; /* vertical spacing between items */
		}
	}

	#text_field {
		width: 50%;
		margin: auto;
		color: black;
	}

	.fa-info {
		font-size: 24px;
	}

	.info {
		border: none;
		background-color: white;
		color: black;
		text-align: center;
		text-decoration: none;
		display: inline-block;
		position: absolute;
		top: 10px;
		right: 0px;
		cursor: pointer;
		transition: transform 0.1s ease-in-out;
	}

	.info:hover {
		transform: scale(1.4);
	}

	.info_div {
		position: absolute;
		box-shadow: rgba(0, 0, 0, 0.35) 0px 1px 5px;
		width: 250px;
		top: -100%;
		right: 40px;
		font-size: 12px;
		text-align: left;
		background-color: white;
		color: black;
		padding: 20px;
	}

	#research_field {
		padding-top: 40px;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 5px;
	}

	.research_item {
		flex: 0 1 18%;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
	}

	.research_item img {
		width: 179px;
		height: 250px;
		object-fit: contain;
		display: block;
		border-radius: 4px;
		box-shadow: rgba(0, 0, 0, 0.35) 0px 1px 5px;
		transition: transform 0.1s ease-in-out;
	}

	.research_item img:hover {
		transform: scale(1.1);
	}

	.research_item p {
		color: black;
		margin-top: 15px;
		padding: 5px;
		font-size: 12px;
	}

	/* Medium screens: fewer per row */
	@media (max-width: 992px) {
		.research_item {
			flex: 0 1 30%;
		}
	}

	/* Small screens: stack vertically */
	@media (max-width: 600px) {
		.research_item {
			flex: 0 1 80%;
		}
	}

	.scroll-down-icon {
		height: 20px;
		animation: bounce 1.5s infinite ease-in-out;
	}

	@keyframes bounce {
		0%,
		100% {
			transform: translateY(0); /* start + end at original position */
		}
		50% {
			transform: translateY(7px); /* move down */
		}
	}

	.rotated {
		display: inline-block; /* needed so transform applies properly */
		transform: rotate(-45deg);
		font-size: 12px;
		font-weight: 800;
	}
</style>
