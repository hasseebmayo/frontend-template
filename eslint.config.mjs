import antfu from "@antfu/eslint-config";
import nextPlugin from "@next/eslint-plugin-next";
import jsxA11y from "eslint-plugin-jsx-a11y";
// import tailwind from "eslint-plugin-tailwindcss";

export default antfu(
	{
		react: true,
		typescript: true,

		lessOpinionated: true,
		isInEditor: false,

		stylistic: {
			semi: true,
		},

		formatters: {
			css: true,
		},

		ignores: ["migrations/**/*", "next-env.d.ts", "node_modules/**/*"],
	},
	// ...tailwind.configs["flat/recommended"],
	jsxA11y.flatConfigs.recommended,
	{
		plugins: {
			"@next/next": nextPlugin,
		},
		rules: {
			...nextPlugin.configs.recommended.rules,
			...nextPlugin.configs["core-web-vitals"].rules,
			"no-console": "warn",
		},
	},
	{
		rules: {
			"antfu/no-top-level-await": "off", // Allow top-level await
			"style/brace-style": ["error", "1tbs"], // Use the default brace style
			"ts/consistent-type-definitions": ["error", "type"], // Use `type` instead of `interface`
			"react/prefer-destructuring-assignment": "off", // Vscode doesn't support automatically destructuring, it's a pain to add a new variable
			"node/prefer-global/process": "off", // Allow using `process.env`
			"test/padding-around-all": "error", // Add padding in test files
			"test/prefer-lowercase-title": "off", // Allow using uppercase titles in test titles
			"react-hooks-extra/no-unnecessary-use-prefix": "off",
			"style/multiline-ternary": "off",
			"ts/no-use-before-define": "off",
		},
	},
);
