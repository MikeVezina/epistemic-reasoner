import * as express from 'express';
import {CustomDescription} from './models/CustomDescription';
import {CustomEnvironment} from './models/CustomEnvironment';
import {AtomicFormula, Formula, FormulaFactory, KFormula, KposFormula, NotFormula} from './modules/core/models/formula/formula';
import {ExplicitEpistemicModel} from './modules/core/models/epistemicmodel/explicit-epistemic-model';
import fs from 'fs';
import {JasonAgentEnvironment} from './models/JasonAgentEnvironment';
import {JasonAgentDescription} from './models/JasonAgentDescription';
import {AgentExplicitEpistemicModel} from './modules/core/models/epistemicmodel/agent-explicit-epistemic-model';
import {ExplicitEventModel} from './modules/core/models/eventmodel/explicit-event-model';
import {WorldValuation} from './modules/core/models/epistemicmodel/world-valuation';

function createAcesAndEightsModel(): object {
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

let debugval = true;

export class ApiRouter {


    createApp(app: express.Application): any {

        let curEnvironment: JasonAgentEnvironment;

        // Lets just initialize curEnvironment for now...
        // let rawData = createAcesAndEightsModel();
        // curEnvironment = new CustomEnvironment(new CustomDescription(rawData));
        // curEnvironment.getEpistemicModel().setPointedWorld(ExplicitEpistemicModel.createUpdateFormula([]));

        const file = 'desc_cache.json';
        let descCache = {};

        if (!fs.existsSync(file)) {
            fs.writeFileSync(file, '{}');
        }

        // var test = fs.readFileSync(file, 'utf-8');

        let descCacheObj = JSON.parse('{}');
        for (let key of Object.keys(descCacheObj)) {
            console.log('Loading model from cache: ');
            let val = new CustomDescription(descCacheObj[key]);
            descCache[key] = val;
            console.log('Worlds: ' + val.getInitialEpistemicModel().getNumberWorlds());
            console.log('Edges: ' + val.getInitialEpistemicModel().getNumberEdges());
            console.log('Pointed: ' + val.getInitialEpistemicModel().getPointedWorldID());

        }

        console.log(Object.keys(descCache).length + ' loaded into cache.');

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

            let numWorlds = req.body.initialModel.worlds.length;
            console.log('Creating new model with ' + numWorlds + ' worlds');

            // if(numWorlds == 0)
            // {
            //     console.warn("The model input does not contain any worlds. Deleting current model.");
            //     return res.send("Empty model not supported").end();
            // }

            let start = Date.now();

            let isCached = descCache[dataString] !== undefined;

            // Create and Place in cache.
            // let curDescription = descCache[dataString] || new CustomDescription(data);
            try {
                let curDescription = new JasonAgentDescription(data);

                // Todo: Enable cache (large models result in RangeError: serialized string length too long)
                //descCache[dataString] = curDescription;

                // Create Description end time
                let descEnd = Date.now();

                curEnvironment = new JasonAgentEnvironment(curDescription);
                let envEnd = Date.now();

                console.log('');
                console.log('Model Metrics:');
                console.log('------- -------');
                console.log('Cached: ' + isCached);
                console.log('Create Description (Initial Model) Time: ' + (descEnd - start));
                console.log('Create Env. Time: ' + (envEnd - descEnd));
                console.log('Total Time: ' + (envEnd - start));
                console.log('------- -------');
                console.log('Worlds: ' + curEnvironment.getEpistemicModel().getNumberWorlds());
                console.log('Atomic Propositions: ' + curEnvironment.getExampleDescription().getAtomicPropositions().length);
                console.log('Edges/Simulated: ' + curEnvironment.getEpistemicModel().getNumberEdges() + ' / ' + curEnvironment.getEpistemicModel().getNumberFalseEdges());
                console.log('Pointed: ' + curEnvironment.getEpistemicModel().getPointedWorldID());
                console.log('======= =======');

                // Write to cache
                if (!isCached) {
                    fs.writeFileSync(file, JSON.stringify(descCache));
                }
            } catch (err) {
                console.warn('An error occurred while parsing the input model. Error: ' + err);
            }

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

            if (debugval) {
                let sortedWorlds = [];

                for (let world of curEnvironment.getEpistemicModel().worldArray) {
                    let val = (<WorldValuation> world).valuation;
                    let props = val.propositions;


                    let sortedProps = [];
                    for (let p of Object.keys(props)) {
                        if (props[p] === true) {
                            sortedProps.push(p);
                        }
                    }

                    sortedProps.sort();
                    sortedProps.sort((a, b) => {
                        if (a.indexOf('location') == 0) {
                            return -1;
                        }
                        if (b.indexOf('location') == 0) {
                            return 1;
                        }

                        return 0;
                    });
                    sortedWorlds.push(sortedProps);
                }
                sortedWorlds.sort((l1: string[], l2: string[]) => {
                    return l1[0].localeCompare(l2[0]);
                });

                for (let w of sortedWorlds) {
                    console.log('W: ' + w[0]);
                    let prev = undefined;

                    for (let p of w) {


                        let view = p.substr(0, p.indexOf("["));

                        if (view === 'closest')
                            view = p.substr(0, p.indexOf("[") + 3);

                        if (prev === undefined) {
                            prev = view;
                        } else if (prev !== view) {
                            console.log('--');
                            prev = view;
                        }

                        console.log(p);
                    }
                    console.log();
                }
            }


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
            if (!curEnvironment) {
                console.log('No environment setup');
                return res.end();
            }


            try {
                let knowledgeValuation: { [id: string]: boolean } = req.body.props || [];
                // console.log("Received Knowledge Update: " + JSON.stringify(knowledgeValuation));

                let {success, result} = await curEnvironment.updateModel(knowledgeValuation);
                res.send({success});

            } catch (err) {
                console.error('There was an error updating propositions: ' + err);
            }


            res.end();
        });


        function evaluateFormulas(formulas: any[] | any, model: AgentExplicitEpistemicModel): { [id: number]: boolean } {
            let formulaResults: { [id: number]: boolean } = {};

            if (formulas === undefined) {
                return formulaResults;
            }

            if (!(formulas instanceof Array)) {
                formulas = [formulas];
            }

            let start = Date.now();
            let formTot = 0;

            for (let formula of formulas) {
                let parsedFormula = parseFormulaObject(formula);
                if (formulaResults[formula.id] !== undefined) {
                    console.warn('formula with id ' + formula.id + ' was already evaluated (possible duplicate formula): ' + parsedFormula.prettyPrint());
                }
                let formStr = Date.now();
                let res = model.checkSync(parsedFormula);
                let delta = Date.now() - formStr;
                formTot += delta;

                formulaResults[formula.id] = res;


            }

            console.log(Object.keys(formulas).length + ' formulas took ' + (Date.now() - start) + ' or ' + formTot);

            return formulaResults;
        }

        function parseFormulaObject(formula: any) {
            if (!formula) {
                return;
            }

            let agent = formula.agent || CustomDescription.DEFAULT_AGENT;
            let {modality, modalityNegated, prop, propNegated} = formula;

            let propFormula: Formula = new AtomicFormula(prop);

            if (propNegated) {
                propFormula = new NotFormula(propFormula);
            }

            let modalityFormula;

            if (modality === 'knows' || modality === 'know' || modality === 'k') {
                modalityFormula = new KFormula(agent, propFormula);
            } else if (modality === 'possible') {
                modalityFormula = new KposFormula(agent, propFormula);
            } else {
                throw 'invalid type ' + modality;
            }

            return modalityNegated ? new NotFormula(modalityFormula) : modalityFormula;
        }


    }


};
