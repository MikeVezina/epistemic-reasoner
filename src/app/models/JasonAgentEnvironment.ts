import {Environment} from '../modules/core/models/environment/environment';
import {CustomDescription} from './CustomDescription';
import {Formula} from '../modules/core/models/epistemicmodel/formula';
import {AndFormula, AtomicFormula, FormulaFactory, NotFormula, OrFormula, TrueFormula} from '../modules/core/models/formula/formula';
import {ExplicitFilterEventModel} from '../modules/core/models/eventmodel/explicit-filter-event-model';
import {ExplicitEpistemicModel} from '../modules/core/models/epistemicmodel/explicit-epistemic-model';
import {JasonAgentDescription} from './JasonAgentDescription';
import {JasonAgentPublicAnnouncement} from '../modules/core/models/eventmodel/jason-agent-public-announcement';
import {AgentExplicitEpistemicModel} from '../modules/core/models/epistemicmodel/agent-explicit-epistemic-model';
import {EpistemicModel} from '../modules/core/models/epistemicmodel/epistemic-model';
import {WorldValuation} from '../modules/core/models/epistemicmodel/world-valuation';
import {WorldTransferPostcondition} from '../modules/core/models/eventmodel/world-transfer-postcondition';
import e from 'express';
import {World} from '../modules/core/models/epistemicmodel/world';
import {ExplicitEventModel} from '../modules/core/models/eventmodel/explicit-event-model';
import {JasonAgentTransitionEvent} from '../modules/core/models/eventmodel/jason-agent-transition-event';

export class JasonAgentEnvironment extends Environment {

    private readonly customDesc: JasonAgentDescription;
    private readonly agents: string[] = ['a', 'b', 'c', 'd'];
    private previousKnowledge;

    constructor(desc: JasonAgentDescription) {
        super(desc);
        this.customDesc = desc;
        this.previousKnowledge = {};
    }

    public getExampleDescription(): JasonAgentDescription {
        return this.customDesc;
    }

    public getAgents(): string[] {
        return this.agents;
    }

    /**
     * Returns a Promise to determine whether or not a given formula is true or false in the current epistemic model.
     * @param formula
     */
    public async modelCheckFormula(formula: Formula | string): Promise<boolean> {
        if (formula instanceof String || typeof formula === 'string') {
            formula = FormulaFactory.createFormula(<string> formula);
        }

        return await this.getEpistemicModel().check(<Formula> formula);
    }

    /**
     * Determine if current knowledge has all of previous knowledge
     * @param knowledgeVal
     * @param prevKnowledge
     */
    static isMonotonicUpdate(knowledgeVal: { [p: string]: boolean }, prevKnowledge: { [p: string]: boolean }) {

        for (let key of Object.keys(prevKnowledge)) {
            let prevVal = prevKnowledge[key];

            let curVal = knowledgeVal[key];

            // Non-monotonic update if the current knowledge does not contain the same existing knowledge
            if (curVal != prevVal) {
                console.log('Non Monotonic Update');
                return false;
            }
        }

        console.log('Monotonic Update');
        return true;
    }

    async updateModel(knowledgeValuation: { [p: string]: boolean }): Promise<{ success: Boolean; result: AgentExplicitEpistemicModel }> {
        console.log('Prev. Model Size: ' + this.getEpistemicModel().getNumberWorlds());
        console.log('Cur. Val: ' + Object.keys(this.previousKnowledge).length);

        // console.log("Prev. Val: " + JSON.stringify(this.previousKnowledge))

        let startTime = Date.now();

        // Convert BB update to formula
        let knowledgeFormula = AgentExplicitEpistemicModel.createUpdateFormula(knowledgeValuation);

        let appliedModel = this.getEpistemicModel();

        // Disable non-monotonic update, because of transitions
        // if (!JasonAgentEnvironment.isMonotonicUpdate(knowledgeValuation, this.previousKnowledge)) {
        //     appliedModel = this.customDesc.getInitialEpistemicModel();
        // }

        let event = new JasonAgentPublicAnnouncement(knowledgeFormula);

        let result = event.apply(appliedModel);

        let resultSuccess = result !== undefined;

        if (resultSuccess) {
            this.setEpistemicModel(result);
            this.previousKnowledge = knowledgeValuation;

            console.log('Cur. Val: ' + Object.keys(knowledgeValuation).length);
            // console.log("Cur. Val: " + JSON.stringify(knowledgeValuation))
            console.log('Cur. Model Size: ' + result.getNumberWorlds());
            console.log('Update Time: ' + (Date.now() - startTime));
            console.log('=====');

        }

        return {
            success: resultSuccess,
            result: this.getEpistemicModel()
        };

    }

    async transitionModel(transitions: [{ [p: string]: string }]): Promise<{ success: Boolean; result: AgentExplicitEpistemicModel }> {
        console.log('Prev. Model Size: ' + this.getEpistemicModel().getNumberWorlds());
        console.log('Transitions: ' + Object.keys(transitions).length);

        // console.log("Prev. Val: " + JSON.stringify(this.previousKnowledge))

        let startTime = Date.now();

        let model = this.getEpistemicModel();

        let event = this.createTransitionEvent(transitions);

        let result = event.apply(model);

        let resultSuccess = result !== undefined;

        if (resultSuccess) {
            this.setEpistemicModel(result);
            console.log('Completed Transitions');
            // console.log("Cur. Val: " + JSON.stringify(knowledgeValuation))
            console.log('Cur. Model Size: ' + result.getNumberWorlds());
            console.log('Transition Time: ' + (Date.now() - startTime));
            console.log('=====');

        }

        return {
            success: resultSuccess,
            result: this.getEpistemicModel()
        };

    }

    createTransitionEvent(transitions: [{ [pre: string]: string; }]): JasonAgentTransitionEvent {
        let initialEpistemicModel = this.getExampleDescription().getInitialEpistemicModel();
        let worldNames = initialEpistemicModel.getWorldNames();

        let worldTransitions: { [pre: string]: World; } = {};
        for (let transition of transitions) {
            let pre = transition['pre'];
            let post = transition['post'];

            worldNames.forEach(w2 => {
                let world2 = initialEpistemicModel.getWorld(w2) as WorldValuation;

                // If world1 |= pre and world2 |= post
                if (world2.modelCheck(post)) {
                    worldTransitions[pre] = world2;
                }

            });



            // worldNames.forEach(w => {
            //     let world = initialEpistemicModel.getWorld(w) as WorldValuation;
            //     if (world.modelCheck(pre)) {
            //         // Now find a world matching post-condition
            //         worldNames.forEach(w2 => {
            //             let world2 = initialEpistemicModel.getWorld(w2) as WorldValuation;
            //
            //             // If world1 |= pre and world2 |= post
            //             if (world2.modelCheck(post)) {
            //                 worldTransitions[w] = world2;
            //             }
            //
            //         });
            //     }
            // });

        }


        let e = new JasonAgentTransitionEvent(worldTransitions);
        // let event = Date.now().toString();
        return e;
    }


    getEpistemicModel(): AgentExplicitEpistemicModel {
        return <AgentExplicitEpistemicModel> super.getEpistemicModel();
    }


    toJSON(): object {
        return this.valueOf();
    }

    valueOf(): Object {
        return {
            model: super.getEpistemicModel(),
            description: super.getExampleDescription()
        };
    }
}
