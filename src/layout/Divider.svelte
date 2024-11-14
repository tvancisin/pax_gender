<script>
	import { themes } from '../config.js';
	import { getContext } from 'svelte';

  export let theme = getContext('theme');
  export let hr = true;
  export let shadow;

  let shadow_css = ``;
	if (shadow) {
		shadow_css = `background-color: #808080`;
	}

</script>

<section style="color: {themes[theme]['text']}; {shadow_css};">
	<div class="col-medium" style={shadow_css}>
    <hr style="color: {themes[theme]}"/>
	</div>
</section>

<style>
  hr {
    width: 100px;
    color: white;
    border: none;
    border-top: 2px solid;
    /* margin: 40px auto -10px auto; */
  }
</style>

