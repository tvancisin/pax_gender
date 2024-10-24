<script>
	import { themes } from "../config.js";
	import { getContext } from "svelte";

	export let theme = getContext("theme");
	export let center = true;
	export let wide = false;
	export let short = false;
	export let shadow;

	let shadow_css = ``;
	if (shadow) {
		shadow_css = `box-shadow: inset 0 10px 10px -8px rgba(0, 0, 0, 1)`;
	}
</script>

<section
	style="color: {themes[theme]['text']}; {shadow_css}; background-color: {themes[theme][
		'background'
	]};"
>
	<div
		class="middle"
		class:center
		class:col-medium={!wide}
		class:col-wide={wide}
		class:height-full={!short}
		class:short
	>
		<slot></slot>
	</div>
</section>

<style>
	section {
		padding: 36px 0;
	}
	.short {
		min-height: 70vh;
	}
</style>
