import {ExplicitEpistemicModel} from '../epistemicmodel/explicit-epistemic-model';

import {Formula, NotFormula} from '../formula/formula';
import {ExplicitEventModel} from './explicit-event-model';
import {World} from '../epistemicmodel/world';
import {EventModel} from './event-model';
import {AgentExplicitEpistemicModel} from '../epistemicmodel/agent-explicit-epistemic-model';
import {WorldTransferPostcondition} from './world-transfer-postcondition';

/**
 * A class that updates a Jason Agent Epistemic model.
 *
 * This update event relies on the assumptions of the JasonAgentEpistemicModel. I.e.:
 * -
 */
export class JasonAgentTransitionEvent implements EventModel<AgentExplicitEpistemicModel> {

    readonly post: WorldTransferPostcondition;
    readonly transitions: { [pre: string]: World; };

    constructor(transitions: { [pre: string]: World; }) {
        this.post = new WorldTransferPostcondition(transitions);
        this.transitions = transitions;
    }

    /**
     * We assume the agent has done proper belief/knowledge revision, so we always try to apply the knowledge valuation to the model
     */
    async isApplicableIn(): Promise<boolean> {
        return Promise.resolve(true);
    }


    /**
     * Apply the event to model M, and place the result in R
     * @param M
     * @param R The output (resultant) model
     */
    applyResult(M: AgentExplicitEpistemicModel, R: AgentExplicitEpistemicModel): AgentExplicitEpistemicModel {
        // Filter out worlds that do not transition
        // And add transitioned worlds to the new model
        for (let w of M.getWorldNames()) {
            for (let w_id_prop in this.transitions) {
                let world = M.getWorld(w);
                if (world.modelCheck(w_id_prop)) {
                    R.addWorld(w + '_e', this.post.perform(M, w));
                }
            }
        }


        // Knowledge valuation has contradictions if there are no worlds (i.e. no pointed world was chosen).
        if (R.getNumberWorlds() === 0) {
            console.warn('No resulting worlds. Transition has contradictions.');
            return;
        }

        return R;
    }

    /**
     * Applies the set propositions to the initial model. Does not update the current model.
     * @param M (unused) the current model.
     */
    apply(M: AgentExplicitEpistemicModel): AgentExplicitEpistemicModel {

        let resultModel = new AgentExplicitEpistemicModel();
        return this.applyResult(M, resultModel);
    }

}


