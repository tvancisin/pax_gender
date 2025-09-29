<script>
    import * as d3 from "d3";
    import { hierarchy } from "../utils";
    import Circle from "./Circle.svelte";
    import Select from "svelte-select";

    export let pax_gender;
    export let step;
    export let categories;

    let width = 400;
    let height = 400;
    let root;
    let linksGenerator;
    let radius = 100;
    let tree = [];
    let agt_list = [];
    let currentUrl;

    function countOccurrences(data, hierarchy) {
        data.forEach((obj) => {
            hierarchy.children.forEach((category) => {
                if (obj[category.key] === "1") {
                    category.count = (category.count || 0) + 1;
                    category.agtIds = category.agtIds || [];
                    category.agtIds.push(obj.AgtId);
                }
                category.children.forEach((subcategory) => {
                    if (obj[subcategory.key] === "1") {
                        subcategory.count = (subcategory.count || 0) + 1;
                        subcategory.agtIds = subcategory.agtIds || [];
                        subcategory.agtIds.push(obj.AgtId);
                    }
                });
            });
        });
    }

    function getWggAttributesByAgtId(dataArray, agtId) {
        // Find the object with the matching AgtId
        const agreement = dataArray.find((item) => item.AgtId === agtId);

        if (!agreement) {
            return []; // or throw an error / return null if preferred
        }

        // Collect keys that start with 'Wgg' and have value "1"
        const wggAttributes = Object.entries(agreement)
            .filter(([key, value]) => key.startsWith("Wgg") && value === "1")
            .map(([key]) => key);

        wggAttributes.push("undefined");

        return wggAttributes;
    }

    $: if (pax_gender) {
        let updatedTree = JSON.parse(JSON.stringify(hierarchy)); // Create a fresh copy
        countOccurrences(pax_gender, updatedTree);
        tree = updatedTree; // Assign the new reference to trigger reactivity
        agt_list = pax_gender.map((d) => ({
            Agt: d.Agt,
            AgtId: d.AgtId,
            Con: d.Con,
        }));
    }

    $: if (width < height) {
        radius = width; // Use width as the radius if it's larger
    } else {
        radius = height; // Use height as the radius if it's larger
    }

    $: if (height || (width && tree)) {
        let cluster = d3.cluster().size([360, radius / 3]); // 360 means whole circle, radius - 60 means margin around dendrogram

        // Create hierarchy and apply cluster layout
        root = d3.hierarchy(tree, (d) => {
            return d.children;
        });
        cluster(root); // Perform the clustering algorithm

        linksGenerator = d3
            .linkRadial()
            .angle(function (d) {
                return (d.x / 180) * Math.PI;
            })
            .radius(function (d) {
                return d.y;
            });
    }

    function updateTree(agt) {
        d3.select("#select_agt").style("visibility", "visible");
        currentUrl = `https://www.peaceagreements.org/agreements/wgg/${agt}`;

        let split = pax_gender.filter((d) => d.AgtId == agt);
        let updatedTree = JSON.parse(JSON.stringify(hierarchy)); // Create a fresh copy
        countOccurrences(split, updatedTree);
        tree = updatedTree; // Assign the new reference to trigger reactivity

        d3.selectAll("path.link").style("stroke", "#d9d9d9");
        d3.selectAll("text").style("fill", "#d9d9d9");
        const highlightedWggKeys = getWggAttributesByAgtId(pax_gender, agt);
        highlightedWggKeys.forEach((key) => {
            d3.selectAll("path." + key).style("stroke", "black");
            d3.selectAll("text." + key).style("fill", "black");
        });
    }

    $: if (step == "afgh01") {
        d3.select("#select_agt").style("visibility", "hidden");
        let updatedTree = JSON.parse(JSON.stringify(hierarchy)); // Create a fresh copy
        countOccurrences(pax_gender, updatedTree);
        tree = updatedTree; // Assign the new reference to trigger reactivity
        d3.selectAll("path.link").style("stroke", "#808080");
        d3.selectAll("text").style("fill", "black");
    } else if (step == "afgh02") {
        updateTree("589");
    } else if (step == "afgh03") {
        updateTree("1845");
    } else if (step == "afgh03") {
    }

    let selectedAgt = "";

    $: options = agt_list.map((d) => ({
        label: d.Agt,
        value: d.AgtId,
        group: d.Con,
    }));

    const groupBy = (item) => item.group;

    function handleSelect(event) {
        const value = event.detail.value;
        // highlight selected
        updateTree(value);
    }

    function openAgreement() {
        if (currentUrl) {
            window.open(currentUrl, "_blank");
        } else {
            alert("No agreement selected yet");
        }
    }
</script>

<div class="wrapper" bind:clientWidth={width} bind:clientHeight={height}>
    <Select
        class="selector"
        items={options}
        {groupBy}
        bind:value={selectedAgt}
        on:select={handleSelect}
        --width="250px"
        --border-radius="3px"
        --placeholder-color="white"
        --background="#333333"
        --list-background="white"
        --item-color="black"
        --border="1px solid #999999"
        --multi-item-color="black"
        --item-hover-bg="gray"
        --font-size="14px"
        --font-weight="300"
        placeholder="Select agreement..."
    />
    <button id="select_agt" on:click={openAgreement}> See Agreement </button>
    {#if root}
        <svg {width} {height}>
            <g transform="translate({width / 2}, {height / 2})">
                <!-- Render Links between nodes -->
                {#each root.links() as link}
                    <path
                        d={linksGenerator(link)}
                        class="link {link.target.data.key}"
                    ></path>
                {/each}

                <!-- Render Nodes (circles) -->
                {#each root.descendants() as node}
                    <Circle {node} {categories} />
                {/each}
            </g>
        </svg>
    {/if}
</div>

<style>
    .wrapper {
        height: 90vh;
        position: relative;
    }

    :global(.selector) {
        position: absolute !important;
        top: 0px;
        right: 5px;
    }

    :global(.svelte-select-list) {
        width: 500px !important;
    }

    path {
        fill: none;
        stroke: #808080;
        stroke-width: 1;
    }

    #select_agt {
        position: absolute;
        top: 0px;
        right: 257px;
        height: 42px;
        visibility: hidden;
        cursor: pointer;
        font-family: "Montserrat";
        font-weight: 500;
    }
</style>
