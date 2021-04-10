import {ExplicitSuccessorSet} from './explicit-successor-set';
import * as types from './../formula/formula';
import {EpistemicModel} from './epistemic-model';
import {World} from './world';
import {SuccessorSet} from './successor-set';
import {Valuation} from './valuation';
import {CustomWorld} from '../../../../models/CustomWorld';
import {JasonAgentDescription} from '../../../../models/JasonAgentDescription';
import {AndFormula, AtomicFormula, Formula, NotFormula, TrueFormula} from './../formula/formula';

/**
 * A class that optimizes on an single Jason agent's epistemic model.
 * We only need to store the Worlds, since it is assumed that all worlds are contained worlds are indistinguishable.
 *
 */
export class AgentExplicitEpistemicModel implements EpistemicModel {
    nodeToID: Map<World, string> = new Map();
    nodes: Map<string, World> = new Map();

    // Duplicate storage of world names for quick access to successor array (quick hack for optimizing time complexity)
    worldSet: Set<World> = new Set<World>();
    worldArray: Array<World> = new Array<World>();

    worldNamesSet: Set<string> = new Set<string>();
    worldNamesArray: Array<string> = new Array<string>();

    getPointedWorld(): World {
        return this.getWorld(this.getPointedWorldID());
    }

    getAgents(): string[] {
        return [JasonAgentDescription.DEFAULT_AGENT];
    }

    getSuccessors(w: World, a: string): SuccessorSet {
        throw new ExplicitSuccessorSet(this.worldArray);
    }

    check(formula: types.Formula): Promise<boolean> {
        return Promise.resolve(this.checkSync(formula));
    }

    isLoaded(): boolean {
        return true;
    }

    getNumberWorlds(): Number {
        return this.worldNamesArray.length;
    }

    /**
     * Returns the true number of edges in the model
     */
    getNumberEdges(): Number {
        return 0;
    }

    /**
     * With a real model, we would have WxW edges. However, we don't need to actually store those edges. This returns the number
     * of edges required with a real model
     */
    getNumberFalseEdges(): Number {
        return this.worldArray.length * this.worldArray.length;
    }

    /**
     * Adds a world to the model
     * @param w
     * @param content
     */
    public addWorld(w: string, content: World) {
        if (this.nodes.has(w)) {
            throw 'World ' + w + ' already exists.';
        }

        this.addNode(w, content);
        // console.log('nodeToID contains ' + this.nodeToID.size + ' elements');
    }


    /**
     @returns a string that represents the list of node IDs
     */
    getWorldsPrettyPrint() {
        let s = '';

        for (let w of this.worldNamesArray) {
            s += w + ', ';
        }

        s += '...';

        return s;

    }

    /**
     * Return all worlds as successors. This assumption provides optimizations
     * for our agent since we no longer have to iterate all worlds to create the indistinguishability relation.
     * (Recall that for our agents, all current possible worlds are indistinguishable)
     */
    getSuccessorsID(node, agent): Array<string> {
        return this.worldNamesArray;
    }

    /**
     * Return an arbitrary pointed world ID, since it doesn't really matter which one we choose
     */
    getPointedWorldID() {
        if (this.getNumberWorlds() === 0) {
            return;
        }

        return this.worldNamesArray[0];
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
            case (phi instanceof types.KFormula): {
                let phi2 = <types.KFormula> phi;
                let agent = phi2.agent;
                let psi = phi2.formula;
                return this.getSuccessorsID(w, agent)
                    .every(u => this.modelCheck(u, psi));
            }
            case (phi instanceof types.KposFormula): {
                let phi2 = <types.KposFormula> phi;
                let agent = phi2.agent;
                let psi = phi2.formula;
                return this.getSuccessorsID(w, agent)
                    .some(u => this.modelCheck(u, psi));
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


    setNodes(nodes: any) {
        this.nodeToID = new Map<World, string>();
        this.nodes = new Map<string, World>();

        this.worldSet = new Set<World>();
        this.worldArray = new Array<World>();

        this.worldNamesSet = new Set<string>();
        this.worldNamesArray = new Array<string>();

        for (let node of Object.keys(nodes)) {
            let world = new CustomWorld(new Valuation(nodes.get(node).valuation.propositions));
            this.addWorld(node, world);
        }
    }

    public getWorld(w: string): World {
        return this.nodes.get(w);
    }

    private addNode(w: string, content: World) {
        this.nodeToID.set(content, w);
        this.nodes.set(w, content);

        this.worldSet.add(content);
        this.worldArray.push(content);

        this.worldNamesSet.add(w);
        this.worldNamesArray.push(w);
    }

    getWorlds(): Set<World> {
        return this.worldSet;
    }

    getWorldNames() {
        return this.worldNamesArray;
    }

    checkSync(propEval: types.Formula) {
        return this.modelCheck(this.getPointedWorldID(), propEval);
    }

}
