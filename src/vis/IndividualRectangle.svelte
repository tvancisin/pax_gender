<script>
    import { tweened } from "svelte/motion";
    import { cubicOut } from "svelte/easing";
    import * as d3 from "d3";

    export let x;
    export let y;
    export let rect;
    export let step;

    // $: if (step == "rect_one") {
    //     d3.selectAll(".gen_agt").style("opacity", 1);
    // } else if (step == "rect_two") {
    //     d3.selectAll(".gen_agt").style("opacity", 0.03);
    //     d3.selectAll(".quot").style("opacity", 1);
    // } else if (step == "rect_three") {
    //     d3.selectAll(".gen_agt").style("opacity", 0.03);
    //     d3.selectAll(".law").style("opacity", 1);
    // } else if (step == "rect_four") {
    //     d3.selectAll(".gen_agt").style("opacity", 0.03);
    //     d3.selectAll(".un").style("opacity", 1);
    // }

    // const tX = tweened(null, { duration: 1200, easing: cubicOut });
    // const tY = tweened(null, { duration: 1200, easing: cubicOut });

    // $: tX.set(x);
    // $: tY.set(y);

    //Construct the class string
    function assign_class(item) {
        let classes = ["gen_agt"];
        if (item.quotas === "1") {
            classes.push("quot");
        }
        if (item.int_law === "1") {
            classes.push("law");
        }
        if (item.unsc === "1") {
            classes.push("un");
        }
        return classes.join(" ");
    }

 
</script>

<g transform="translate({x} {y})" class={assign_class(rect)}>
    <rect
        width={rect.width}
        height={rect.height}
        fill="white"
        stroke="none"
        stroke-width="1"
    />
    <rect
        y={rect.height - rect.wHeight}
        width={rect.width}
        height={rect.wHeight}
        fill="black"
    />
</g>

<style>
    .gen_agt {
        -webkit-filter: drop-shadow(0px 0px 4px rgba(155, 155, 155, 0.7));
        filter: drop-shadow(0px 0px 4px rgba(155, 155, 155, 0.7));
    }
</style>
