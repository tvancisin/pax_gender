<script>
    import { tweened } from "svelte/motion";
    import { cubicOut } from "svelte/easing";

    export let x;
    export let y;
    export let width;
    export let height;
    export let i;

    const tweenParams = {
        delay: 300 + i * 1,
        duration: 250,
        easing: cubicOut,
    };

    const tX = tweened(null, tweenParams);
    const tY = tweened(null, { duration: 300, easing: cubicOut });
    const tH = tweened(null, { duration: 300, easing: cubicOut });

    $: tX.set(x);
    $: tY.set(y);
    $: tH.set(height);
</script>

<g transform="translate({$tX} {$tY})">
    <rect x="0" y="0" {width} height={$tH} />
</g>
