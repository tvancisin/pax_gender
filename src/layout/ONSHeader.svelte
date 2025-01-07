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
	<div class="col-wide" style="margin-left:0px; margin-top:0px" class:center>
		<a
			href="https://pax.peaceagreements.org/agreements/wggsearch"
			target="_blank"
		>
			<img src="./img/logo.png" alt="PA-X Gender Logo" />
		</a>
		<img
			class="peace_logo"
			src="./img/PeaceRep_white.jpg"
			alt="PeaceRep Logo"
		/>
	</div>
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

	img {
		height: 40px;
	}

	a img:hover {
		cursor: pointer;
	}

	.peace_logo {
		position: absolute;
		right: 5px;
		top: 3px;
	}
</style>
