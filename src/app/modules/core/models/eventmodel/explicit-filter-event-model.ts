import {ExplicitEpistemicModel} from '../epistemicmodel/explicit-epistemic-model';

import {
    AndFormula, AtomicFormula, Formula,
    NotFormula, OrFormula, TrueFormula
} from '../formula/formula';
import {ExplicitEventModel} from './explicit-event-model';
import {Valuation} from '../epistemicmodel/valuation';

export class ExplicitFilterEventModel extends ExplicitEventModel {

    readonly propEval: Formula;
    readonly initialModel: ExplicitEpistemicModel;

    constructor(propEval: Formula, initialModel: ExplicitEpistemicModel) {
        super();
        this.propEval = propEval;
        this.initialModel = initialModel;
    }

    async isApplicableIn(): Promise<boolean> {

        return Promise.resolve(this.initialModel.hasPossibleWorld(this.propEval));
    }

    /**
     * Applies the set propositions to the initial model. Does not update the current model.
     * @param M (unused) the current model.
     */
    apply(): ExplicitEpistemicModel {

        // Update the pointed world to reflect new information
        // This could benefit from memoization (pointed world is already calculated during 'isApplicableIn'
        this.initialModel.setPointedWorld(this.propEval);

        return super.apply(this.initialModel);
    }


    static getActionModelNewInformation(initialModel: ExplicitEpistemicModel, formula: Formula, agent: string) {
        var E = new ExplicitFilterEventModel(formula, initialModel);

        // Create nodes that match the formula
        E.addAction('e', formula);

        // Nodes that do not match the formula
        E.addAction('f', new NotFormula(formula));

        // Only create edges for worlds that belong together
        E.addEdge(agent, 'e', 'e');
        E.addEdge(agent, 'f', 'f');

        // Point to the action where formula is true
        E.setPointedAction('e');
        return E;
    }


}


