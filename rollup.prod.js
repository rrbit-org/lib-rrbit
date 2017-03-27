// import {rollup} from 'rollup';
import buble from 'rollup-plugin-buble';

export default  {
	entry: 'src/index.js',
	plugins: [buble({
		objectAssign: 'Object.assign'
	})],
	format: 'cjs',
	dest: 'lib/index.cjs.js'
}