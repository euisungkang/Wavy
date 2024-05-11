import * as ready from './ready';
import * as interactionCreate from './interactionCreate';

export const events = {
    ready,
    interactionCreate,
    [Symbol.iterator]: function* () {
        let properties = Object.keys(this);
        for (let i of properties) {
            yield [i, this[i]];
        }
    }
};
