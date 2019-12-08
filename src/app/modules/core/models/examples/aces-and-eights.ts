import {ExplicitEventModel} from './../eventmodel/explicit-event-model';
import {ExplicitEpistemicModel} from './../epistemicmodel/explicit-epistemic-model';
import {WorldValuation} from './../epistemicmodel/world-valuation';
import {environment} from 'src/environments/environment';
import {ExampleDescription} from '../environment/exampledescription';
import {Valuation} from '../epistemicmodel/valuation';
import {World} from '../epistemicmodel/world';
import {EventModelAction} from '../environment/event-model-action';
import {FormulaFactory} from '../formula/formula';

let agents = {
    'a': 1,
    'b': 2,
    'c': 3,
};


/**
 * @param valuation a valuation
 * */
class AcesAndEightsWorld extends WorldValuation {


    constructor(valuation: Valuation) {
        super(valuation);
        this.agentPos['a'] = {x: 32, y: 32, r: 16};
        this.agentPos['b'] = {x: 68 + 5, y: 20, r: 16};
        this.agentPos['c'] = {x: 68 + 42, y: 32, r: 16};

    }

    draw(context: CanvasRenderingContext2D) {
        this.drawAgents(context);
        context.font = '12px Verdana';
        context.strokeStyle = '#000000';
        for (var agent of Object.keys(agents)) {
            for (var first_card of ['A', '8']) {
                for (var second_card of ['A', '8']) {
                    let agent_number = agents[agent];

                    // Checks if card proposition is true, and draws that card (for a and b only)
                    if (this.modelCheck(agent_number + first_card + second_card)) {
                        WorldValuation.drawCard(context, {
                            x: this.agentPos[agent].x - 16,
                            y: this.agentPos[agent].y,
                            w: 10,
                            text: first_card,
                            fontSize: 10
                        });
                        WorldValuation.drawCard(context, {
                            x: this.agentPos[agent].x - 6,
                            y: this.agentPos[agent].y,
                            w: 10,
                            text: second_card,
                            fontSize: 10
                        });
                    }
                }
            }
        }

    }

}


export class AcesAndEights extends ExampleDescription {
    getDescription(): string[] {
        return ['Three agents are each assigned two cards. Agents can only see the cards of other agents, and must use announcements to determine which cards they have. '];
    }

    agent1;
    agent2;
    agent3;

    getAtomicPropositions() {
        let A = [];
        for (let x = 1; x <= 3; x++) {
            ['AA', 'A8', '88'].forEach((prop) => A.push(x + prop.toString()));
        }

        return A;
    }

    getName() {
        return 'Aces & Eights';
    }

    getInitialEpistemicModel() {
        const permutator = (inputArr) => {

            let result = [];

            for (let i = 0; i < inputArr.length; i++) {
                for (let j = 0; j < inputArr.length; j++) {
                    for (let k = 0; k < inputArr.length; k++) {
                        result.push([inputArr[i], inputArr[j], inputArr[k]]);
                    }
                }
            }

            return result;

        };

        let M = new ExplicitEpistemicModel();
        let permutations = permutator(['AA', 'A8', '88']);

        console.log(permutations);

        let invalid_permutations = [
            ['AA', 'AA', 'AA'],
            ['A8', 'AA', 'AA'],
            ['AA', 'A8', 'AA'],
            ['AA', 'AA', 'A8'],

            ['88', '88', '88'],
            ['A8', '88', '88'],
            ['88', 'A8', '88'],
            ['88', '88', 'A8'],
        ];

        permutations = permutations.filter((f) => !invalid_permutations.some(r => JSON.stringify(r) === JSON.stringify(f)));

        console.log(permutations);

        for (let permutation of permutations) {
            M.addWorld('w1' + permutation[0] + '_2' + permutation[1] + '_3' + permutation[2], new AcesAndEightsWorld(new Valuation(['1' + permutation[0], '2' + permutation[1], '3' + permutation[2]])));
        }

        Object.keys(agents).forEach(agent =>
            M.addEdgeIf(agent, function(w1, w2) {

                let agent_number = agents[agent];

                let other_agent_props = Object.keys(w1.valuation.getPropositionMap()).filter(prop => !prop.startsWith(agent_number));
                return other_agent_props.every(other_agent_prop => w1.modelCheck(other_agent_prop) === w2.modelCheck(other_agent_prop));
            }));


        let selected = Math.floor(Math.random() * permutations.length);
        let pointed = permutations[selected];

        M.setPointedWorld('w1' + pointed[0] + '_2' + pointed[1] + '_3' + pointed[2]);
        this.agent1 = pointed[0];
        this.agent2 = pointed[1];
        this.agent3 = pointed[2];

        M.removeUnReachablePartFrom('w1' + pointed[0] + '_2' + pointed[1] + '_3' + pointed[2]);
        return M;
    }


    getActions() {

        return [
            new EventModelAction({
                name: 'Alice does not know',
                eventModel: ExplicitEventModel.getEventModelPublicAnnouncement(FormulaFactory.createFormula('(not((K a 1AA) or (K a 1A8) or (K a 188)))'))
            }),
            new EventModelAction({
                name: 'Alice knows',
                eventModel: ExplicitEventModel.getEventModelPublicAnnouncement(FormulaFactory.createFormula('((K a 1AA) or (K a 1A8) or (K a 188))'))
            }),
            new EventModelAction({
                name: 'Bob does not know',
                eventModel: ExplicitEventModel.getEventModelPublicAnnouncement(FormulaFactory.createFormula('(not((K b 2AA) or (K b 2A8) or (K b 288)))'))
            }),
            new EventModelAction({
                name: 'Bob knows',
                eventModel: ExplicitEventModel.getEventModelPublicAnnouncement(FormulaFactory.createFormula('((K b 2AA) or (K b 2A8) or (K b 288))'))
            }),
            new EventModelAction({
                name: 'Carl does not know',
                eventModel: ExplicitEventModel.getEventModelPublicAnnouncement(FormulaFactory.createFormula('(not((K c 3AA) or (K c 3A8) or (K c 388)))'))
            }),
            new EventModelAction({
                name: 'Carl knows',
                eventModel: ExplicitEventModel.getEventModelPublicAnnouncement(FormulaFactory.createFormula('((K c 3AA) or (K c 3A8) or (K c 388))'))
            }),


        ];

    }


}
