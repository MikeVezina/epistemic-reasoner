import {ExplicitEpistemicModel} from './app/modules/core/models/epistemicmodel/explicit-epistemic-model';
import * as express from 'express';
import {Valuation} from './app/modules/core/models/epistemicmodel/valuation';
import {ExampleDescription} from './app/modules/core/models/environment/exampledescription';
import {EpistemicModel} from './app/modules/core/models/epistemicmodel/epistemic-model';
import {ExplicitEventModel} from './app/modules/core/models/eventmodel/explicit-event-model';
import {EventModelAction} from './app/modules/core/models/environment/event-model-action';
import {WorldValuation} from './app/modules/core/models/epistemicmodel/world-valuation';
import {FormulaFactory} from './app/modules/core/models/formula/formula';
import {Environment} from './app/modules/core/models/environment/environment';

class CustomWorld extends WorldValuation {
    constructor(valuation: Valuation) {
        super(valuation);
    }

}


class CustomDescription extends ExampleDescription {

    private actions: EventModelAction[] = [];
    private atomicPropositions: string[];
    private name: string;
    private rawData: any;

    constructor(data: any) {
        super();
        this.rawData = data;
        this.name = data.name;
        this.atomicPropositions = data.propositions;

        // Parse the actions
        this.parseActions(data.actions);

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

    getInitialEpistemicModel(): EpistemicModel {
        return this.parseModel();
    }

    getName() {
        return this.name;
    }

    private parseActions(rawActions: any[]) {

        // Iterate through the actions and create new events/actions from the raw data
        // For now, this only supports public announcements. This could be improved through a factory method.
        for (let {description, formula} of rawActions) {
            let parsedFormula = FormulaFactory.createFormula(formula);



            this.actions.push(new EventModelAction({
                name: description,
                eventModel: ExplicitEventModel.getEventModelPublicAnnouncement(parsedFormula, this.getAgents())
            }));

        }
    }

    getAgents(): string[] {
        return this.getInitialEpistemicModel().getAgents();
    }

    private parseModel(): ExplicitEpistemicModel {
        let {worlds, edges, pointedWorld} = this.rawData.epistemicModel;
        let epistemicModel = new ExplicitEpistemicModel();


        for (let {name, props} of worlds) {
            epistemicModel.addWorld(name, new CustomWorld(new Valuation(props)));
        }

        for (let {agentName, worldOne, worldTwo} of edges) {
            epistemicModel.addEdge(agentName, worldOne, worldTwo);
        }

        epistemicModel.setPointedWorld(pointedWorld);
        epistemicModel.removeUnReachablePartFrom(pointedWorld);

        return epistemicModel;
    }
}

export class ApiRouter {

    createApp(app: express.Application): any {

        let curDescription: CustomDescription;
        let curEnvironment: Environment;

        app.post('/api/createWorld', async function(req, res: express.Response) {
            let data = req.body;

            curDescription = new CustomDescription(data);
            curEnvironment = new Environment(curDescription);

            res.end();
        });

        // curEnvironment.getExecutableActions()

        app.get('/api/actions', async function(req, res: express.Response) {
            if (!curEnvironment) {
                res.send('No Environment.');
                return;
            }

            res.send(JSON.stringify(curEnvironment.getExecutableActions().map(value => value.getName())));
        });

        app.post('/api/modelCheck', async function (req, res) {
            if (!curEnvironment) {
                res.send('No Environment.');
                return;
            }

            let formula = req.body.formula;
            let parsedFormula = FormulaFactory.createFormula(formula);


            let result = await curEnvironment.getEpistemicModel().check(parsedFormula);


            res.send({result});
        });

        app.post('/api/performAction', async function(req, res) {
            if (!curEnvironment) {
                res.send('No Environment.');
                return;
            }
            let action = req.body.action;

            let matchedActions = curEnvironment.getExecutableActions().filter(a => a.getName() === action);

            if(matchedActions.length != 1)
                return res.send("Invalid action. Matched Actions: " + JSON.stringify(matchedActions));

            let execActions = await curEnvironment.performAsync(matchedActions[0]);
            res.send(JSON.stringify(execActions.map(value => value.getName())));

        });



    }
};
