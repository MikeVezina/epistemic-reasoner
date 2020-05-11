import {ExampleDescription} from '../modules/core/models/environment/exampledescription';
import {EventModelAction} from '../modules/core/models/environment/event-model-action';
import {ExplicitEpistemicModel} from '../modules/core/models/epistemicmodel/explicit-epistemic-model';
import {EpistemicModel} from '../modules/core/models/epistemicmodel/epistemic-model';
import {FormulaFactory} from '../modules/core/models/formula/formula';
import {ExplicitEventModel} from '../modules/core/models/eventmodel/explicit-event-model';
import {Valuation} from '../modules/core/models/epistemicmodel/valuation';
import {CustomWorld} from './CustomWorld';
import {ExplicitFilterEventModel} from '../modules/core/models/eventmodel/explicit-filter-event-model';

export class CustomDescription extends ExampleDescription {

    private actions: EventModelAction[] = [];
    private atomicPropositions: string[];
    private name: string;
    private rawData: any;
    private readonly initialModel: ExplicitEpistemicModel;
    public static readonly DEFAULT_AGENT: string = 'a';

    /**
     * Raw Data Format/ Informal Grammar:
     *
     * rawData := {
     *      name: String?,
     *
     *      propositions: String[]?,
     *
     *      epistemicModel : {
     *         worlds: World[],
     *         edges: Edge[]?,
     *         pointedWorld: String?
     *      },
     *
     *      actions: Action[]?
     * }
     *
     * World := {
     *      name: String,
     *      props: String[]
     * }
     *
     * Edge := {
     *      agentName: String,
     *      worldOne: String,
     *      worldTwo: String
     * }
     *
     * Action := {
     *     description: String,
     *     formula: String
     * }
     *
     * @param data The raw data JS object.
     */
    constructor(data: any) {
        super();
        this.rawData = data;

        // Optional Name
        this.name = data.name || 'DefaultName';

        // Optional propositions
        this.atomicPropositions = data.propositions || this.generatePropositions();

        this.initialModel = this.parseModel()

        // Parse the actions
        this.parseActions(data.actions);

    }


    /**
     * Used to generate the list of propositions if they are not explicitly provided in the raw data. Iterates through all worlds and adds propositions to a set.
     */
    private generatePropositions(): Set<String> {
        let propSet = new Set<String>();

        for (let {props} of this.getRawWorlds()) {
            for (let prop of props) {
                propSet.add(prop);
            }
        }

        return propSet;
    }

    getActions() {
        return this.actions;
    }

    getAtomicPropositions(): string[] {
        return this.atomicPropositions;
    }

    getDescription(): string[] {
        return [];
    }


    getInitialEpistemicModel(): ExplicitEpistemicModel {
        return this.parseModel();
    }

    getName() {
        return this.name;
    }

    private parseActions(rawActions: any[]) {

        if (!rawActions) {
            return;
        }

        // Iterate through the actions and create new events/actions from the raw data
        // For now, this only supports public announcements. This could be improved through a factory method.
        for (let {description, formula} of rawActions) {
            let parsedFormula = FormulaFactory.createFormula(formula);

            this.actions.push(new EventModelAction({
                name: description,
                eventModel: ExplicitEventModel.getEventModelPublicAnnouncement(parsedFormula)
            }));

        }
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


    private parseModel(): ExplicitEpistemicModel {
        let {worlds, edges, pointedWorld} = this.getRawModel();
        let epistemicModel = new ExplicitEpistemicModel();


        for (let {name, props} of worlds) {
            epistemicModel.addWorld(name, new CustomWorld(new Valuation(props)));
        }

        if (edges) {
            for (let {agentName, worldOne, worldTwo} of edges) {
                epistemicModel.addEdge(agentName, worldOne, worldTwo);
            }
        } else {
            // Add edges to all nodes
            epistemicModel.addEdgeIf(CustomDescription.DEFAULT_AGENT, (() => true));
        }


        // No initial props?
        // todo add initial props?
        let initialProps = [];
        epistemicModel.setPointedWorld(pointedWorld || initialProps);

        return epistemicModel;
    }

    valueOf(): Object {
        return super.valueOf();
    }
}
