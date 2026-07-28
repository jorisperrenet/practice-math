<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from "$app/environment";

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

  function generate_formula(depth, maycontainsimplex, last_operator) {
    if (depth == 0) {
      if (maycontainsimplex) {
        return "x";
      }
      let x = Math.floor(Math.random()*9) + 1;
      return String(x);
    }
    let r = Math.random();
    // let operators = ["*", "-", "+", "ln", "sqrt", "^"];
    let operators = [];
    if (last_operator != "*") {
      operators.push("*");
    }
    if (last_operator != "-" && last_operator != "+") {
      operators.push("-");
      operators.push("+");
    }
    if (settings.chain_rule) {
      if (settings.use_ln) {
        operators.push("ln")
      }
      if (last_operator != "sqrt" && settings.use_sqrt && last_operator != "^1") {
        operators.push("sqrt")
      }
      if (settings.use_exponentials) {
        operators.push("^2")
      }
    }
    if (settings.power_rule) {
      if (last_operator != "^1" && last_operator != "sqrt" && last_operator != "ln") {
        operators.push("^1")
      }
    }
    let idx = Math.floor(r * operators.length);
    if (operators[idx] == "-" || operators[idx] == "+") {
      let ldepth = Math.floor(Math.random() * (depth-1));
      let rdepth = depth - ldepth - 1;
      return {
        left: generate_formula(ldepth, true, operators[idx]),
        right: generate_formula(rdepth, (depth > 1), operators[idx]),
        operator: operators[idx],
      }
    } else if (operators[idx] == "*") {
      let ldepth = Math.floor(Math.random() * (depth-1));
      let rdepth = depth - ldepth - 1;
      if (!settings.product_rule || ldepth == 0) {
        return {
          left: String(Math.floor(Math.random()*9) + 2),
          right: generate_formula(depth-1, true, operators[idx]),
          operator: operators[idx],
        }
      } else {
        return {
          left: generate_formula(ldepth, false, operators[idx]),
          right: generate_formula(rdepth, true, operators[idx]),
          operator: operators[idx],
        }
      }
    } else if (operators[idx] == "ln" || operators[idx] == "sqrt") {
      return {
        inner: generate_formula(depth-1, true, operators[idx]),
        operator: operators[idx],
      }
    } else if (operators[idx] == "^2") {
      let b = String(Math.floor(Math.random()*9) + 2);
      if (Math.random() < 0.7) {
        b = "e";
      }
      return {
        inner: generate_formula(depth-1, true, operators[idx]),
        base: b,
        operator: "^",
      }
    } else if (operators[idx] == "^1") {
      // Power rule
      if (settings.chain_rule) {
        return {
          inner: String(Math.floor(Math.random()*9) + 2),
          base: generate_formula(depth-1, true, operators[idx]),
          operator: "^",
        }
      } else {
        return {
          inner: String(Math.floor(Math.random()*9) + 2),
          base: "x",
          operator: "^",
        }
      }
    }
    // console.log(depth, operators[idx]);
  }

  function convert_to_tex(formula) {
		let s = String.raw``
		if (typeof(formula) == 'string') {
			return formula;
		} else if (formula.hasOwnProperty("tex")) {
      return formula.tex;
		} else if (formula.hasOwnProperty("inner")) {
			if (formula.operator == 'ln') {
				s += String.raw`\ln \left(` + convert_to_tex(formula.inner) + String.raw`\right)`
			} else if (formula.operator == 'sqrt') {
				s += String.raw`\sqrt{` + convert_to_tex(formula.inner) + String.raw`}`
			} else if (formula.operator == '^') {
        let x = "";
        if ("-+*^".includes(formula.base.operator)) {
          x = String.raw`\left(` + convert_to_tex(formula.base) + String.raw`\right)`
        } else {
          x = convert_to_tex(formula.base)
        }
        s += '{' + x + '}^{' + convert_to_tex(formula.inner) + '}'
			}
		} else {
			if ("-+".includes(formula.operator)) {
        s += '{' + convert_to_tex(formula.left) + '}';
        s += formula.operator;
        s += '{' + convert_to_tex(formula.right) + '}';
      } else if ("*".includes(formula.operator)) {
        s += make_tex(formula.left);
        s += String.raw`\cdot `;
        s += make_tex(formula.right);
			} else if (formula.operator == "/") {
				throw new Error("Not implemented")
			} else {
				throw new Error("Operation not known")
			}
		}
    formula.tex = s;
		return s;
  }

  function make_tex(formula) {
    // Turn the convert_to_tex (which is standalone) to something that can be used
    // recursively, because it adds brackets correctly.
    if ("-+".includes(formula.operator)) {
      return String.raw`\left(` + convert_to_tex(formula) + String.raw`\right)`
    } else {
      return convert_to_tex(formula)
    }
  }

  function add_containsx(formula) {
    if (typeof(formula) == 'string') {
      return formula.includes('x')
    }
    if (formula.hasOwnProperty("containsx")) {
      return formula.containsx
    }
    let bool = false;
    if (formula.hasOwnProperty("inner")) {
      if (add_containsx(formula.inner)) {
        bool = true;
      }
    }
    if (formula.hasOwnProperty("base")) {
      if (add_containsx(formula.base)) {
        bool = true;
      }
    }
    if (formula.hasOwnProperty("left")) {
      if (add_containsx(formula.left)) {
        bool = true;
      }
    }
    if (formula.hasOwnProperty("right")) {
      if (add_containsx(formula.right)) {
        bool = true;
      }
    }
    formula.containsx = bool;
    return bool;
  }

  function exp_minus_one(s) {
    if (s == '2') {
      return ""
    }
    if (!isNaN(s)) {
      return "^" + (parseInt(s) - 1)
    }
    return "^{" + convert_to_tex(s) + "-1}"
  }

  function add_derivative(formula) {
    if (typeof(formula) == 'string') {
      if (formula == 'x') {
        return "1";
      } else {
        return "0";
      }
    }
    let derivative = '?';
    if (formula.containsx == false) {
      formula.rule = "Constant"
      derivative = "0";
    } else if (formula.hasOwnProperty("derivative")) {
      derivative = formula.derivative;
    } else if (formula.operator == "+") {
      formula.rule = "Sum rule"
      let l = add_derivative(formula.left);
      let r = add_derivative(formula.right);
      if (l == '0' && r == '0') {
        derivative = '0'
      } else if (l == '0') {
        derivative = r
      } else if (r == '0') {
        derivative = l
      } else {
        derivative = '{' + l + '+' + r + '}'
      }
    } else if (formula.operator == "-") {
      formula.rule = "Sum rule"
      let l = add_derivative(formula.left);
      let r = add_derivative(formula.right);
      if (l == '0' && r == '0') {
        derivative = '0'
      } else if (l == '0') {
        derivative = -r
      } else if (r == '0') {
        derivative = l
      } else {
        derivative = '{' + l + '-' + r + '}'
      }
    } else if (formula.operator == "*") {
      // Product rule
      let l = add_derivative(formula.left);
      let r = add_derivative(formula.right);
      let l2 = String.raw`\left\{` + l + String.raw`\right\}`;
      let r2 = String.raw`\left\{` + r + String.raw`\right\}`;
      if (l == '0' && r == '0') {
        derivative = '0'
      } else if (l == '0') {
        formula.rule = "Constant times rule"
        if (r == '1') {
          derivative = '{' + make_tex(formula.left) + String.raw`}`;
        } else {
          derivative = '{{' + make_tex(formula.left) + String.raw`}\cdot ` + r2 + '}'
        }
      } else if (r == '0') {
        formula.rule = "Constant times rule"
        if (l == '1') {
          derivative = '{' + make_tex(formula.right) + String.raw`}`;
        } else {
          derivative = '{{' + make_tex(formula.right) + String.raw`}\cdot ` + l2 + '}'
        }
      } else {
        formula.rule = "Product rule"
        // derivative = String.raw`\left({` + make_tex(formula.left) + String.raw`}\cdot ` + r + '+{' + make_tex(formula.right) + String.raw`}\cdot ` + l + String.raw`\right)`
        derivative = '{' + make_tex(formula.left) + String.raw`}\cdot ` + r2 + '+{' + make_tex(formula.right) + String.raw`}\cdot ` + l2
      }
    } else if (formula.operator == 'sqrt') {
      formula.rule = "Chain rule"
      // Chain rule
      let l = add_derivative(formula.inner);
      let l2 = String.raw`\left[` + l + String.raw`\right]`;
      if (l == '0') {
        derivative = '0';
      } else if (l == '1') {
        derivative = String.raw`\frac{1}{2\sqrt{` + convert_to_tex(formula.inner) + String.raw`}}`;
      } else {
        derivative = String.raw`\frac{1}{2\sqrt{` + convert_to_tex(formula.inner) + String.raw`}} \cdot ` + l2;
      }
    } else if (formula.operator == 'ln') {
      formula.rule = "Chain rule"
      // Chain rule
      let l = add_derivative(formula.inner);
      let l2 = String.raw`\left[` + l + String.raw`\right]`;
      if (l == '0') {
        derivative = '0';
      } else if (l == '1') {
        derivative = String.raw`\frac{1}{` + convert_to_tex(formula.inner) + String.raw`}`;
      } else {
        derivative = String.raw`\frac{1}{` + convert_to_tex(formula.inner) + String.raw`} \cdot ` + l2;
      }
    } else if (formula.operator == '^' && add_containsx(formula.base) != true) {
      formula.rule = "Chain rule";
      // Chain rule
      let l = add_derivative(formula.inner);
      let l2 = String.raw`\left[` + l + String.raw`\right]`;
      if (l == '0') {
        derivative = '0';
      } else if (l == '1') {
        if (formula.base == 'e') {
          derivative = 'e^{' + convert_to_tex(formula.inner) + String.raw`}`;
        } else {
          derivative = make_tex(formula.base) + '^{' + convert_to_tex(formula.inner) + String.raw`}\cdot \ln\left(` + convert_to_tex(formula.base) + String.raw`\right)`;
        }
      } else {
        if (formula.base == 'e') {
          derivative = 'e^{' + convert_to_tex(formula.inner) + String.raw`}\cdot ` + l2;
        } else {
          derivative = make_tex(formula.base) + '^{' + convert_to_tex(formula.inner) + String.raw`}\cdot \ln\left(` + convert_to_tex(formula.base) + String.raw`\right)` + String.raw`\cdot ` + l2;
        }
      }
    } else if (formula.operator == '^') {
      formula.rule = "Power rule";
      let l = add_derivative(formula.base);
      let l2 = String.raw`\left[` + l + String.raw`\right]`;
      let m = exp_minus_one(formula.inner);
      let x = "";
      if ("-+*^".includes(formula.base.operator)) {
        x = String.raw`\left(` + convert_to_tex(formula.base) + String.raw`\right)`
      } else {
        x = convert_to_tex(formula.base)
      }
      if (l == '0') {
        derivative = '0';
      } else if (l == '1') {
        derivative = make_tex(formula.inner) + String.raw`\cdot {` + x + exp_minus_one(formula.inner) + '}';
      } else {
        formula.rule = "Chain rule"
        derivative = make_tex(formula.inner) + String.raw`\cdot {` + x + exp_minus_one(formula.inner) + String.raw`}\cdot ` + l2;
      }
    }
    formula.derivative = derivative;
    return derivative;
  }

  function convert_to_tree(formula) {
    if (formula.rule == "Chain rule") {
      let start = (language === "NED") ? "Kettingregel" : "Chain Rule";
      let res = [{descr: start, folds: []}];
      let start1 = (language === "NED") ? "Buitenste deel" : "Outer part";
      let start2 = (language === "NED") ? "Binnenste deel" : "Inner part";
      console.log("show", settings.show_derivative);
      if (formula.operator == '^' && add_containsx(formula.base) != true) {
        let cl = { base: formula.base, inner: "x", operator: '^' };
        res.push({
            descr: start1 + getMathjaxSVG(("b_1(x) = " + make_tex(formula.base) + "^x").replace(/x/gi, "X")) + ((settings.show_derivative) ? getMathjaxSVG(("b_1'(x) = " + add_derivative(cl)).replace(/x/gi, "X")) : ""),
            folds: [],
          });
        res.push({
            descr: start2 + getMathjaxSVG("b_2(x) = " + convert_to_tex(formula.inner)) + ((settings.show_derivative) ? getMathjaxSVG("b_2'(x) = " + add_derivative(formula.inner)) : ""),
            folds: convert_to_tree(formula.inner),
          });
      } else if (formula.operator == '^' && add_containsx(formula.base) == true) {
        let cl = { inner: formula.inner, base: "x", operator: '^' };
        res.push({
            descr: start1 + getMathjaxSVG(("b_1(x) = x^{" + make_tex(formula.inner) + "}").replace(/x/gi, "X")) + ((settings.show_derivative) ? getMathjaxSVG(("b_1'(x) = " + add_derivative(cl)).replace(/x/gi, "X")) : ""),
            folds: convert_to_tree(cl),
          });
        res.push({
            descr: start2 + getMathjaxSVG("b_2(x) = " + convert_to_tex(formula.base)) + ((settings.show_derivative) ? getMathjaxSVG("b_2'(x) = " + add_derivative(formula.base)) : ""),
            folds: convert_to_tree(formula.base),
          });
      } else if (formula.operator == 'sqrt') {
        let cl = { inner: "x", operator: 'sqrt' };
        res.push({
            descr: start1 + getMathjaxSVG("b_1(x) = " + make_tex(cl)) + ((settings.show_derivative) ? getMathjaxSVG("b_1'(x) = " + add_derivative(cl)) : ""),
            folds: [],
          });
        res.push({
            descr: start2 + getMathjaxSVG("b_2(x) = " + convert_to_tex(formula.inner)) + ((settings.show_derivative) ? getMathjaxSVG("b_2'(x) = " + add_derivative(formula.inner)) : ""),
            folds: convert_to_tree(formula.inner),
          });
      } else if (formula.operator == 'ln') {
        let cl = { inner: "x", operator: 'ln' };
        res.push({
            descr: start1 + getMathjaxSVG("b_1(x) = " + make_tex(cl)) + ((settings.show_derivative) ? getMathjaxSVG("b_1'(x) = " + add_derivative(cl)) : ""),
            folds: [],
          });
        res.push({
            descr: start2 + getMathjaxSVG("b_2(x) = " + convert_to_tex(formula.inner)) + ((settings.show_derivative) ? getMathjaxSVG("b_2'(x) = " + add_derivative(formula.inner)) : ""),
            folds: convert_to_tree(formula.inner),
          });
      }
      return res;
    } else if (formula.rule == "Sum rule") {
      let start = (language === "NED") ? "Somregel" : "Sum Rule";
      let start1 = (language === "NED") ? "Linker deel" : "Left part";
      let start2 = (language === "NED") ? "Rechter deel" : "Right part";
      return [{
          descr: start,
          folds: [],
        }, {
          descr: start1 + getMathjaxSVG("l(x) = " + convert_to_tex(formula.left)) + ((settings.show_derivative) ? getMathjaxSVG("l'(x) = " + add_derivative(formula.left)) : ""),
          folds: convert_to_tree(formula.left),
        }, {
          descr: start2 + getMathjaxSVG("r(x) = " + convert_to_tex(formula.right)) + ((settings.show_derivative) ? getMathjaxSVG("r'(x) = " + add_derivative(formula.right)) : ""),
          folds: convert_to_tree(formula.right),
        }]
    } else if (formula.rule == "Product rule") {
      let start = (language === "NED") ? "Productregel" : "Product Rule";
      let start1 = (language === "NED") ? "Linker deel" : "Left part";
      let start2 = (language === "NED") ? "Rechter deel" : "Right part";
      return [{
          descr: start,
          folds: [],
        }, {
          descr: start1 + getMathjaxSVG("l(x) = " + convert_to_tex(formula.left)) + ((settings.show_derivative) ? getMathjaxSVG("l'(x) = " + add_derivative(formula.left)) : ""),
          folds: convert_to_tree(formula.left),
        }, {
          descr: start2 + getMathjaxSVG("r(x) = " + convert_to_tex(formula.right)) + ((settings.show_derivative) ? getMathjaxSVG("r'(x) = " + add_derivative(formula.right)) : ""),
          folds: convert_to_tree(formula.right),
        }]
    } else if (formula.rule == "Constant times rule") {
      if (add_containsx(formula.left) == false) {
        let start = (language === "NED") ? "Zonder de keer " + formula.left : "Without the times " + formula.left;
        return [{
            descr: start + getMathjaxSVG("f(x) = " + convert_to_tex(formula.right)) + ((settings.show_derivative) ? getMathjaxSVG("f'(x) = " + add_derivative(formula.right)) : ""),
            folds: convert_to_tree(formula.right),
          }]
      } else if (add_containsx(formula.right) == false) {
        let start = (language === "NED") ? "Zonder de keer " + formula.right : "Without the times " + formula.right;
        return [{
            descr: start + getMathjaxSVG("f(x) = " + convert_to_tex(formula.left)) + ((settings.show_derivative) ? getMathjaxSVG("f'(x) = " + add_derivative(formula.left)) : ""),
            folds: convert_to_tree(formula.left),
          }]
      }
    } else if (formula.rule == "Power rule") {
      let start = (language === "NED") ? "Machtregel (macht = " + formula.inner + ")" : "Power Rule (power = " + formula.inner + ")";
      return [{
          descr: start,
          folds: convert_to_tree(formula.base),
        }]
    }
    return []
  }
  function convert_tree_to_html(tree, d) {
		// return `<div> ` + getMathjaxSVG(tex) + ` WAT </div>`
    // console.log(String(opac));
		let s = `<div class="collapse collapse-arrow bg-gray-400 bg-opacity-15 border-base-900 border">
        <input type="checkbox" class="peer" />
        <div class="collapse-title font-bold peer-checked:bg-zinc-900 peer-checked:bg-opacity-30">` + tree.descr + `</div>`
		// let s = `<div class="collapse-open bg-gray-400 bg-opacity-` + opac + ` border-base-300 border">
        // <div class="collapse-title font-bold peer-checked:bg-green-100">` + tree.descr + `</div>`
    s += `<div class="collapse-content bg-gray-400 bg-opacity-15">`;
    // s += tree.descr;
    for (const f of tree.folds) {
      if (f.folds.length > 0) {
        s += convert_tree_to_html(f, d+1);
      } else {
        s += `<div class="collapse-title font-bold -m-2">` + f.descr + `</div>`
        // s += f.descr;
      }
    }
    return s + `</div>` + `</div>`
  }

  function do_derivative(formula) {
    convert_to_tex(formula);
    add_containsx(formula);
    add_derivative(formula);
    let start = (language === "NED") ? "Functie" : "Function";
    let tree = {
      descr: start + getMathjaxSVG(String.raw`f(x) = ` + convert_to_tex(formula)) + ((settings.show_derivative) ? getMathjaxSVG("f'(x) = " + add_derivative(formula)) : ""),
      folds: convert_to_tree(formula),
    }
    return convert_tree_to_html(tree, 1);
  }

  let depth = 3;
  let settings = {
    'chain_rule': true,
    'product_rule': true,
    'power_rule': true,
    'use_sqrt': true,
    'use_ln': true,
    'use_exponentials': true,
    'show_derivative': true,
  };

  let urlParams = browser
    ? new URLSearchParams($page.url.searchParams.toString())
    : new URLSearchParams();
  if (urlParams.get('level') == '1') {
    depth = 4;
    settings.use_ln = false;
    settings.use_exponentials = false;
  }
  if (browser && !urlParams.has('lang')) {
    urlParams.set('lang', 'en');
    goto(`?${urlParams.toString()}`);
  }
  let language = "";
  let other_language = "";
  let sp = "";
  if (urlParams.get('lang') == 'nl') {
    language = "NED";
    other_language = "English";
    sp = "Oefen met differentiëren!";
  } else {
    language = "ENG";
    other_language = "Dutch";
    sp = "Practice your derivatives!";
  }
  let formula = generate_formula(depth, true, "");
  // console.log(formula);
  let folds = do_derivative(formula)

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
      window.history.replaceState(window.history.state, '', `?${urlParams.toString()}`);
      language = "ENG"
      other_language = "Dutch"
      sp = "Practice your derivatives!"
    } else {
      urlParams.set('lang', 'nl');
      window.history.replaceState(window.history.state, '', `?${urlParams.toString()}`);
      language = "NED"
      other_language = "English"
      sp = "Oefen je afgeleides!"
    }
    folds = do_derivative(formula);
  }

  function handle_depth_change(event) {
    depth = event.target.value;
    console.log("depth set to", depth);
    formula = generate_formula(depth, true, "");
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
    folds = do_derivative(formula);
  }

  function generate_new() {
    formula = generate_formula(depth, true, "");
    folds = do_derivative(formula);
  }
</script>

<section class="mx-auto w-full max-w-5xl">
  <header class="text-center">
    <div class="mb-4 flex justify-center">
      <div class="inline-flex rounded-xl border border-gray-300 bg-white p-1 shadow-sm dark:border-gray-600 dark:bg-gray-800" aria-label={language === 'ENG' ? 'Language' : 'Taal'}>
        <button type="button" on:click={() => language !== 'ENG' && toggle_language()} aria-pressed={language === 'ENG'} class="rounded-lg px-3 py-1.5 text-sm font-bold transition-colors {language === 'ENG' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}">English</button>
        <button type="button" on:click={() => language !== 'NED' && toggle_language()} aria-pressed={language === 'NED'} class="rounded-lg px-3 py-1.5 text-sm font-bold transition-colors {language === 'NED' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}">Nederlands</button>
      </div>
    </div>
    <h1 class="text-3xl font-extrabold tracking-tight text-gray-950 dark:text-white sm:text-4xl">{sp}</h1>
    <p class="mx-auto mt-3 max-w-2xl text-base leading-7 text-gray-600 dark:text-gray-300">
      {(language == "ENG") ? "Generate derivative exercises and inspect which differentiation rule is applied at every step." : "Genereer opgaven met afgeleiden en bekijk bij iedere stap welke differentieerregel wordt toegepast."}
    </p>
  </header>

  <fieldset class="mt-7 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-5">
    <legend class="px-2 text-sm font-bold text-gray-700 dark:text-gray-200">{(language == "ENG") ? "Settings" : "Instellingen"}</legend>
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      <label class="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
        <input type="checkbox" id="power_rule" class="toggle" on:change={() => toggle_value('power_rule')} />
        {(language == "ENG") ? "Power Rule" : "Machtregel"}
      </label>
      <label class="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
        <input type="checkbox" id="chain_rule" class="toggle" on:change={() => toggle_value('chain_rule')} />
        {(language == "ENG") ? "Chain Rule" : "Kettingregel"}
      </label>
      <label class="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
        <input type="checkbox" id="product_rule" class="toggle" on:change={() => toggle_value('product_rule')} />
        {(language == "ENG") ? "Product Rule" : "Productregel"}
      </label>
      <label class="col-span-2 flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-200 sm:col-span-1">
        <input type="range" min="0" max="10" value="{depth}" class="min-w-0 flex-1 accent-blue-600" step="1" on:input={handle_depth_change}/>
        {(language == "ENG") ? "Depth" : "Diepte"} = {depth}
      </label>
      <label class="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
        <input type="checkbox" class="toggle" id="use_ln" on:change={() => toggle_value('use_ln')} />
        ln
      </label>
      <label class="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
        <input type="checkbox" id="use_sqrt" class="toggle" on:change={() => toggle_value('use_sqrt')} />
        {(language == "ENG") ? "sqrt" : "wortel"}
      </label>
      <label class="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
        <input type="checkbox" id="use_exponentials" class="toggle" on:change={() => toggle_value('use_exponentials')} />
        {(language == "ENG") ? "exponential" : "machtsverband"}
      </label>
      <button class="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-bold text-gray-700 transition hover:border-blue-400 hover:text-blue-700 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-blue-400 dark:hover:text-blue-300" on:click={() => toggle_value('show_derivative')}>
        {#if language == "ENG"}
          {settings.show_derivative ? "Hide derivative" : "Show derivative"}
        {:else}
          {settings.show_derivative ? "Afgeleide verbergen" : "Afgeleide tonen"}
        {/if}
      </button>
    </div>
  </fieldset>

  <button class="mt-4 w-full rounded-xl bg-blue-600 px-5 py-2.5 font-bold text-white shadow-sm transition hover:bg-blue-700" on:click={() => generate_new()}>{(language == "ENG") ? "Generate new exercise" : "Genereer nieuwe opgave"}</button>

  <div class="mt-5 overflow-hidden rounded-2xl text-gray-900 dark:text-gray-100">
    {@html folds}
  </div>

<div class="mt-10 rounded-2xl border border-gray-200 bg-white p-5 text-gray-700 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 sm:p-6">
  {#if language == "ENG"}
    <h2 class="text-xl font-bold text-gray-950 dark:text-white">Information</h2>
    <ul class="mt-3 list-disc space-y-2 pl-5 leading-7">
      <li>This tool can't simplify functions, but you can. Try simplifying the function before taking its derivative, then compare your result.</li>
      <li>Click the function to inspect the last rule applied, recursively.</li>
      <li>Square brackets mark the derivative of the inner function in the chain rule.</li>
      <li>Curly brackets mark function derivatives in the product rule.</li>
    </ul>
  {/if}
  {#if language == "NED"}
    <h2 class="text-xl font-bold text-gray-950 dark:text-white">Informatie</h2>
    <ul class="mt-3 list-disc space-y-2 pl-5 leading-7">
      <li>Deze tool vereenvoudigt functies niet automatisch. Probeer de functie vóór het differentiëren te herleiden en vergelijk daarna je resultaat.</li>
      <li>Klik op de functie om recursief de laatst toegepaste regel te bekijken.</li>
      <li>Vierkante haken markeren bij de kettingregel de afgeleide van de binnenste functie.</li>
      <li>Accolades markeren bij de productregel de afgeleiden van de functies.</li>
    </ul>
  {/if}
</div>
</section>
