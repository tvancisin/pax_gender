<script>
	import { themes } from "../config.js";
	import { getContext } from "svelte";

	export let theme = getContext("theme");
	export let filled = false;
	export let center = true;
</script>

<nav
	style="border-bottom-color: {themes[theme]['muted']}; {filled
		? 'background-color: ' + themes[theme]['background'] + ';'
		: ''}"
>
	<div class="col-wide middle" style="margin-left:0px" class:center>
		<a
			href="https://pax.peaceagreements.org/agreements/wggsearch"
			target="_blank"
		>
			<picture>
				<img
					src="./img/logo.png"
					alt="Office for National Statistics"
				/>
			</picture>
		</a>
	</div>
</nav>

<style>
	nav {
		-webkit-box-sizing: border-box;
		box-sizing: border-box;
		position: relative;
		height: 46px;
		margin-bottom: -46px;
		z-index: 1;
	}
	picture {
		position: relative;
		top: 3px;
		padding: 0 5px;
	}
	img {
		height: 45px;
	}
	a img:hover {
		cursor: pointer;
	}
</style>
