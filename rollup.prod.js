import cleanup from 'rollup-plugin-cleanup'
import babel from 'rollup-plugin-babel';

export default {
	entry: 'src/index.js',
	format: 'cjs',
	plugins: [
		babel({
			exclude: 'node_modules/**' // only transpile our source code
		})
		, cleanup()
	],
	dest: 'lib/rrbit.js'
};
