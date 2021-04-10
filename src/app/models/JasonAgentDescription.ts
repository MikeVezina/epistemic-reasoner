import {ExampleDescription} from '../modules/core/models/environment/exampledescription';
import {EventModelAction} from '../modules/core/models/environment/event-model-action';
import {ExplicitEpistemicModel} from '../modules/core/models/epistemicmodel/explicit-epistemic-model';
import {FormulaFactory} from '../modules/core/models/formula/formula';
import {ExplicitEventModel} from '../modules/core/models/eventmodel/explicit-event-model';
import {Valuation} from '../modules/core/models/epistemicmodel/valuation';
import {CustomWorld} from './CustomWorld';
import {AgentExplicitEpistemicModel} from '../modules/core/models/epistemicmodel/agent-explicit-epistemic-model';
import {watch} from 'fs';
import {WorldValuation} from '../modules/core/models/epistemicmodel/world-valuation';

export class JasonAgentDescription extends ExampleDescription {

    private atomicPropositions: string[];
    private name: string;
    private rawData: any;
    private readonly initialModel: AgentExplicitEpistemicModel;
    public static readonly DEFAULT_AGENT: string = 'a';

    /**
     * Raw Data Format/ Informal Grammar:
     *
     * rawData := {
     *      name: String?,
     *
     *
     *      epistemicModel : {
     *         worlds: World[]
     *      }
     * }
     *
     * World := {
     *      name: String,
     *      props: String[]
     * }
     *
     *
     * @param data The raw data JS object.
     */
    constructor(data: any) {
        super();

        this.rawData = data;

        // If we are importing from serialized description
        if (data.rawData) {
            this.rawData = data.rawData;
            this.initialModel = this.loadModel(data);
        }


        // Optional Name
        this.name = data.name || 'DefaultName';

        // Optional propositions
        this.atomicPropositions = this.generatePropositions();

        this.initialModel = this.parseModel();

        var e = new ExplicitEpistemicModel();


    }


    private loadModel(data: any): AgentExplicitEpistemicModel {

        // Load initial model directly.
        let curModel = new AgentExplicitEpistemicModel();
        let oldModel = data.initialModel;

        curModel.setNodes(oldModel.nodes);

        return curModel;
    }

    /**
     * Used to generate the list of propositions if they are not explicitly provided in the raw data. Iterates through all worlds and adds propositions to a set.
     */
    private generatePropositions(): string[] {
        let propSet = [];

        for (let {props} of this.getRawWorlds()) {
            for (let prop of props) {
                propSet.push(prop);
            }
        }

        return propSet;
    }

    // No actions needed
    getActions() {
        return [];
    }

    getAtomicPropositions(): string[] {
        if (this.atomicPropositions.length === 0)
        {
            let propSet = new Set()
            for (let world of Array.from(this.initialModel.getWorlds()))
            {
                let valW = <WorldValuation> world;
                for (let prop of Object.keys(valW.valuation.propositions))
                    propSet.add(prop)
            }

            this.atomicPropositions = <string[]> Array.from(propSet);
        }



        return this.atomicPropositions;
    }


    getDescription(): string[] {
        return ["A Jason Agent's Description"];
    }

    getInitialEpistemicModel(): AgentExplicitEpistemicModel {
        return this.parseModel();
    }

    getName() {
        return this.name;
    }


    getAgents(): string[] {
        return this.getInitialEpistemicModel().getAgents();
    }

    private getRawModel() {
        return this.rawData.initialModel;
    }


    private getRawWorlds() {
        return this.getRawModel().worlds;
    }

    private parseModel(): AgentExplicitEpistemicModel {
        if (this.initialModel)
            return this.initialModel;

        let startTime = Date.now();

        let {worlds} = this.getRawModel();
        let epistemicModel = new AgentExplicitEpistemicModel();


        for (let {name, props} of worlds) {
            epistemicModel.addWorld(name, new CustomWorld(new Valuation(props)));
        }

        console.log("Model Parse Time: " + (Date.now() - startTime));

        return epistemicModel;
    }

    valueOf(): Object {
        return super.valueOf();
    }
}
