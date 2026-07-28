<script lang="ts">
</script>

<svelte:head>
	<title>Practice Math — Derivatives & Sine Waves</title>
	<meta name="description" content="Free interactive math practice: generate unlimited derivative and sine-wave exercises with worked solutions. Available in English and Dutch." />
	<link rel="canonical" href="https://jorisperrenet.com/practice-math/" />
	<meta property="og:title" content="Practice Math — Derivatives & Sine Waves" />
	<meta property="og:description" content="Free interactive math practice with unlimited generated exercises and worked solutions." />
	<meta property="og:url" content="https://jorisperrenet.com/practice-math/" />
	<meta property="og:image" content="https://jorisperrenet.com/profile.jpg" />
	<meta name="twitter:title" content="Practice Math — Derivatives & Sine Waves" />
	<meta name="twitter:description" content="Free interactive math practice with unlimited generated exercises." />
	<meta name="twitter:image" content="https://jorisperrenet.com/profile.jpg" />
</svelte:head>

<main class="mx-auto flex w-full max-w-4xl flex-col px-4 py-12 text-center sm:px-6 sm:py-16">
  <h1 class="text-4xl font-bold tracking-tight text-gray-950 dark:text-white">Practice Math</h1>
  <p class="mx-auto mt-3 max-w-2xl text-lg text-gray-600 dark:text-gray-300">Generate unlimited exercises, work at your own pace, and reveal a worked solution when you need it.</p>
  <div class="mx-auto mt-8 grid w-full max-w-3xl gap-4 sm:grid-cols-2">
    <a class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-md dark:border-gray-700 dark:bg-gray-800" href="./derivatives/">
      <strong class="text-xl">Derivatives</strong><span class="mt-2 block text-sm text-gray-600 dark:text-gray-300">Differentiate generated functions and compare your result with each solution.</span>
    </a>
    <a class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-md dark:border-gray-700 dark:bg-gray-800" href="./sine_waves/">
      <strong class="text-xl">Sine waves</strong><span class="mt-2 block text-sm text-gray-600 dark:text-gray-300">Read amplitude, period, phase, and vertical shift from changing waveforms.</span>
    </a>
  </div>
</main>
