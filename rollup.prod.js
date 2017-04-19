import buble from 'rollup-plugin-buble';
// import resolve from 'rollup-plugin-node-resolve'
import cleanup from 'rollup-plugin-cleanup'
import flow from 'rollup-plugin-flow'

export default  {
	entry: 'src/index.js',
	plugins: [
		flow(),
		buble({
			objectAssign: 'Object.assign'
		}),
		cleanup()
	],
	format: 'cjs',
	dest: 'lib/index.cjs.js'
}