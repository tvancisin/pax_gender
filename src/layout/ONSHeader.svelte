<script>
	import { themes } from "../config.js";
	import { getContext } from "svelte";

	export let theme = getContext("theme");
	export let filled = true;
	export let center = true;
</script>

<nav
	style="border-bottom-color: {themes[theme]['muted']}; {filled
		? 'background-color: ' + themes[theme]['background'] + ';'
		: ''}"
>
	<div
		class="col-wide"
		style="margin-left:0px; margin-top:0px"
		class:center
	></div>
</nav>

<style>
	nav {
		-webkit-box-sizing: border-box;
		box-sizing: border-box;
		position: relative;
		height: 50px;
		z-index: 1;
		margin-bottom: -50px;
	}
</style>
