import {ExplicitEpistemicModel} from '../epistemicmodel/explicit-epistemic-model';

import {
    AndFormula, AtomicFormula, Formula,
    NotFormula, TrueFormula
} from '../formula/formula';
import {ExplicitEventModel} from './explicit-event-model';
import {Valuation} from '../epistemicmodel/valuation';

export class ExplicitFilterEventModel extends ExplicitEventModel {

    readonly propEval: Valuation;
    readonly initialModel: ExplicitEpistemicModel;

    constructor(propEval: Valuation, initialModel: ExplicitEpistemicModel) {
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


    static getActionModelNewInformation(initialModel: ExplicitEpistemicModel, propEval: Valuation | string[], agent: string) {
        if (propEval instanceof Array)
            propEval = new Valuation(propEval);

        var E = new ExplicitFilterEventModel(propEval, initialModel);

        let formula = ExplicitFilterEventModel.createFormulaFromValuation(propEval);

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

    /**
     * Creates an And formula from a valuation. i.e. if valuation = {p: true, q: false} then the formula will be:
     * And(p, Not(q)). If no propositions exist in the valuation, a TrueFormula will be returned.
     * @param propEval
     */
    private static createFormulaFromValuation(propEval: Valuation): AndFormula | TrueFormula {
        // Create array of atomic props
        let atomicProps: Formula[] = [];

        let propMap = propEval.getPropositionMap();

        if (!propMap || Object.keys(propMap).length == 0)
            return new TrueFormula();

        for (let propKey of Object.keys(propMap))
        {
            // Whether or not the prop should be true/false
            let propVal = propMap[propKey];

            let atomicFormula: Formula = new AtomicFormula(propKey);

            // If prop valuation is false, wrap with the Not formula.
            if (!propVal)
                atomicFormula = new NotFormula(atomicFormula);

            atomicProps.push(atomicFormula);
        }

        return new AndFormula(atomicProps);
    }


}


