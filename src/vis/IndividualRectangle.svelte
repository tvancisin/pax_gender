<script>
    import * as d3 from "d3";
    import { tweened } from "svelte/motion";
    import { cubicOut } from "svelte/easing";
    import { createEventDispatcher } from "svelte"; // Import the dispatcher

    export let x;
    export let y;
    export let id;
    export let width;
    export let height;
    export let info;
    // export let step;
    export let i;

    // $: if (step == "5") {
    //     d3.select("#id685").style("fill", "blue");
    // }

    const dispatch = createEventDispatcher();

    // Define position tween parameters with staggered delay
    const positionTweenParams = {
        delay: (i / 4) * Math.random(), // Delay increases with index
        duration: 300,
        easing: cubicOut,
    };

    const tX = tweened(null, positionTweenParams);
    const tY = tweened(null, positionTweenParams);
    const tWidth = tweened(null, { duration: 300, easing: cubicOut });
    const tHeight = tweened(null, positionTweenParams);

    // Update position tweens after size animation completes
    $: tX.set(x);
    $: tY.set(y);
    $: tWidth.set(width);
    $: tHeight.set(height);

    // Hover state for adding a class
    let isHovered = false;

    const handleMouseEnter = () => {
        isHovered = true;
        // Dispatch the custom event with necessary data
        dispatch("hover", { x, y, info });
    };

    const handleMouseLeave = () => {
        setTimeout(() => {
            isHovered = false;
        }, 0); // Delay before transitioning back
        // Dispatch the custom event to clear the tooltip
        dispatch("leave");
    };
</script>

<g transform="translate({$tX} {$tY})">
    <rect
        id= {"id_"+ id}
        x="0"
        y="0"
        width={$tWidth}
        height={$tHeight}
        rx="1"
        fill="#F6F1D6"
        stroke="gray"
        stroke-width="0.5"
        class:is-hovered={isHovered}
        on:mouseenter={handleMouseEnter}
        on:mouseleave={handleMouseLeave}
    />
</g>

<style>
    rect {
        fill: #f6f1d6;
        /* transition: fill 0.3s cubic-bezier(0.25, 0.1, 0.25, 1); */
    }

    :global(rect#id_589) {
        fill: steelblue;
    }

    /* rect.is-hovered {
        fill: blue;
    } */
</style>
