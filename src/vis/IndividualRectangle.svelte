<script>
    import { tweened } from "svelte/motion";
    import { cubicOut } from "svelte/easing";
    import * as d3 from "d3";

    export let x;
    export let y;
    export let rect;
    export let step;

    $: if (step == "rect_one") {
        d3.selectAll(".gen_agt").style("opacity", 1);
    } else if (step == "rect_two") {
        d3.selectAll(".gen_agt").style("opacity", 0.05);
        d3.selectAll(".quot").style("opacity", 1);
    }

    // else if (step == "three") {
    //     d3.selectAll(".agt").style("stroke", "#e6e6e6");
    //     d3.selectAll(".quotas").style("stroke", "black");
    // } else if (step == "four") {
    //     d3.selectAll(".agt").style("stroke", "#e6e6e6");
    //     d3.selectAll(".inter_law").style("stroke", "black");
    // } else if (step == "five") {
    //     d3.selectAll(".agt").style("stroke", "#e6e6e6");
    //     d3.selectAll(".un").style("stroke", "black");
    // }

    const tX = tweened(null, { duration: 1200, easing: cubicOut });
    const tY = tweened(null, { duration: 1200, easing: cubicOut });

    $: tX.set(x);
    $: tY.set(y);

    //Construct the class string
    function assign_class(item) {
        console.log(item);

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

<g transform="translate({$tX} {$tY})" class={assign_class(rect)}>
    <rect
        width={rect.width}
        height={rect.height}
        fill="#d9d9d9"
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
