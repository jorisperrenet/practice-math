<script lang="ts">
  import { githubLink } from '../../const.ts';
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


  // let formula = {
  //   inner: {
  //     left: {
				// left: {
					// // inner: "6",
  //         inner: {
  //           left: "6",
  //           right: {
  //             base: "x",
  //             inner: "2",
  //             operator: "^",
  //           },
  //           operator: "*",
  //         },
					// operator: "sqrt",
				// },
				// // right: {
				// // 	left: "x",
				// // 	right: "1",
				// // 	operator: "-",
				// // },
  //       right: {
  //         base: {
  //           left: {
  //             left: "2",
  //             right: "x",
  //             operator: "*",
  //           },
  //           right: "1",
  //           operator: "-",
  //         },
  //         inner: "2",
  //         operator: "^",
  //       },
  //       operator: "*",
  //     },
			// right: {
			  // inner: "7",
			  // operator: "ln",
			// },
  //     operator: "-",
  //   },
  //   // base: "e",
		// base: {
			// left: "7",
			// right: "p",
			// operator: "-",
		// },
  //   operator: "^",
  // };

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
      if (last_operator != "sqrt" && settings.use_sqrt) {
        operators.push("sqrt")
      }
      operators.push("^2")
    }
    if (settings.power_rule) {
      if (last_operator != "^1") {
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
      if (settings.product_rule || ldepth == 0) {
        return {
          left: generate_formula(ldepth, false, operators[idx]),
          right: generate_formula(rdepth, true, operators[idx]),
          operator: operators[idx],
        }
      } else {
        return {
          left: String(Math.floor(Math.random()*9) + 2),
          right: generate_formula(depth-1, true, operators[idx]),
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
  // const formula = {
  //   inner: "10",
		// base: {
			// left: "7",
			// right: "x",
			// operator: "-",
		// },
  //   operator: "^",
  // };
  function convert_to_tex(formula) {
		let s = String.raw``
		if (typeof(formula) == 'string') {
			return formula;
		// } else if (formula.hasOwnProperty("tex")) {
      // return formula.tex;
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

  function add_tex(formula) {
    if (typeof(formula) == 'string') {
      return
    }
    formula.tex = convert_to_tex(formula);
    if (formula.hasOwnProperty("inner")) {
      add_tex(formula.inner)
    }
    if (formula.hasOwnProperty("base")) {
      add_tex(formula.base)
    }
    if (formula.hasOwnProperty("left")) {
      add_tex(formula.left)
    }
    if (formula.hasOwnProperty("right")) {
      add_tex(formula.right)
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
            folds: convert_to_tree(formula.inner),
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
    add_tex(formula);
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
    'show_derivative': true,
  };

  let language = "ENG"
  let other_language = "Dutch"
  let sp = "Practice your derivatives!"
  let formula = generate_formula(depth, true, "");
  // console.log(formula);
  let folds = do_derivative(formula)

  function toggle_language() {
    if (language == "NED") {
      language = "ENG"
      other_language = "Dutch"
      sp = "Practice your derivatives!"
    } else {
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

<header class="bg-white -mt-10 pt-0">
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

<h1 class="mx-auto text-4xl font-bold my-2">{sp}</h1>

<div class="mx-auto w-full max-w-screen-xl">
  <fieldset class="fieldset bg-base-100 border-base-300 rounded-box border p-4">
    <legend class="fieldset-legend">Generate Options</legend>
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-2 content-between">
      <label class="label">
        <input type="checkbox" checked="checked" class="toggle" on:change={() => toggle_value('power_rule')} />
        {(language == "ENG") ? "Power Rule" : "Machtregel"}
      </label>
      <label class="label">
        <input type="checkbox" checked="checked" class="toggle" on:change={() => toggle_value('chain_rule')} />
        {(language == "ENG") ? "Chain Rule" : "Kettingregel"}
      </label>
      <label class="label">
        <input type="checkbox" checked="checked" class="toggle" on:change={() => toggle_value('product_rule')} />
        {(language == "ENG") ? "Product Rule" : "Productregel"}
      </label>
      <label class="label">
        <div class="w-full max-w-xs">
          <input type="range" min="0" max="10" value="1" class="range" step="1" on:input={handle_depth_change}/>
        </div>
        {(language == "ENG") ? "Depth" : "Diepte"} = {depth}
      </label>
      <label class="label">
        <input type="checkbox" checked="checked" class="toggle" on:change={() => toggle_value('use_ln')} />
        {(language == "ENG") ? "ln" : "ln"}
      </label>
      <label class="label">
        <input type="checkbox" checked="checked" class="toggle" on:change={() => toggle_value('use_sqrt')} />
        {(language == "ENG") ? "sqrt" : "wortel"}
      </label>
      <label class="label">
        <input type="checkbox" checked="checked" class="toggle" on:change={() => toggle_value('show_derivative')} />
        {(language == "ENG") ? "show derivative" : "laat afgeleide zien"}
      </label>
    </div>
  </fieldset>

  <button class="w-full btn btn-soft btn-primary justify-right" on:click={() => generate_new()}><p>Generate</p></button>

  {@html folds}
</div>

<div class="w-full max-w-screen-xl mx-auto mt-20">
  {#if language == "ENG"}
    <h2 class="mx-auto text-2xl font-bold my-2">Information</h2>
    <li>Click on the function to see the last rule that was applied (recursively).</li>
    <li>[Square brackets] are used for the chain rule (specifically, the derivative of the inner part).</li>
    <li>{`{`}Curly brackets{`}`} are used for the product rule (specifically, the derivatives of the functions).</li>
  {/if}
  {#if language == "NED"}
    <h2 class="mx-auto text-2xl font-bold my-2">Informatie</h2>
    <li>Klik op de functie om de laatst gebruikte regel te zien (recursief).</li>
    <li>[Vierkante haakjes] worden gebruikt voor de kettingregel (voor de afgeleide van de binnenste functie).</li>
    <li>{`{`}Accolades{`}`} worden gebruikt voor de productregel (voor de afgeleides van de functies).</li>
  {/if}
</div>

<style>
</style>
