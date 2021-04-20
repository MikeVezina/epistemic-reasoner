import {ExplicitSuccessorSet} from './explicit-successor-set';
import * as types from './../formula/formula';
import {World} from './world';
import {SuccessorSet} from './successor-set';
import {Valuation} from './valuation';
import {CustomWorld} from '../../../../models/CustomWorld';
import {JasonAgentDescription} from '../../../../models/JasonAgentDescription';
import {ExplicitEpistemicModel} from './explicit-epistemic-model';
import {CustomDescription} from '../../../../models/CustomDescription';

/**
 * A class that optimizes on an single Jason agent's epistemic model.
 * We only need to store the Worlds, since it is assumed that all worlds are contained worlds are indistinguishable.
 *
 */
export class AgentExplicitEpistemicModel extends ExplicitEpistemicModel {

    // Determines whether the model should optimize creation operations by not using edges. (S5 models only)
    private readonly _optimize: boolean;

    // Duplicate storage of world names for quick access to successor array (quick hack for optimizing time complexity)
    worldSet: Set<World> = new Set<World>();
    worldArray: Array<World> = new Array<World>();

    worldNamesSet: Set<string> = new Set<string>();
    worldNamesArray: Array<string> = new Array<string>();

    constructor(optimize: boolean = true) {
        super();
        this._optimize = optimize;
    }

    public get optimize(): boolean {
        return this._optimize;
    }


    getPointedWorld(): World {
        return this.getWorld(this.getPointedWorldID());
    }

    getAgents(): string[] {
        return [JasonAgentDescription.DEFAULT_AGENT];
    }

    check(formula: types.Formula): Promise<boolean> {
        return Promise.resolve(this.checkSync(formula));
    }

    isLoaded(): boolean {
        return true;
    }

    /**
     * Adds a world to the model
     * @param w
     * @param content
     */
    public addWorld(w: string, content: World) {
        if (!this.optimize) {
            return super.addWorld(w, content);
        }

        if (w in this.nodes) {
            throw 'World ' + w + ' already exists.';
        }

        this.addNode(w, content);
    }

    checkSync(propEval: types.Formula) {
        return this.modelCheck(this.getPointedWorldID(), propEval);
    }


    getSuccessors(w: World, a: string): SuccessorSet {
        if (!this.optimize) {
            return super.getSuccessors(w, a);
        }

        return new ExplicitSuccessorSet(this.worldArray);
    }

    getNumberWorlds(): Number {
        if (!this.optimize) {
            return super.getNumberWorlds();
        }

        return this.worldNamesArray.length;
    }

    /**
     * With a real model, we would have WxW edges. However, we don't need to actually store those edges. This returns the number
     * of edges required with a real model
     */
    getNumberFalseEdges(): Number {
        if (!this.optimize) {
            return 0;
        }

        return this.worldArray.length * this.worldArray.length;
    }


    getNodes(): { [p: string]: object } {
        return super.getNodes();
    }

    /**
     * Return all worlds as successors. This assumption provides optimizations
     * for our agent since we no longer have to iterate all worlds to create the indistinguishability relation.
     * (Recall that for our agents, all current possible worlds are indistinguishable)
     */
    getSuccessorsID(node, agent): Array<string> {
        if (!this.optimize) {
            return super.getSuccessorsID(node, agent);
        }

        return this.worldNamesArray;
    }

    /**
     * Return an arbitrary pointed world ID, since it doesn't really matter which one we choose
     */
    getPointedWorldID() {
        if (this.getNumberWorlds() === 0) {
            return;
        }

        if (!this.optimize) {
            return Object.keys(this.nodes)[0];
        }

        return this.worldNamesArray[0];
    }

    setNodes(nodes: any): void {

        // Do not return after super call so that the data structures in this class are still reflective of model
        if (!this.optimize) {
            super.setNodes(nodes);
        }


        this.nodeToID = new Map<World, string>();
        this.nodes = {};

        this.worldSet = new Set<World>();
        this.worldArray = new Array<World>();

        this.worldNamesSet = new Set<string>();
        this.worldNamesArray = new Array<string>();

        for (let node of Object.keys(nodes)) {
            let world = new CustomWorld(new Valuation(nodes.get(node).valuation.propositions));
            this._addNode(node, world);
        }
    }

    public getWorld(w: string): World {
        if (!this.optimize) {
            return <World> super.getNode(w);
        }

        return <World> this.nodes[w];
    }

    public addNode(w: string, content: World) {
        if (!this.optimize) {
            return super.addNode(w, content);
        }

        this._addNode(w, content);
    }

    private _addNode(w: string, content: World) {
        this.nodeToID.set(content, w);
        this.nodes[w] = content;

        this.worldSet.add(content);
        this.worldArray.push(content);

        this.worldNamesSet.add(w);
        this.worldNamesArray.push(w);
    }

    getWorlds(): World[] {
        return this.worldArray;
    }


    getNumberEdges(): Number {
        if (!this.optimize) {
            return super.getNumberEdges();
        }

        return this.getNumberFalseEdges();
    }

    getNodesNumber(): number {
        if (!this.optimize) {
            return super.getNodesNumber();
        }

        return this.worldArray.length;
    }

    getNode(idnode: string): object {
        if (!this.optimize) {
            return super.getNode(idnode);
        }

        return this.nodes[idnode];
    }

    hasNode(idnode: string): boolean {
        if (!this.optimize) {
            return super.hasNode(idnode);
        }

        return idnode in this.nodes;
    }

    addEdge(agent, idsource, iddestination) {
        if (!this.optimize) {
            return super.addEdge(agent, idsource, iddestination);
        }

        // Otherwise do nothing :)
    }


    isEdge(agent, idsource, iddestination): boolean {
        return super.isEdge(agent, idsource, iddestination);
    }

    bulkAddEdges(agent?) {
        if (!this.optimize)
            return super.bulkAddEdges(agent);
    }

    getWorldNames(): string[] {
        if (!this.optimize) {
            return Object.keys(this.nodes);
        }

        return this.worldNamesArray;
    }
}
