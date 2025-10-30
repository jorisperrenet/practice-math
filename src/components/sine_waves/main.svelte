<script lang="ts">
  const githubLink = "https://github.com/jorisperrenet/practice-math";
  import { onMount } from 'svelte';

  import { page } from "$app/stores";
  import { goto } from "$app/navigation";

	import { mathjax } from 'mathjax-full/js/mathjax';
	import { TeX } from 'mathjax-full/js/input/tex';
	import { SVG } from 'mathjax-full/js/output/svg';
	import { liteAdaptor } from 'mathjax-full/js/adaptors/liteAdaptor';
	import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html';

	const svgOptions={ fontCache: 'local' };
	const convertOptions={ display: true };
  const texOptions={ packages: ['base', 'ams'] };

	const adaptor = liteAdaptor();
	RegisterHTMLHandler(adaptor);

	const mathjaxSVGDocument = mathjax.document('', {
		InputJax: new TeX(texOptions),
		OutputJax: new SVG(svgOptions)
	});

	function getMathjaxSVG(tex: string): string {
		const node = mathjaxSVGDocument.convert(tex, convertOptions);
		return adaptor.innerHTML(node);
	}

    let x = getMathjaxSVG("f(x) = 3");

    let show = 0;
    function show_new() {
        show += 1;
    }

    let a = 0;
    let b = -2;
    let c = 1;
    let c_pi = false;
    let d = -1;
    let sin = true;
    let amplitude = a;
    let evenwicht = b;
    let periode = String.raw`\frac{2\pi}{c}`;
    let beginpunt = String.raw`\frac{2\pi}{c}`;
    function generate_new() {
        show = 0;
        sin = (Math.random()*3 > 1)
        c_pi = (Math.random()*5 < 1)
        a = Math.floor(Math.random()*7) - 3;
        b = Math.floor(Math.random()*9) - 4;
        c = Math.floor(Math.random()*3);
        d = Math.floor(Math.random()*6) - 3;
        if (a == 0) { a = 1 };
        if (c == 0 || c == -1) { c = 1 };
        if (b == 0) { b = 1 };

        let txt = sin ? String.raw`\sin` : String.raw`\cos`;
        let am = (a > 0) ? "+" + a : a;
        if (a == 1) { am = "+" };
        if (a == -1) { am = "-" };
        let dd = (d < 0) ? "+" + -d : -d;
        let pi = c_pi ? String.raw`\pi ` : String.raw``;

        amplitude = getMathjaxSVG(a.toString());
        evenwicht = getMathjaxSVG(b.toString());
        if (c == 1 && c_pi) {
            periode = getMathjaxSVG(String.raw`\frac{2\pi}{` + pi + "} = 2");
        } else if (c == 1 && c_pi == false) {
            periode = getMathjaxSVG(String.raw`\frac{2\pi}{` + 1 + String.raw`} = 2\pi`);
        } else if (c == 2 && c_pi) {
            periode = getMathjaxSVG(String.raw`\frac{2\pi}{` + c + pi + "} = 1");
        } else if (c == 2 && c_pi == false) {
            periode = getMathjaxSVG(String.raw`\frac{2\pi}{` + c + pi + String.raw`} = \pi`);
        } else if (c == -2 && c_pi) {
            periode = getMathjaxSVG(String.raw`\frac{2\pi}{` + c + pi + "} = -1");
        } else if (c == -2 && c_pi == false) {
            periode = getMathjaxSVG(String.raw`\frac{2\pi}{` + c + pi + String.raw`} = -\pi`);
        } else if (c == -3 && c_pi) {
            periode = getMathjaxSVG(String.raw`\frac{2\pi}{` + c + pi + String.raw`} = -\frac{2}{3}`);
        } else if (c == -3 && c_pi == false) {
            periode = getMathjaxSVG(String.raw`\frac{2\pi}{` + c + pi + String.raw`} = -\frac{2}{3} \pi`);
        } else {
            periode = getMathjaxSVG(String.raw`\frac{2\pi}{` + c + pi + "}");
        }

        if (sin) {
            beginpunt = getMathjaxSVG(String.raw`(` + d + "," + b + String.raw`)`);
        } else {
            let p = a+b;
            beginpunt = getMathjaxSVG(String.raw`(` + d + "," + p + String.raw`)`);
        }

        if (d == 0) {
            if (c == 1) {
                x = getMathjaxSVG("f(x) = " + b + am + txt + "("+ pi + "x)");
            } else {
                x = getMathjaxSVG("f(x) = " + b + am + txt + "("+ c + pi + "x)");
            }
        } else {
            if (c == 1) {
                if (c_pi == false) {
                    x = getMathjaxSVG("f(x) = " + b + am + txt + "(x" + dd + ")");
                } else {
                    x = getMathjaxSVG("f(x) = " + b + am + txt + "("+ pi + "(x" + dd + "))");
                }
            } else {
                x = getMathjaxSVG("f(x) = " + b + am + txt + "("+ c + pi + "(x" + dd + "))");
            }
        }
    }

    generate_new()


  let urlParams = new URLSearchParams($page.url.searchParams.toString());
  const is_lang_set = urlParams.has('lang');
  if (!is_lang_set) {
    urlParams.set('lang', 'en');
    goto(`?${urlParams.toString()}`);
  }
  let language = "";
  let other_language = "";
  let sp = "";
  // console.log(urlParams.get('lang'));
  if (urlParams.get('lang') == 'nl') {
    language = "NED";
    other_language = "English";
    sp = "Oefen met sinusoïden!";
  } else {
    language = "ENG";
    other_language = "Dutch";
    sp = "Practice your sine waves!";
  }

  function set_settings() {
    for (var value in settings) {
      if (value == "show_derivative") { continue }
      document.getElementById(value).checked = settings[value];
    }
  }
  onMount(() => {
    set_settings()
	});

  function toggle_language() {
    if (language == "NED") {
      urlParams.set('lang', 'en');
      goto(`?${urlParams.toString()}`);
      language = "ENG"
      other_language = "Dutch"
      sp = "Practice your sine waves!";
    } else {
      urlParams.set('lang', 'nl');
      goto(`?${urlParams.toString()}`);
      language = "NED"
      other_language = "English"
      sp = "Oefen met sinusoïden!";
    }
    folds = do_derivative(formula);
  }

  function toggle_value(value) {
    settings[value] = !settings[value];
    if (value != "show_derivative") {
      document.getElementById(value).checked = settings[value];
    }
    console.log(value, "set to", settings[value])
    if (value != "show_derivative") {
      formula = generate_formula(depth, true, "");
    }
  }
</script>

<header class="-mt-10 pt-0">
  <div class="mx-auto flex h-6 pb-2 max-w-screen-xl items-center gap-8 px-4">
    <div class="flex flex-1 items-center justify-end justify-between">
      <div class="flex items-center gap-4">
        <button class="btn btn-soft btn-primary justify-right" on:click={() => toggle_language()}><p>Convert to {other_language}</p></button>
      </div>
      <a
        aria-label="Github"
        target="_blank"
        href={githubLink}
        rel="noopener"
        class="hover:text-gray-600 justify-right"
        ><svg
          width="20"
          height="20"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
          class="h-10 w-10 fill-current md:h-12 md:w-12"
          ><path
            d="M256,32C132.3,32,32,134.9,32,261.7c0,101.5,64.2,187.5,153.2,217.9a17.56,17.56,0,0,0,3.8.4c8.3,0,11.5-6.1,11.5-11.4,0-5.5-.2-19.9-.3-39.1a102.4,102.4,0,0,1-22.6,2.7c-43.1,0-52.9-33.5-52.9-33.5-10.2-26.5-24.9-33.6-24.9-33.6-19.5-13.7-.1-14.1,1.4-14.1h.1c22.5,2,34.3,23.8,34.3,23.8,11.2,19.6,26.2,25.1,39.6,25.1a63,63,0,0,0,25.6-6c2-14.8,7.8-24.9,14.2-30.7-49.7-5.8-102-25.5-102-113.5,0-25.1,8.7-45.6,23-61.6-2.3-5.8-10-29.2,2.2-60.8a18.64,18.64,0,0,1,5-.5c8.1,0,26.4,3.1,56.6,24.1a208.21,208.21,0,0,1,112.2,0c30.2-21,48.5-24.1,56.6-24.1a18.64,18.64,0,0,1,5,.5c12.2,31.6,4.5,55,2.2,60.8,14.3,16.1,23,36.6,23,61.6,0,88.2-52.4,107.6-102.3,113.3,8,7.1,15.2,21.1,15.2,42.5,0,30.7-.3,55.5-.3,63,0,5.4,3.1,11.5,11.4,11.5a19.35,19.35,0,0,0,4-.4C415.9,449.2,480,363.1,480,261.7,480,134.9,379.7,32,256,32Z"
          /></svg
        ></a
      >
    </div>
  </div>
</header>

<h1 class="mx-auto text-4xl font-bold my-2 text-center">{sp}</h1>

<div class="mx-auto flex flex-col justify-items-center max-w-screen-xl">
  <div>
      <button class="btn btn-primary" on:click={() => generate_new()}><p>{(language == "ENG") ? "Generate" : "Genereer"}</p></button>
      <button class="btn btn-soft" on:click={() => show_new()}><p>{(language == "ENG") ? "Show answer" : "Laat antwoord zien"}</p></button>
  </div>

  <div class="mt-20 mx-auto">
      {@html x}
  </div>

  <table class="text-light mt-10 mx-auto">
    <tbody>
        <tr>
            <th class="border-2 font-normal">Amplitude</th>
            <th class="border-2 px-2 font-normal">{@html (show > 0) ? amplitude : "..."}</th>
        </tr>
    </tbody>
    <tbody>
        <tr>
            <th class="border-2 px-2 font-normal">Evenwichtsstand</th>
            <th class="border-2 px-2 font-normal">{@html (show > 1) ? evenwicht : "..."}</th>
        </tr>
    </tbody>
    <tbody>
        <tr>
            <th class="border-2 font-normal">Periode</th>
            <th class="border-2 p-2 font-normal">{@html (show > 2) ? periode : "..."}</th>
        </tr>
    </tbody>
    <tbody>
        <tr>
            <th class="border-2 font-normal">Beginpunt</th>
            <th class="border-2 p-1 px-2 font-normal">{@html (show > 3) ? beginpunt : "..."}</th>
        </tr>
    </tbody>
  </table>
</div>

<!-- <div class="w-full max-w-screen-xl mx-auto mt-20"> -->
<!--   {#if language == "ENG"} -->
<!--     <h2 class="mx-auto text-2xl font-bold my-2">Information</h2> -->
<!--     <li>This tool can't simplify functions, but you can! Every once in a while, you can try to simplify the function before taking the derivative. If all is well, you will get a (simplified) version of the derivative denoted here.</li> -->
<!--     <li>Click on the function to see the last rule that was applied (recursively).</li> -->
<!--     <li>[Square brackets] are used for the chain rule (specifically, the derivative of the inner part).</li> -->
<!--     <li>{`{`}Curly brackets{`}`} are used for the product rule (specifically, the derivatives of the functions).</li> -->
<!--   {/if} -->
<!--   {#if language == "NED"} -->
<!--     <h2 class="mx-auto text-2xl font-bold my-2">Informatie</h2> -->
<!--     <li>Deze tool kan geen functies vereenvoudigen, maar jij wel! Het is leerzaam om te proberen de functie eerste te herleiden, om hem vervolgens te differentiëren. Als het goed is, kom je op een (vereenvoudigde) versie uit van de afgeleide die hier staat.</li> -->
<!--     <li>Klik op de functie om de laatst gebruikte regel te zien (recursief).</li> -->
<!--     <li>[Vierkante haakjes] worden gebruikt voor de kettingregel (voor de afgeleide van de binnenste functie).</li> -->
<!--     <li>{`{`}Accolades{`}`} worden gebruikt voor de productregel (voor de afgeleides van de functies).</li> -->
<!--   {/if} -->
<!-- </div> -->

<style>
</style>

<svelte:head>
  <title>{(language == "ENG") ? "Sine Waves" : "Sinusoïden"}</title>
</svelte:head>

