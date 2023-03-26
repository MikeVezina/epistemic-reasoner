import {AtomicFormula, Formula, FormulaFactory} from '../formula/formula';
import { Postcondition } from './postcondition';
import { ExplicitEpistemicModel } from '../epistemicmodel/explicit-epistemic-model';
import {World} from '../epistemicmodel/world';
import {WorldValuation} from '../epistemicmodel/world-valuation';
import {AgentExplicitEpistemicModel} from '../epistemicmodel/agent-explicit-epistemic-model';

export class WorldTransferPostcondition extends Postcondition {
    getValuation() {
        return this.transition;
    }
    private postProps: string[];
    private transition: { [pre: string]: World } = {};

    constructor(transition: { [pre: string]: World }, postProps: string[]= []) {
        super();
        this.transition = transition;
        this.postProps = postProps;
    }

    private findTrueTransition(M: AgentExplicitEpistemicModel, w: string): World {

        for (let pre of Object.keys(this.transition)) {
            if (M.modelCheck(w, new AtomicFormula(pre))) {
                return this.transition[pre];
            }
        }
        return;
    }

    /**
     @returns a world object that is the update of the world of id w by the postcondition
     */
    perform(M: AgentExplicitEpistemicModel, w: string) {
        let transition = this.findTrueTransition(M, w);

        if (transition === undefined) {
            throw new Error('no transition?');
        }

        let newWorld = Postcondition.cloneWorld(transition);
        // for (let p in this.postProps) {
        //     newWorld.valuation.propositions[p] = M.modelCheck(w, this.postProps[p]);
        // }

        return newWorld;
    }

    toString() {
        let s = '';
        // for (let p in this.post) {
        //     s += p + ':=' + this.post[p] + ' ';
        // }
        return s;
    }
}
