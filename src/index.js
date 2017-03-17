import {empty, of} from './eagle';
import {empty as cEmpty,of as cOf} from './cassowry';

const Eagle = {
	empty: empty,
	of: of,
};

const Cassowry = {
	empty: cEmpty,
	of: cOf
};


//TODO: figure out better exposed exports API

export {
	Eagle,
	Cassowry
}