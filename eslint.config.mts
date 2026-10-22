import obsidianmd from 'eslint-plugin-obsidianmd';
import globals from 'globals';
import { globalIgnores, defineConfig } from 'eslint/config';

/** `x as unknown as T`: how non-public Obsidian APIs are reached. */
const INTERNAL_CAST =
	"TSAsExpression[expression.type='TSAsExpression'][expression.typeAnnotation.type='TSUnknownKeyword']";

export default defineConfig(
	globalIgnores([
		'node_modules',
		'dist',
		'esbuild.config.mjs',
		'version-bump.mjs',
		'versions.json',
		'main.js',
		'package.json',
		'package-lock.json',
		'tsconfig.json',
	]),
	{
		languageOptions: {
			globals: {
				...globals.browser,
			},
			parserOptions: {
				projectService: {
					allowDefaultProject: ['eslint.config.mts', 'manifest.json'],
				},
				tsconfigRootDir: import.meta.dirname,
				extraFileExtensions: ['.json'],
			},
		},
	},
	...obsidianmd.configs.recommended,

	// core/: pure logic, no Obsidian and nothing else from the plugin.
	{
		files: ['src/core/**/*.ts'],
		rules: {
			'no-restricted-imports': [
				'error',
				{
					paths: [{ name: 'obsidian', message: 'core/ must not depend on Obsidian.' }],
					patterns: [{ group: ['../*'], message: 'core/ may only import from core/.' }],
				},
			],
		},
	},

	// Non-public Obsidian APIs only through internals/.
	{
		files: ['src/**/*.ts'],
		ignores: ['src/internals/**'],
		rules: {
			'no-restricted-syntax': [
				'error',
				{
					selector: INTERNAL_CAST,
					message: 'Reach non-public Obsidian APIs through src/internals/ only.',
				},
			],
		},
	},
);
