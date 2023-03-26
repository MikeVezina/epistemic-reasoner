import {
    AndFormula,
    AtomicFormula,
    EquivFormula,
    FalseFormula,
    Formula,
    ImplyFormula,
    KFormula, KposFormula,
    NotFormula,
    OrFormula,
    TrueFormula
} from './formula';
import {Postcondition} from '../eventmodel/postcondition';
import {TrivialPostcondition} from '../eventmodel/trivial-postcondition';
import {PropositionalAssignmentsPostcondition} from '../eventmodel/propositional-assignments-postcondition';
import {AgentPropositionalAssignmentsPostcondition} from '../eventmodel/agent-propositional-assignments-postcondition';
import {Environment} from '../environment/environment';
import {CustomEnvironment} from '../../../../models/CustomEnvironment';
import {JasonAgentEnvironment} from '../../../../models/JasonAgentEnvironment';
import {CustomDescription} from '../../../../models/CustomDescription';

export function constraintsToFormula(constraintsArr): Formula[] {
    if (!constraintsArr || constraintsArr.length === 0) {
        return undefined;
    }

    let formulas = [];

    for (let c of constraintsArr) {
        formulas.push(parseFormulaFromConstraint(c));
    }

    return formulas;
}

function parsePropFromConstraint(constraint): AtomicFormula | TrueFormula | FalseFormula {

    if (constraint.prop === 'true') {
        return new TrueFormula();
    }

    if (constraint.prop === 'false') {
        return new FalseFormula();
    }

    return new AtomicFormula(constraint.prop);
}

function parseNotFromConstraint(constraint): NotFormula {
    let inner = parseFormulaFromConstraint(constraint.formula);
    return new NotFormula(inner);
}

function parseAndFromConstraint(constraint): AndFormula {
    let formulas = [];
    for (let form of constraint.formulas) {
        formulas.push(parseFormulaFromConstraint(form));
    }

    return new AndFormula(formulas);
}

function parseOrFromConstraint(constraint): OrFormula {
    let formulas = [];
    for (let form of constraint.formulas) {
        formulas.push(parseFormulaFromConstraint(form));
    }

    return new OrFormula(formulas);
}

function parseImpliesFromConstraint(constraint): ImplyFormula {
    let antecedent = parseFormulaFromConstraint(constraint.antecedent);
    let consequent = parseFormulaFromConstraint(constraint.consequent);
    return new ImplyFormula(antecedent, consequent);
}

function parseEquivFromConstraint(constraint): EquivFormula {
    let antecedent = parseFormulaFromConstraint(constraint.antecedent);
    let consequent = parseFormulaFromConstraint(constraint.consequent);
    return new EquivFormula(antecedent, consequent);
}

export function parsePostFromRequest(post): Postcondition {
    let postKeys = Object.keys(post);

    let propAssign: { [prop: string]: (string | Formula) } = {};

    if (!postKeys || postKeys.length === 0) {
        return new AgentPropositionalAssignmentsPostcondition(propAssign);
    }

    for (let prop of postKeys) {
        // let prop = postKeys[i];
        let constraint = post[prop];
        propAssign[prop] = parseFormulaFromConstraint(constraint);
    }

    return new AgentPropositionalAssignmentsPostcondition(propAssign);
}

function parseModalFromConstraint(constraint) {
    let inner = parseFormulaFromConstraint(constraint.formula);

    if(constraint.modal === "know")
        return new KFormula(CustomDescription.DEFAULT_AGENT, inner);
    if(constraint.modal === "poss")
        return new KposFormula(CustomDescription.DEFAULT_AGENT, inner);

    throw new Error("unknown formula");
}

export function parseFormulaFromConstraint(constraint): Formula {
    if (!constraint) {
        return undefined;
    }

    let type: string = constraint.type;

    switch (type) {
        case 'prop':
            return parsePropFromConstraint(constraint);
        case 'not':
            return parseNotFromConstraint(constraint);
        case 'and':
            return parseAndFromConstraint(constraint);
        case 'or':
            return parseOrFromConstraint(constraint);
        case 'implies':
            return parseImpliesFromConstraint(constraint);
        case 'equiv':
            return parseEquivFromConstraint(constraint);
        case 'modal':
            return parseModalFromConstraint(constraint);
        default:
            console.log('Invalid formula type: ' + type);
            return undefined;
    }
}

