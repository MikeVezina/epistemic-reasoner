import {ExplicitEventModel} from '../eventmodel/explicit-event-model';
import {ExplicitEpistemicModel} from '../epistemicmodel/explicit-epistemic-model';
import {WorldValuation} from '../epistemicmodel/world-valuation';
import {ExampleDescription} from '../environment/exampledescription';
import {Valuation} from '../epistemicmodel/valuation';
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

    }
}


class AcesAndEights extends ExampleDescription {
    getAgents(): string[] {
        return Object.keys(agents);
    }
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
        const create_combinations = (inputArr) => {

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
        let combinations = create_combinations(['AA', 'A8', '88']);

        console.log(combinations);

        // These are all the invalid permutations (there are a maximum of four Aces and four Eights)
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

        combinations = combinations.filter((f) => !invalid_permutations.some(r => JSON.stringify(r) === JSON.stringify(f)));

        for (let combination of combinations) {
            M.addWorld('w1' + combination[0] + '_2' + combination[1] + '_3' + combination[2], new AcesAndEightsWorld(new Valuation(['1' + combination[0], '2' + combination[1], '3' + combination[2]])));
        }

        Object.keys(agents).forEach(agent =>
            M.addEdgeIf(agent, function(w1, w2) {

                let agent_number = agents[agent];

                let other_agent_props = Object.keys(w1.valuation.getPropositionMap()).filter(prop => !prop.startsWith(agent_number));
                return other_agent_props.every(other_agent_prop => w1.modelCheck(other_agent_prop) === w2.modelCheck(other_agent_prop));
            }));


        let selected = Math.floor(Math.random() * combinations.length);
        let selected_cards = combinations[selected];

        this.agent1 = selected_cards[0];
        this.agent2 = selected_cards[1];
        this.agent3 = selected_cards[2];

        let world_name = 'w1' + this.agent1 + '_2' + this.agent2 + '_3' + this.agent3;

        M.setPointedWorld(world_name);
        M.removeUnReachablePartFrom(world_name);
        return M;
    }


    getActions() {
        let agentNames = Object.keys(agents);

        return [
            new EventModelAction({
                name: 'Alice does not know',
                eventModel: ExplicitEventModel.getEventModelPublicAnnouncement(FormulaFactory.createFormula('(not((K a 1AA) or (K a 1A8) or (K a 188)))'), agentNames)
            }),
            new EventModelAction({
                name: 'Alice knows',
                eventModel: ExplicitEventModel.getEventModelPublicAnnouncement(FormulaFactory.createFormula('((K a 1AA) or (K a 1A8) or (K a 188))'), agentNames)
            }),
            new EventModelAction({
                name: 'Bob does not know',
                eventModel: ExplicitEventModel.getEventModelPublicAnnouncement(FormulaFactory.createFormula('(not((K b 2AA) or (K b 2A8) or (K b 288)))'), agentNames)
            }),
            new EventModelAction({
                name: 'Bob knows',
                eventModel: ExplicitEventModel.getEventModelPublicAnnouncement(FormulaFactory.createFormula('((K b 2AA) or (K b 2A8) or (K b 288))'), agentNames)
            }),
            new EventModelAction({
                name: 'Carl does not know',
                eventModel: ExplicitEventModel.getEventModelPublicAnnouncement(FormulaFactory.createFormula('(not((K c 3AA) or (K c 3A8) or (K c 388)))'), agentNames)
            }),
            new EventModelAction({
                name: 'Carl knows',
                eventModel: ExplicitEventModel.getEventModelPublicAnnouncement(FormulaFactory.createFormula('((K c 3AA) or (K c 3A8) or (K c 388))'), agentNames)
            }),


        ];

    }


}

export {AcesAndEights, AcesAndEightsWorld};
