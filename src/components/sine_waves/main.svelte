<script lang="ts">
	import { onMount } from 'svelte';
	import { mathjax } from 'mathjax-full/js/mathjax';
	import { TeX } from 'mathjax-full/js/input/tex';
	import { SVG } from 'mathjax-full/js/output/svg';
	import { liteAdaptor } from 'mathjax-full/js/adaptors/liteAdaptor';
	import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html';

	const adaptor = liteAdaptor();
	RegisterHTMLHandler(adaptor);

	const mathjaxDocument = mathjax.document('', {
		InputJax: new TeX({ packages: ['base', 'ams'] }),
		OutputJax: new SVG({ fontCache: 'local' })
	});

	function mathSvg(tex: string): string {
		return adaptor.innerHTML(mathjaxDocument.convert(tex, { display: true }));
	}

	type Exercise = {
		coefficient: number;
		midline: number;
		frequency: number;
		frequencyIncludesPi: boolean;
		shift: number;
		trig: 'sin' | 'cos';
	};

	const translations = {
		en: {
			title: 'Practice sine waves',
			introduction: 'Find the amplitude, midline, period and a convenient reference point from each equation.',
			newExercise: 'New exercise',
			revealNext: 'Reveal next answer',
			allShown: 'All answers shown',
			equation: 'Equation',
			notRevealed: 'Not revealed',
			answers: ['Amplitude', 'Midline', 'Period', 'Reference point']
		},
		nl: {
			title: 'Oefen met sinusoïden',
			introduction: 'Bepaal de amplitude, evenwichtsstand, periode en een handig referentiepunt van iedere formule.',
			newExercise: 'Nieuwe opgave',
			revealNext: 'Toon volgend antwoord',
			allShown: 'Alle antwoorden getoond',
			equation: 'Formule',
			notRevealed: 'Nog niet getoond',
			answers: ['Amplitude', 'Evenwichtsstand', 'Periode', 'Referentiepunt']
		}
	} as const;

	let language: 'en' | 'nl' = 'en';
	$: text = translations[language];

	let revealed = 0;
	let formula = '';
	let answers: string[] = [];

	function integer(min: number, max: number): number {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	function signedTerm(value: number): string {
		return value < 0 ? `+${Math.abs(value)}` : `-${value}`;
	}

	function renderExercise(exercise: Exercise) {
		const magnitude = Math.abs(exercise.coefficient);
		const coefficient = magnitude === 1 ? '' : String(magnitude);
		const sign = exercise.coefficient < 0 ? '-' : '+';
		const trig = exercise.trig === 'sin' ? String.raw`\sin` : String.raw`\cos`;
		const shiftedX = exercise.shift === 0 ? 'x' : `(x${signedTerm(exercise.shift)})`;
		const frequencyNumber = exercise.frequency === 1 ? '' : String(exercise.frequency);
		const frequencyPi = exercise.frequencyIncludesPi ? String.raw`\pi` : '';
		const argument = `${frequencyNumber}${frequencyPi}${shiftedX}`;

		formula = mathSvg(String.raw`f(x)=${exercise.midline}${sign}${coefficient}${trig}\left(${argument}\right)`);

		const amplitude = mathSvg(String(magnitude));
		const midline = mathSvg(String(exercise.midline));
		const period = exercise.frequencyIncludesPi
			? mathSvg(exercise.frequency === 1 ? '2' : String.raw`\frac{2}{${exercise.frequency}}`)
			: mathSvg(
					exercise.frequency === 1
						? String.raw`2\pi`
						: String.raw`\frac{2\pi}{${exercise.frequency}}`
				);
		const referenceY =
			exercise.trig === 'sin'
				? exercise.midline
				: exercise.midline + exercise.coefficient;
		const referencePoint = mathSvg(`(${exercise.shift},${referenceY})`);

		answers = [amplitude, midline, period, referencePoint];
		revealed = 0;
	}

	function generateExercise() {
		let coefficient = integer(-4, 4);
		if (coefficient === 0) coefficient = 1;

		renderExercise({
			coefficient,
			midline: integer(-4, 4),
			frequency: integer(1, 3),
			frequencyIncludesPi: Math.random() < 0.35,
			shift: integer(-3, 3),
			trig: Math.random() < 0.5 ? 'sin' : 'cos'
		});
	}

	function revealNext() {
		revealed = Math.min(revealed + 1, answers.length);
	}

	function setLanguage(nextLanguage: 'en' | 'nl') {
		language = nextLanguage;
		const parameters = new URLSearchParams(window.location.search);
		parameters.set('lang', nextLanguage);
		window.history.replaceState(
			window.history.state,
			'',
			`${window.location.pathname}?${parameters.toString()}`
		);
	}

	onMount(() => {
		language = new URLSearchParams(window.location.search).get('lang') === 'nl' ? 'nl' : 'en';
	});

	// A deterministic initial exercise avoids random server/client HTML differences.
	renderExercise({
		coefficient: -3,
		midline: 2,
		frequency: 2,
		frequencyIncludesPi: false,
		shift: -1,
		trig: 'sin'
	});
</script>

<section class="mx-auto w-full max-w-3xl" lang={language}>
	<header class="text-center">
		<div class="mb-4 flex justify-center">
			<div class="inline-flex rounded-xl border border-gray-300 bg-white p-1 shadow-sm dark:border-gray-600 dark:bg-gray-800" aria-label={language === 'en' ? 'Language' : 'Taal'}>
				<button
					type="button"
					on:click={() => setLanguage('en')}
					aria-pressed={language === 'en'}
					class="rounded-lg px-3 py-1.5 text-sm font-bold transition-colors {language === 'en' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}"
				>English</button>
				<button
					type="button"
					on:click={() => setLanguage('nl')}
					aria-pressed={language === 'nl'}
					class="rounded-lg px-3 py-1.5 text-sm font-bold transition-colors {language === 'nl' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}"
				>Nederlands</button>
			</div>
		</div>
		<h1 class="text-3xl font-extrabold tracking-tight text-gray-950 dark:text-white sm:text-4xl">{text.title}</h1>
		<p class="mx-auto mt-3 max-w-2xl text-base leading-7 text-gray-600 dark:text-gray-300">
			{text.introduction}
		</p>
	</header>

	<div class="mt-7 flex flex-wrap justify-center gap-3">
		<button
			type="button"
			on:click={generateExercise}
			class="rounded-xl bg-blue-600 px-5 py-2.5 font-bold text-white shadow-sm transition hover:bg-blue-700"
		>{text.newExercise}</button>
		<button
			type="button"
			on:click={revealNext}
			disabled={revealed >= answers.length}
			class="rounded-xl border border-gray-300 bg-white px-5 py-2.5 font-bold text-gray-800 transition hover:border-blue-400 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:border-blue-400 dark:hover:text-blue-300"
		>{revealed >= answers.length ? text.allShown : text.revealNext}</button>
	</div>

	<div class="mt-8 overflow-x-auto rounded-2xl border border-gray-200 bg-white px-4 py-8 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:px-8">
		<p class="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">{text.equation}</p>
		<div class="flex min-w-max justify-center text-gray-950 dark:text-white">{@html formula}</div>
	</div>

	<div class="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
		{#each text.answers as label, index}
			<div class="grid min-h-16 grid-cols-[minmax(8rem,0.8fr)_minmax(0,1.2fr)] items-center border-b border-gray-200 last:border-b-0 dark:border-gray-700">
				<div class="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">{label}</div>
				<div class="border-l border-gray-200 px-4 py-3 text-center text-gray-950 dark:border-gray-700 dark:text-white">
					{#if revealed > index}
						{@html answers[index]}
					{:else}
						<span class="text-gray-400 dark:text-gray-500">{text.notRevealed}</span>
					{/if}
				</div>
			</div>
		{/each}
	</div>

</section>
