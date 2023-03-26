import * as express from 'express';
import {CustomDescription} from './models/CustomDescription';
import {constraintsToFormula, parseFormulaFromConstraint, parsePostFromRequest} from './modules/core/models/formula/APIFormula';
import {
    AndFormula,
    AtomicFormula,
    Formula,
    FormulaFactory,
    KFormula,
    KposFormula,
    NotFormula, OrFormula,
    YFormula
} from './modules/core/models/formula/formula';
import {ExplicitEpistemicModel} from './modules/core/models/epistemicmodel/explicit-epistemic-model';
import fs from 'fs';
import {JasonAgentEnvironment} from './models/JasonAgentEnvironment';
import {JasonAgentDescription} from './models/JasonAgentDescription';
import {AgentExplicitEpistemicModel} from './modules/core/models/epistemicmodel/agent-explicit-epistemic-model';
import {ExplicitEventModel} from './modules/core/models/eventmodel/explicit-event-model';
import {WorldValuation} from './modules/core/models/epistemicmodel/world-valuation';
import {ExplicitTemporalEpistemicModel} from './modules/core/models/epistemicmodel/explicit-temporal-epistemic-model';
import {Valuation} from './modules/core/models/epistemicmodel/valuation';
import {ExplicitTemporalEventModel} from './modules/core/models/eventmodel/explicit-temporal-event-model';
import {TouistService} from './modules/core/services/touist.service';
import useFakeTimers = jest.useFakeTimers;
import {ExplicitFilterEventModel} from './modules/core/models/eventmodel/explicit-filter-event-model';
import {JasonAgentEventModel} from './modules/core/models/eventmodel/jason-agent-event-model';
import {AgentEventModel} from './modules/core/models/eventmodel/agent-event-model';

import Readlines from 'n-readlines';
import * as process from 'process';

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

function constraintsToModels(filter) {
    // Create Touist files from constraints
    let constraintFolder = '..\\cache\\constraints';
    const TEMP_PATH = '..\\cache\\touist_src\\model_temp.touist';
    if (fs.existsSync(constraintFolder)) {
        for (let val of fs.readdirSync(constraintFolder)) {
            if (filter !== undefined && !filter(val)) {
                continue;
            }

            console.log('Processing:' + val);

            const lines = new Readlines(constraintFolder + '\\' + val);

            let constraints = [];

            let line;
            let lineNumber = 1;

            let origToNew = {};
            let newToOrig = {};

            let next = 0;

            fs.writeFileSync(TEMP_PATH, '');
            while (line = lines.next()) {
                // console.log(`Line ${lineNumber} has: ${line.toString('ascii')}`);
                lineNumber++;

                if (lineNumber % 1000 === 0) {
                    console.log(lineNumber);
                }

                let formula = parseFormulaFromConstraint(JSON.parse(line));

                let compact = formula.renameAtoms(p => {
                    if (origToNew[p] != undefined) {
                        return origToNew[p];
                    }

                    return p;

                    let nextStr = 'p' + next;
                    origToNew[p] = nextStr;
                    newToOrig[nextStr] = p;
                    next++;
                    return nextStr;
                });

                fs.writeFileSync(TEMP_PATH,
                    compact.prettyPrint() + '\r\n',
                    {
                        encoding: 'ascii',
                        flag: 'a+'
                    });


                // constraints.push(JSON.parse(line));
            }

            console.log(JSON.stringify(origToNew));

            fs.writeFileSync('..\\cache\\props\\' + lineNumber + '_mapping.json', JSON.stringify(origToNew));

            let newPath = '..\\cache\\touist_src\\model_' + lineNumber + '.touist';
            fs.renameSync(TEMP_PATH, newPath);

            // // Create constraint string, find all possible models
            // let constraintForms = constraintsToFormula(constraints);
            //
            // for (let c of constraintForms) {
            //     fs.writeFileSync('..\\cache\\touist_src\\model_' + constraints.length + '.touist', c.prettyPrint() + '\r\n', {
            //         encoding: 'utf8',
            //         flag: 'a+'
            //     });
            //
            //     // cs += c.prettyPrint() + '\r\n';
            // }

            console.log('Wrote to file:' + newPath);
        }
    }
}

export class ApiRouter {

    createApp(app: express.Application, useCache: boolean = false): any {

        let currentModel: AgentExplicitEpistemicModel;

        let createFake = true;

        if (createFake) {
            currentModel = new AgentExplicitEpistemicModel();
            currentModel.addWorld('1', new WorldValuation(new Valuation(['loc(1)', 'loc(2)'])));
            currentModel.addWorld('2', new WorldValuation(new Valuation(['loc(2)'])));
        }
        // Used for converting constraints to touist models (evaluation => massive models)
        // if(false)
        // constraintsToModels((name) => name.indexOf('40470') >= 0);
        // constraintsToModels((name) => name.indexOf('_DISABLE') >= 0);
        constraintsToModels((name) => name.indexOf('_DISABLE') >= 0);


        const file = 'desc_cache.json';
        let descCache = {};

        if (!fs.existsSync(file)) {
            fs.writeFileSync(file, '{}');
        }


        let descCacheObj = JSON.parse('{}');
        for (let key of Object.keys(descCacheObj)) {
            console.log('Loading model from cache: ');
            let val = new CustomDescription(descCacheObj[key]);
            descCache[key] = val;
            console.log('Worlds: ' + val.getInitialEpistemicModel().getNumberWorlds());
            console.log('Edges: ' + val.getInitialEpistemicModel().getNumberEdges());
            console.log('Pointed: ' + val.getInitialEpistemicModel().getPointedWorldID());

        }
        console.log('Hi');

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
        app.post('/api/model', createModelRequest);


        app.get('/api/model', async function(req, res) {
            if (!currentModel) {
                return res.send({success: false, error: 'No Environment.'});
            }

            let resultObject: any = {};

            if (req.query && req.query.description) {
                // resultObject.description = curEnvironment.getExampleDescription();
            }

            resultObject.model = currentModel;

            res.send(resultObject);
            res.end();
        });

        /**
         * Evaluate a formula in the current state of the model.
         *
         * Input: { formula: String }
         * Output: { result: boolean }
         */
        app.post('/api/single-evaluate', async function(req, res) {
            if (!currentModel) {
                return res.send({result: false, error: 'No Environment.'});
            }


            let formula = req.body.formula || '';
            // let currentModel = curEnvironment.getEpistemicModel();

            if (formula === undefined) {
                return res.send({
                    result: false
                });
            }


            let start = Date.now();

            let parsedForm = parseFormulaFromConstraint(formula);
            console.log(parsedForm);

            // let parsedFormula = parseFormulaObject(formula);

            let evalStart = Date.now();
            let result = currentModel.checkSync(parsedForm);
            let delta = Date.now() - evalStart;

            console.log('Single formula took ' + (Date.now() - start) + '(total), or eval time: ' + delta);

            return res.send({
                result: result
            });

        });


        /**
         * Evaluate a formula in the current state of the model.
         *
         * Input: { formula: String }
         * Output: { result: boolean }
         */
        app.post('/api/evaluate', async function(req, res) {
            if (!currentModel) {
                return res.send({error: 'No Environment.'});
            }

            let formulas = req.body.formulas || '';
            // let currentModel = curEnvironment.getEpistemicModel();

            let formulaResults = evaluateFormulas(formulas, currentModel);

            res.send({
                result: formulaResults
            });

        });

        async function createModelRequest(req, res: express.Response) {
            let data = req.body;
            if (!data || (!data.constraints && !data.locations_model)) {

                console.log('No constraints given.');
                return res.send({success: false});
            }

            // Custom location map
            if (data.locations_model) {
                let start = Date.now();

                if (currentModel != undefined) {
                    console.log('Overwriting previous model');
                }

                console.log('Creating new model with ' + data.locations_model + ' worlds');

                try {
                    if (currentModel != undefined) {
                        console.log('Overriding existing epistemic model with ' + currentModel.getNumberWorlds());
                    }

                    currentModel = new AgentExplicitEpistemicModel();
                    let worldId = 0;
                    for (let x = 0; x < data.locations_model; x++) {
                        for (let y = 0; y < data.locations_model; y++) {

                            if ((x === 1 && y === 2) || (x === 2 && y === 2)) {
                                continue;
                            }


                            let world = new WorldValuation(new Valuation(['loc(' + x + ',' + y + ')']));
                            currentModel.addWorld(String(worldId), world);
                            worldId++;
                        }
                    }

                    // Create model parse end time
                    let modelParseEnd = Date.now();

                    console.log('');
                    console.log('Model Metrics:');
                    console.log('------- -------');
                    // console.log('Cached: ' + isCached);
                    // console.log('Generation Time (ms): ' + (genEnd - start));
                    // console.log('Model Creation Time (ms): ' + (modelParseEnd - genEnd));
                    console.log('Total Time (ms): ' + (modelParseEnd - start));
                    console.log('------- -------');
                    console.log('Constraints: ' + data.locations_model);
                    console.log('Worlds: ' + currentModel.getNumberWorlds());
                    console.log('Atomic Propositions: ' + currentModel.getAtomicPropositions().size);
                    console.log('Edges/Simulated: ' + currentModel.getNumberEdges() + ' / ' + currentModel.getNumberFalseEdges());
                    console.log('Pointed: ' + currentModel.getPointedWorldID());
                    console.log('======= =======');

                    return res.send({success: true, worlds: currentModel.worldNamesArray.length});
                } catch (err) {
                    console.warn('An error occurred while parsing the input model. Error: ' + err);
                }

                return res.send({success: false});
            }

            let modelPath = '..\\cache\\model_' + data.constraints.length + '.out';
            if (useCache && fs.existsSync(modelPath)) {
                // const broadbandLines = new Readlines(modelPath);

                // let constraints = [];
                //
                // let line;
                // let lineNumber = 1;
                //
                // while (line = broadbandLines.next()) {
                //     // console.log(`Line ${lineNumber} has: ${line.toString('ascii')}`);
                //     lineNumber++;
                //     constraints.push(JSON.parse(line));
                // }

                return res.send(await createModelFromConstraints(data.constraints, modelPath));
            }


            return res.send(await createModelFromConstraints(data.constraints));
        }


        async function createModelFromConstraints(constraints, cachedModel: string = undefined) {
            if (!constraints || constraints.length === 0) {
                console.log('No constraints given.');
                return {success: false};
            }

            console.log('Creating model using ' + constraints.length + ' constraint formulas');

            let start = Date.now();

            // Create constraint string, find all possible models
            let constraintForms = constraintsToFormula(constraints);

            let cs = '';
            for (let c of constraintForms) {
                cs += c.prettyPrint() + '\r\n';
            }

            let fetchRes = [];
            if (cachedModel !== undefined && fs.existsSync(cachedModel)) {
                console.log('Loading cached constraint model: ' + cachedModel);
                fetchRes = await TouistService.parse(fs.readFileSync(cachedModel, {encoding: 'utf8'}));
            } else {

                let constraintForm = new AndFormula(constraintForms);

                console.log(cs);
                let origToNew = {};
                let newToOrig = {};

                let next = 0;
                let compressedForm = constraintForm.renameAtoms(p => {
                    if (origToNew[p] != undefined) {
                        return origToNew[p];
                    }

                    let nextStr = 'p' + next;
                    origToNew[p] = nextStr;
                    newToOrig[nextStr] = p;
                    next++;
                    return nextStr;
                });


                fetchRes = await TouistService.fetchModels(compressedForm.prettyPrint());
            }
            // Mark generation end time
            let genEnd = Date.now();

            // No results/models generated
            if (!fetchRes || fetchRes.length === 0) {
                console.log('No models were generated. Maybe invalid constraints?');
                return {success: false};
            }

            console.log('Creating new model with ' + fetchRes.length + ' worlds');
            // console.log(JSON.stringify(fetchRes));

            try {
                if (currentModel != undefined) {
                    console.log('Overriding existing epistemic model with ' + currentModel.getNumberWorlds());
                }

                // Create epistemic model from valuations
                currentModel = parseModelFromValuations(fetchRes);

                // Create model parse end time
                let modelParseEnd = Date.now();

                console.log('');
                console.log('Model Metrics:');
                console.log('------- -------');
                // console.log('Cached: ' + isCached);
                console.log('Generation Time (ms): ' + (genEnd - start));
                console.log('Model Creation Time (ms): ' + (modelParseEnd - genEnd));
                console.log('Total Time (ms): ' + (modelParseEnd - start));
                console.log('------- -------');
                console.log('Constraints: ' + constraints.length);
                console.log('Worlds: ' + currentModel.getNumberWorlds());
                console.log('Atomic Propositions: ' + currentModel.getAtomicPropositions().size);
                console.log('Edges/Simulated: ' + currentModel.getNumberEdges() + ' / ' + currentModel.getNumberFalseEdges());
                console.log('Pointed: ' + currentModel.getPointedWorldID());
                console.log('======= =======');

                return {success: true, worlds: currentModel.worldNamesArray.length};

            } catch (err) {
                console.warn('An error occurred while parsing the input model. Error: ' + err);
            }

            return {success: false};
        }


        function eventModelFromRequest(events): AgentEventModel {
            let evModel = new AgentEventModel();

            for (let e of events) {
                let {id, pre, post} = e;

                evModel.addAction(id, parseFormulaFromConstraint(pre), parsePostFromRequest(post));
            }

            return evModel;
        }

        app.post('/api/apply-event', async function(req, res) {
            if (!currentModel) {
                console.log('No current model');
                return res.end();
            }


            console.log('apply-event called');

            try {
                let events = req.body.events || [];

                if (events === []) {
                    console.log('No events to apply.');
                    return res.send({success: false});
                }

                let prevWorlds = currentModel.getNumberWorlds();

                let eventIds = [];

                for (let ev of events) {
                    eventIds.push(ev.id);
                }

                let start = Date.now();

                if (eventIds.length > 5) {
                    console.log('Received event model with ' + eventIds.length + ' events: ' + JSON.stringify(eventIds));
                } else {
                    console.log('Received event model with ' + eventIds.length + ' events');
                }
                let eventModel = eventModelFromRequest(events);
                let createEvModEnd = Date.now();

                let result = eventModel.apply(currentModel);
                let applyEvModEnd = Date.now();


                if (result === undefined) {
                    console.log('Failed to apply event');
                    return res.send({success: false});
                }

                currentModel = result;

                console.log('');
                console.log('Event Metrics:');
                console.log('------- -------');
                console.log('Event Creation (ms): ' + (createEvModEnd - start));
                console.log('Event Application (ms): ' + (applyEvModEnd - createEvModEnd));
                console.log('Total Time (ms): ' + (applyEvModEnd - start));
                console.log('------- -------');
                console.log('Events: ' + eventIds.length);
                console.log('Previous Worlds: ' + prevWorlds);
                console.log('Resulting Worlds: ' + currentModel.getNumberWorlds());
                console.log('Edges/Simulated: ' + currentModel.getNumberEdges() + ' / ' + currentModel.getNumberFalseEdges());
                console.log('======= =======');
                console.log('');

                let numOnEvents = 0;

                for (const eventId of eventIds) {
                    if (eventId.indexOf('on(') >= 0) {
                        console.log('On event: ' + eventId);
                        numOnEvents++;
                    }
                }

                if (numOnEvents > 0) {
                    console.log('Total Time (ms): ' + (applyEvModEnd - start));
                    console.log('Memory check -- Breakpoint here? ' + (process.memoryUsage().heapUsed / 1000 / 1000));
                    // console.log('Memory check -- Breakpoint here? ' + process.memoryUsage());
                }
                return res.send({success: true});

            } catch (err) {
                console.error('There was an error updating the model: ' + err);
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

        function parseModelFromValuations(fetchRes) {
            let model = new AgentExplicitEpistemicModel();
            let worldId = 0;

            for (let resArr of fetchRes) {
                let world = new WorldValuation(new Valuation(resArr));
                model.addWorld(String(worldId), world);
                worldId++;
            }

            return model;
        }

    }


};
