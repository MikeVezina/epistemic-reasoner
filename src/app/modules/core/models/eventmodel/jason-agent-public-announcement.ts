import {ExplicitEpistemicModel} from '../epistemicmodel/explicit-epistemic-model';

import {Formula, NotFormula} from '../formula/formula';
import {ExplicitEventModel} from './explicit-event-model';
import {World} from '../epistemicmodel/world';
import {EventModel} from './event-model';
import {AgentExplicitEpistemicModel} from '../epistemicmodel/agent-explicit-epistemic-model';
import {JasonAgentEnvironment} from '../../../../models/JasonAgentEnvironment';
import {CustomDescription} from '../../../../models/CustomDescription';

/**
 * A class that updates a Jason Agent Epistemic model.
 *
 * This update event relies on the assumptions of the JasonAgentEpistemicModel. I.e.:
 * -
 */
export class JasonAgentPublicAnnouncement implements EventModel<AgentExplicitEpistemicModel> {

    readonly propEval: Formula;

    constructor(propEval: Formula) {
        this.propEval = propEval;
    }

    /**
     * We assume the agent has done proper belief/knowledge revision, so we always try to apply the knowledge valuation to the model
     */
    async isApplicableIn(): Promise<boolean> {
        return Promise.resolve(true);
    }

    /**
     * Applies the set propositions to the initial model. Does not update the current model.
     * @param M (unused) the current model.
     */
    apply(M: AgentExplicitEpistemicModel): AgentExplicitEpistemicModel {

        // Use old events for non optimized
        if (!M.optimize) {
            let ann = ExplicitEventModel.getEventModelPublicAnnouncement(this.propEval);
            return ann.apply(M);
        }

        let resultModel = new AgentExplicitEpistemicModel();

        // Add all worlds from the initial model where the knowledge valuation 'propEval' is true
        for (let w of M.getWorldNames()) {
            if (M.modelCheck(w, this.propEval)) {
                let newName = w + '_e';

                resultModel.addWorld(newName, <World> M.getWorld(w));
            }
        }

        // Knowledge valuation has contradictions if there are no worlds (i.e. no pointed world was chosen).
        if (resultModel.getNumberWorlds() === 0) {
            console.warn('No resulting worlds. Knowledge valuation has contradictions.');
            return;
        }

        return resultModel;
    }

}


