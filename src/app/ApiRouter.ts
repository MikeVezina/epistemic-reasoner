import * as express from 'express';
import {CustomDescription} from './models/CustomDescription';
import {CustomEnvironment} from './models/CustomEnvironment';
import {Valuation} from './modules/core/models/epistemicmodel/valuation';
import {ExampleDescription} from './modules/core/models/environment/exampledescription';
import {ExplicitEpistemicModel} from './modules/core/models/epistemicmodel/explicit-epistemic-model';


function createRaw(): object {
    return {
        "initialModel": {
        "worlds": [
            {
                "name": "w1AA_2AA_3EE",
                "props": [
                    "1AA",
                    "2AA",
                    "3EE"
                ]
            },
            {
                "name": "w1AA_2AE_3AE",
                "props": [
                    "1AA",
                    "2AE",
                    "3AE"
                ]
            },
            {
                "name": "w1AA_2AE_3EE",
                "props": [
                    "1AA",
                    "2AE",
                    "3EE"
                ]
            },
            {
                "name": "w1AA_2EE_3AA",
                "props": [
                    "1AA",
                    "2EE",
                    "3AA"
                ]
            },
            {
                "name": "w1AA_2EE_3AE",
                "props": [
                    "1AA",
                    "2EE",
                    "3AE"
                ]
            },
            {
                "name": "w1AA_2EE_3EE",
                "props": [
                    "1AA",
                    "2EE",
                    "3EE"
                ]
            },
            {
                "name": "w1AE_2AA_3AE",
                "props": [
                    "1AE",
                    "2AA",
                    "3AE"
                ]
            },
            {
                "name": "w1AE_2AA_3EE",
                "props": [
                    "1AE",
                    "2AA",
                    "3EE"
                ]
            },
            {
                "name": "w1AE_2AE_3AA",
                "props": [
                    "1AE",
                    "2AE",
                    "3AA"
                ]
            },
            {
                "name": "w1AE_2AE_3AE",
                "props": [
                    "1AE",
                    "2AE",
                    "3AE"
                ]
            },
            {
                "name": "w1AE_2AE_3EE",
                "props": [
                    "1AE",
                    "2AE",
                    "3EE"
                ]
            },
            {
                "name": "w1AE_2EE_3AA",
                "props": [
                    "1AE",
                    "2EE",
                    "3AA"
                ]
            },
            {
                "name": "w1AE_2EE_3AE",
                "props": [
                    "1AE",
                    "2EE",
                    "3AE"
                ]
            },
            {
                "name": "w1EE_2AA_3AA",
                "props": [
                    "1EE",
                    "2AA",
                    "3AA"
                ]
            },
            {
                "name": "w1EE_2AA_3AE",
                "props": [
                    "1EE",
                    "2AA",
                    "3AE"
                ]
            },
            {
                "name": "w1EE_2AA_3EE",
                "props": [
                    "1EE",
                    "2AA",
                    "3EE"
                ]
            },
            {
                "name": "w1EE_2AE_3AA",
                "props": [
                    "1EE",
                    "2AE",
                    "3AA"
                ]
            },
            {
                "name": "w1EE_2AE_3AE",
                "props": [
                    "1EE",
                    "2AE",
                    "3AE"
                ]
            },
            {
                "name": "w1EE_2EE_3AA",
                "props": [
                    "1EE",
                    "2EE",
                    "3AA"
                ]
            }
        ]
    }
    };
}

export class ApiRouter {

    createApp(app: express.Application): any {

        let curEnvironment: CustomEnvironment;

        // Lets just initialize curEnvironment for now...
        let rawData = createRaw();
        curEnvironment = new CustomEnvironment(new CustomDescription(rawData));
        curEnvironment.getEpistemicModel().setPointedWorld(new Valuation([]));

        /**
         * POST /api/world
         *
         * Create a model with the provided CustomDescription.
         * See the CustomDescription constructor.
         *
         * Input: CustomDescription
         * Output: None.
         */
        app.post('/api/model', async function(req, res: express.Response) {
            let data = req.body;
            let props = req.body.props || [];

            let curDescription = new CustomDescription(data);
            curEnvironment = new CustomEnvironment(curDescription);

            // Set the pointed world
            let valuation = new Valuation(props);
            curEnvironment.getEpistemicModel().setPointedWorld(valuation)

            res.end();
        });


        app.get('/api/model', async function(req, res) {
            if (!curEnvironment)
                return res.send({error: 'No Environment.'});

            let resultObject: any = {};

            if (req.query && req.query.description)
                resultObject.description = curEnvironment.getExampleDescription();

            resultObject.model = curEnvironment.getEpistemicModel();

            res.send(resultObject);
            res.end();
        });

        /**
         * Evaluate a formula in the current state of the model.
         *
         * Input: { formula: String }
         * Output: { result: boolean }
         */
        app.get('/api/evaluate', async function(req, res) {
            if (!curEnvironment)
                return res.send({error: 'No Environment.'});

            let formula = req.query.formula || '';
            let result = await curEnvironment.modelCheckFormula(formula);
            await curEnvironment.getEpistemicModel().obtainKnowledge(CustomDescription.DEFAULT_AGENT)

            res.send({result});
        });


        /**
         * Update the current world valuation.
         *
         * Input: { [id: string]: boolean } | string[]
         * Output: { success: boolean }
         */
        app.put('/api/props', async function(req, res) {
            let propValues: { [id: string]: boolean } | string[] = req.body || [];
            let valuation: Valuation = new Valuation(propValues);

            let {success, result} = await curEnvironment.updateModel(valuation);

            // Get any props/knowledge that can be inferred by the world successors
            let inferredProps = result.obtainKnowledge(CustomDescription.DEFAULT_AGENT).getPropositionMap();
            let originalProps = valuation.getPropositionMap();

            // Remove any props that were passed in as input.
            for (let prop of Object.keys(inferredProps))
            {
                if(inferredProps[prop] === originalProps[prop])
                    delete inferredProps[prop];
            }

            res.send({
                success,
                result: inferredProps
            });
            res.end();
        });




    }
};
