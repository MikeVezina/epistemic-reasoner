import { EpistemicModel } from '../epistemicmodel/epistemic-model';
import extend from 'extend';

export abstract class Postcondition {

    /**
     * @param e a world
     * @returns a copy of the world
     */
    static cloneWorld(e: any) {
        if (e instanceof Function)
            return e;
        if (e instanceof Array) {
            var c = new Array();

            for (let i in e) {
                c[i] = Postcondition.cloneWorld(e[i]); //here it is not a world, it is ugly...
            }

            return c;
        }
        else {
            if (e instanceof Object) {
                let c = extend(true, Object.create(Object.getPrototypeOf(e)), e);

                for (let i in e) {
                    c[i] = Postcondition.cloneWorld(e[i]); //here it is not a world, it is ugly...
                }
                return c;
            }
            else
                return e;
           }
    }

    abstract perform(M: EpistemicModel, w: string);
    abstract toString(): string;
    abstract getValuation();
}
