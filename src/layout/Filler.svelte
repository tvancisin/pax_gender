<script>
	export let center = true;
	export let wide = false;
	export let short = false;
	export let shadow;

	let shadow_css = ``;
	if (shadow) {
		shadow_css = `box-shadow: 0 10px 10px -8px rgba(50, 50, 50, 1)`;
	}
</script>

<section>
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
		margin: 50px;
	}
</style>
