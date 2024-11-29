<script>
    import { tweened } from "svelte/motion";
    import { cubicOut } from "svelte/easing";
    import { createEventDispatcher } from "svelte"; // Import the dispatcher

    export let x;
    export let y;
    export let width;
    export let height;
    export let info;

</script>

<g transform="translate({x} {y})">
    <rect
        x="0"
        y="0"
        width={width}
        height={height}
        rx="1"
        fill="#F6F1D6"
        stroke="gray"
    />
</g>

<style>
    rect {
        fill: rgb(0, 0, 0);
        /* transition: fill 0.3s cubic-bezier(0.25, 0.1, 0.25, 1); Smooth transition */
    }

</style>
