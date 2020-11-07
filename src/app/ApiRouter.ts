import * as express from 'express';
import {CustomDescription} from './models/CustomDescription';
import {CustomEnvironment} from './models/CustomEnvironment';
import {Valuation} from './modules/core/models/epistemicmodel/valuation';
import {
    AndFormula,
    AtomicFormula,
    Formula,
    FormulaFactory,
    KFormula,
    KposFormula,
    NotFormula, OrFormula,
    TrueFormula
} from './modules/core/models/formula/formula';
import {ExplicitEpistemicModel} from './modules/core/models/epistemicmodel/explicit-epistemic-model';
import fs from 'fs';

function createRaw(): object {
    return {
        'initialModel': {
            'worlds': [
                {
                    'name': 'w1AA_2AA_3EE',
                    'props': [
                        '1AA',
                        '2AA',
                        '3EE'
                    ]
                },
                {
                    'name': 'w1AA_2AE_3AE',
                    'props': [
                        '1AA',
                        '2AE',
                        '3AE'
                    ]
                },
                {
                    'name': 'w1AA_2AE_3EE',
                    'props': [
                        '1AA',
                        '2AE',
                        '3EE'
                    ]
                },
                {
                    'name': 'w1AA_2EE_3AA',
                    'props': [
                        '1AA',
                        '2EE',
                        '3AA'
                    ]
                },
                {
                    'name': 'w1AA_2EE_3AE',
                    'props': [
                        '1AA',
                        '2EE',
                        '3AE'
                    ]
                },
                {
                    'name': 'w1AA_2EE_3EE',
                    'props': [
                        '1AA',
                        '2EE',
                        '3EE'
                    ]
                },
                {
                    'name': 'w1AE_2AA_3AE',
                    'props': [
                        '1AE',
                        '2AA',
                        '3AE'
                    ]
                },
                {
                    'name': 'w1AE_2AA_3EE',
                    'props': [
                        '1AE',
                        '2AA',
                        '3EE'
                    ]
                },
                {
                    'name': 'w1AE_2AE_3AA',
                    'props': [
                        '1AE',
                        '2AE',
                        '3AA'
                    ]
                },
                {
                    'name': 'w1AE_2AE_3AE',
                    'props': [
                        '1AE',
                        '2AE',
                        '3AE'
                    ]
                },
                {
                    'name': 'w1AE_2AE_3EE',
                    'props': [
                        '1AE',
                        '2AE',
                        '3EE'
                    ]
                },
                {
                    'name': 'w1AE_2EE_3AA',
                    'props': [
                        '1AE',
                        '2EE',
                        '3AA'
                    ]
                },
                {
                    'name': 'w1AE_2EE_3AE',
                    'props': [
                        '1AE',
                        '2EE',
                        '3AE'
                    ]
                },
                {
                    'name': 'w1EE_2AA_3AA',
                    'props': [
                        '1EE',
                        '2AA',
                        '3AA'
                    ]
                },
                {
                    'name': 'w1EE_2AA_3AE',
                    'props': [
                        '1EE',
                        '2AA',
                        '3AE'
                    ]
                },
                {
                    'name': 'w1EE_2AA_3EE',
                    'props': [
                        '1EE',
                        '2AA',
                        '3EE'
                    ]
                },
                {
                    'name': 'w1EE_2AE_3AA',
                    'props': [
                        '1EE',
                        '2AE',
                        '3AA'
                    ]
                },
                {
                    'name': 'w1EE_2AE_3AE',
                    'props': [
                        '1EE',
                        '2AE',
                        '3AE'
                    ]
                },
                {
                    'name': 'w1EE_2EE_3AA',
                    'props': [
                        '1EE',
                        '2EE',
                        '3AA'
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
        curEnvironment.getEpistemicModel().setPointedWorld(ExplicitEpistemicModel.createUpdateFormula([]));

        const file = "desc_cache.json";
        let descCache = {};

       if (!fs.existsSync(file))
            fs.writeFileSync(file, "{}");

       // var test = fs.readFileSync(file, 'utf-8');

        let descCacheObj = JSON.parse("{}");
        for (let key of Object.keys(descCacheObj))
        {
            console.log("Loading model from cache: ");
            let val = new CustomDescription(descCacheObj[key]);
            descCache[key] = val;
            console.log("Worlds: " + val.getInitialEpistemicModel().getNumberWorlds());
            console.log("Edges: " + val.getInitialEpistemicModel().getNumberEdges());
            console.log("Pointed: " + val.getInitialEpistemicModel().getPointedWorldID());

        }

        console.log(Object.keys(descCache).length + " loaded into cache.");

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
            let dataString = JSON.stringify(req.body);

            console.log("Creating new model with " + req.body.initialModel.worlds.length + " worlds");

            let start = Date.now();

            let isCached = descCache[dataString] !== undefined;

            // Create and Place in cache.
            // let curDescription = descCache[dataString] || new CustomDescription(data);
            let curDescription = new CustomDescription(data);
            descCache[dataString] = curDescription;

            // Create Description end time
            let descEnd = Date.now();

            curEnvironment = new CustomEnvironment(curDescription);
            let envEnd = Date.now();

            // Set the pointed world
            let valuation = ExplicitEpistemicModel.createUpdateFormula(props);
            curEnvironment.getEpistemicModel().setPointedWorld(valuation);
            let valuationEnd = Date.now();

            console.log("");
            console.log("Model Metrics:")
            console.log("------- -------");
            console.log("Cached: " + isCached)
            console.log("Create Desc. Time: " + (descEnd - start));
            console.log("Create Env. Time: " + (envEnd - descEnd));
            console.log("Pointed World Time: " + (valuationEnd - envEnd));
            console.log("Total Time: " + (valuationEnd - start));
            console.log("------- -------");
            console.log("Worlds: " + curEnvironment.getEpistemicModel().getNumberWorlds());
            console.log("Edges: " + curEnvironment.getEpistemicModel().getNumberEdges());
            console.log("Pointed: " + curEnvironment.getEpistemicModel().getPointedWorldID());
            console.log("======= =======");

            // Write to cache
            if (!isCached)
                fs.writeFileSync(file, JSON.stringify(descCache));
            res.end();
        });


        app.get('/api/model', async function(req, res) {
            if (!curEnvironment) {
                return res.send({error: 'No Environment.'});
            }

            let resultObject: any = {};

            if (req.query && req.query.description) {
                resultObject.description = curEnvironment.getExampleDescription();
            }

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
        app.post('/api/evaluate', async function(req, res) {
            if (!curEnvironment) {
                return res.send({error: 'No Environment.'});
            }

            let formulas = req.body.formulas || '';
            let currentModel = curEnvironment.getEpistemicModel();

            let formulaResults = evaluateFormulas(formulas, currentModel);

            res.send({
                result: formulaResults
            });

        });



        /**
         * Update the current world valuation.
         *
         * Input: { [id: string]: boolean } | string[]
         * Output: { success: boolean }
         */
        app.put('/api/props', async function(req, res) {
            let propValues: [{ [id: string]: boolean }] = req.body.props || [];
            // Convert BB update to formula
            let propFormula = ExplicitEpistemicModel.createUpdateFormula(propValues);
            
            let {success, result} = await curEnvironment.updateModel(propFormula);
            let formulaResults: any = {};

            // Evaluate formulas if they are provided
            if (req.body.formulas) {
                formulaResults = evaluateFormulas(req.body.formulas, result);
            }


            res.send({
                success,
                result: formulaResults
            });
            res.end();
        });


        function evaluateFormulas(formulas: any[] | any, model: ExplicitEpistemicModel): { [id: number]: boolean } {
            let formulaResults: { [id: number]: boolean } = {};

            if (formulas === undefined) {
                return formulaResults;
            }

            if (!(formulas instanceof Array)) {
                formulas = [formulas];
            }

            for (let formula of formulas) {
                let parsedFormula = parseFormulaObject(formula);
                if (formulaResults[formula.id] !== undefined) {
                    console.warn("formula with id " + formula.id + " was already evaluated (possible duplicate formula): " + parsedFormula.prettyPrint());
                }
                formulaResults[formula.id] = model.modelCheck(model.getPointedWorldID(), parsedFormula);
            }

            return formulaResults;
        }

        function parseFormulaObject(formula: any) {
            if (!formula) {
                return;
            }

            let agent = formula.agent || CustomDescription.DEFAULT_AGENT;
            let type = formula.type;
            let inverted = formula.invert === undefined ? true : formula.invert;

            // Nested formula (returns undefined if there is no inner formula)
            let innerFormula = parseFormulaObject(formula.inner);
            let returnObject;



            if (type === 'knows' || type === 'know' || type === 'k') {
                returnObject = new KFormula(agent, innerFormula);
            } else if (type === 'possible') {
                returnObject = new KposFormula(agent, innerFormula);
            } else if (type === 'prop') {
                returnObject = new AtomicFormula(formula.prop);
            } else {
                throw 'invalid type ' + type;
            }

            return inverted ? new NotFormula(returnObject) : returnObject;
        }


    }


};
