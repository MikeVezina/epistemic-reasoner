import {ExplicitSuccessorSet} from './explicit-successor-set';
import * as types from './../formula/formula';
import {EpistemicModel} from './epistemic-model';
import {World} from './world';
import {SuccessorSet} from './successor-set';
import {Valuation} from './valuation';
import {CustomWorld} from '../../../../models/CustomWorld';
import {JasonAgentDescription} from '../../../../models/JasonAgentDescription';
import {AndFormula, AtomicFormula, Formula, NotFormula, TrueFormula} from './../formula/formula';
import {TemporalEpistemicModel} from './temporal-epistemic-model';
import {WorldValuation} from './world-valuation';
import {ExplicitEpistemicModel} from './explicit-epistemic-model';
import {AgentExplicitEpistemicModel} from './agent-explicit-epistemic-model';

/**
 * A class that optimizes on an single Jason agent's epistemic model.
 * We only need to store the Worlds, since it is assumed that all worlds are contained worlds are indistinguishable.
 *
 */
export class ExplicitTemporalEpistemicModel extends AgentExplicitEpistemicModel implements TemporalEpistemicModel {

    yesterdayModel: ExplicitTemporalEpistemicModel;


    getYesterday(): TemporalEpistemicModel {
        return this.yesterdayModel;
    }

    getYesterdayExplicit(): ExplicitTemporalEpistemicModel {
        return this.yesterdayModel;
    }


    /**
     * @param w world identifier
     * @param phi a formula (internal representation of a formula)
     * @returns true if formula phi is true in w
     * @example M.modelCheck("w", createFormula("(not p)"))
     * @example M.modelCheck("w", createFormula("(not (K a p))"))
     * */
    modelCheck(w: string, phi: types.Formula): boolean {
        if (this.getWorld(w) == undefined) {
            throw ('No worlds named ' + w + '. Worlds of the epistemic model are '
                + this.getWorldsPrettyPrint());
        }

        switch (true) {
            case (phi instanceof types.TrueFormula):
                return true;
            case (phi instanceof types.AtomicFormula):
                return this.getWorld(w).modelCheck((<types.AtomicFormula> phi).getAtomicString());
            case (phi instanceof types.FalseFormula):
                return false;
            case (phi instanceof types.ImplyFormula):
                return !this.modelCheck(w, (<types.ImplyFormula> phi).formula1) || this.modelCheck(w, (<types.ImplyFormula> phi).formula2);
            case (phi instanceof types.EquivFormula):
                return this.modelCheck(w, (<types.EquivFormula> phi).formula1) == this.modelCheck(w, (<types.EquivFormula> phi).formula2);
            case (phi instanceof types.AndFormula):
                return (<types.AndFormula> phi).formulas.every((f) => this.modelCheck(w, f));
            case (phi instanceof types.OrFormula):
                return (<types.OrFormula> phi).formulas.some((f) => this.modelCheck(w, f));
            case (phi instanceof types.XorFormula): {
                let c = 0;
                for (let f of (<types.XorFormula> phi).formulas) {
                    if (this.modelCheck(w, f)) {
                        c++;
                    }

                    if (c > 1) {
                        return false;
                    }
                }
                return (c == 1);
            }
            case (phi instanceof types.NotFormula):
                return !this.modelCheck(w, (<types.NotFormula> phi).formula);
            case (phi instanceof types.YFormula): {
                let phi2 = <types.YFormula> phi;
                let psi = phi2.formula;

                // If there is no yesterday, return false.
                if (this.getYesterdayExplicit() === undefined)
                    return false;

                return this.getYesterdayExplicit().checkSync(psi);

            }
            case (phi instanceof types.KFormula): {
                let phi2 = <types.KFormula> phi;
                let agent = phi2.agent;
                let psi = phi2.formula;
                let start = Date.now();

                let val = this.getSuccessorsID(w, agent)
                    .every(u => {
                        return this.modelCheck(u, psi);
                    });
                let delta = Date.now() - start;
                // console.log(delta)
                return val;
                // return this.getSuccessorsID(w, agent)
                //     .every(u => this.modelCheck(u, psi));
            }
            case (phi instanceof types.KposFormula): {
                let phi2 = <types.KposFormula> phi;
                let agent = phi2.agent;
                let psi = phi2.formula;
                let start = Date.now();
                let val = !this.getSuccessorsID(w, agent)
                    .every(u => {
                        return !this.modelCheck(u, psi);
                    });
                let delta = Date.now() - start;

                // console.log(delta)
                return val;
                // return this.getSuccessorsID(w, agent)
                //     .some(u => this.modelCheck(u, psi));
            }
            case (phi instanceof types.KwFormula): {
                let phi2 = <types.KwFormula> phi;
                let agent = phi2.agent;
                let psi = phi2.formula;
                if (this.getSuccessorsID(w, agent)
                    .every(u => this.modelCheck(u, psi))) {
                    return true;
                } else if (this.getSuccessorsID(w, agent)
                    .every(u => !this.modelCheck(u, psi))) {
                    return true;
                } else {
                    return false;
                }
            }
            case (phi instanceof types.ExactlyFormula): {
                let c = 0;
                for (let s of (<types.ExactlyFormula> phi).variables) {
                    if (this.getWorld(w).modelCheck(s)) {
                        c += 1;
                    }
                }
                return (c == (<types.ExactlyFormula> phi).count);
            }
        }
    }

    public static createUpdateFormula(propValues: { [id: string]: boolean }): Formula {
        // Create AND (with true formula, just in case no other prop values)
        let fullFormula = new AndFormula([new TrueFormula()]);

        for (let nextProp of Object.keys(propValues)) {
            // Whether or not the prop should be true/false
            let propVal = propValues[nextProp];
            let atomicFormula: Formula = new AtomicFormula(nextProp);

            // If prop valuation is false, wrap with the Not formula.
            if (!propVal) {
                atomicFormula = new NotFormula(atomicFormula);
            }

            fullFormula.formulas.push(atomicFormula);
        }

        return fullFormula;
    }


}
