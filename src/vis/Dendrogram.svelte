<script>
    import * as d3 from "d3";
    import { hierarchy } from "../utils";
    import Circle from "./Circle.svelte";

    export let pax_gender;
    export let step;

    let width = 400;
    let height = 400;
    let root;
    let linksGenerator;
    let tree = [];

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

    $: if (pax_gender) {
        let updatedTree = JSON.parse(JSON.stringify(hierarchy)); // Create a fresh copy
        countOccurrences(pax_gender, updatedTree);
        tree = updatedTree; // Assign the new reference to trigger reactivity
    }

    $: radius = height; // Radius of the radial chart

    $: if (height && tree) {
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

    // $: scaleRadius = d3.scaleLinear().domain([2, 200]).range([3, 25]);

    $: if (step == "afgh01") {
        console.log("step1");
        let updatedTree = JSON.parse(JSON.stringify(hierarchy)); // Create a fresh copy
        countOccurrences(pax_gender, updatedTree);
        tree = updatedTree; // Assign the new reference to trigger reactivity
        
        d3.selectAll("path").style("stroke", "white");

        // d3.selectAll(".WggPast").style("stroke", "rgb(74, 74, 74)");
        // d3.selectAll(".WggTraJus").style("stroke", "rgb(74, 74, 74)");
        // d3.selectAll(".WggDev").style("stroke", "rgb(74, 74, 74)");
        // d3.selectAll(".WggRehab").style("stroke", "rgb(74, 74, 74)");
        // d3.selectAll(".WggImpl").style("stroke", "rgb(74, 74, 74)");
        // d3.selectAll(".WggImplOth").style("stroke", "rgb(74, 74, 74)");
    } else if (step == "afgh02") {
        console.log("step2");
        function splitArray(arr) {
            let mid = Math.ceil(arr.length / 2); // Get the middle index
            let firstHalf = arr.slice(0, 1); // First half
            return firstHalf;
        }
        let split = splitArray(pax_gender);
        

        let updatedTree = JSON.parse(JSON.stringify(hierarchy)); // Create a fresh copy
        countOccurrences(split, updatedTree);
        tree = updatedTree; // Assign the new reference to trigger reactivity

        d3.selectAll("path").style("stroke", "rgb(74, 74, 74)");
        d3.selectAll(".WggPast").style("stroke", "white");
        d3.selectAll(".WggTraJus").style("stroke", "white");
        d3.selectAll(".WggDev").style("stroke", "white");
        d3.selectAll(".WggRehab").style("stroke", "white");
        d3.selectAll(".WggImpl").style("stroke", "white");
        d3.selectAll(".WggImplOth").style("stroke", "white");

        // d3.selectAll(".WggDdr").style("stroke", "rgb(74, 74, 74)");
        // d3.selectAll(".WggInstRef").style("stroke", "rgb(74, 74, 74)");
        // d3.selectAll(".WggEq").style("stroke", "rgb(74, 74, 74)");
        // d3.selectAll(".WggSocEq").style("stroke", "rgb(74, 74, 74)");
    } else if (step == "afgh03") {
        console.log("step3");
        function splitArray(arr) {
            let mid = Math.ceil(arr.length / 2); // Get the middle index
            let firstHalf = arr.slice(1, 2); // First half
            return firstHalf;
        }
        let split = splitArray(pax_gender);
        

        let updatedTree = JSON.parse(JSON.stringify(hierarchy)); // Create a fresh copy
        countOccurrences(split, updatedTree);
        tree = updatedTree; // Assign the new reference to trigger reactivity

        d3.selectAll(".WggDev").style("stroke", "rgb(74, 74, 74)");
        d3.selectAll(".WggRehab").style("stroke", "rgb(74, 74, 74)");
        d3.selectAll(".WggImpl").style("stroke", "rgb(74, 74, 74)");
        d3.selectAll(".WggImplOth").style("stroke", "rgb(74, 74, 74)");

        d3.selectAll(".WggDdr").style("stroke", "white");
        d3.selectAll(".WggInstRef").style("stroke", "white");
        d3.selectAll(".WggEq").style("stroke", "white");
        d3.selectAll(".WggSocEq").style("stroke", "white");
    }

    $: console.log(tree);
</script>

<div class="wrapper" bind:clientWidth={width} bind:clientHeight={height}>
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
                    <Circle {node} />
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

    path {
        fill: none;
        stroke: rgb(74, 74, 74);
    }
</style>
