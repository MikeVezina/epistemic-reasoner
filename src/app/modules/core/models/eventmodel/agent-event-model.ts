import {ExplicitEpistemicModel} from '../epistemicmodel/explicit-epistemic-model';

import {Formula, FormulaFactory, NotFormula} from '../formula/formula';
import {ExplicitEventModel} from './explicit-event-model';
import {World} from '../epistemicmodel/world';
import {EventModel} from './event-model';
import {AgentExplicitEpistemicModel} from '../epistemicmodel/agent-explicit-epistemic-model';
import {WorldTransferPostcondition} from './world-transfer-postcondition';
import {Postcondition} from './postcondition';
import {TrivialPostcondition} from './trivial-postcondition';
import {environment} from '../environment';
import {Graph} from '../graph';
import {Event} from './event';

/**
 * A class that updates a Jason Agent Epistemic model.
 *
 * This update event relies on the assumptions of the JasonAgentEpistemicModel. I.e.:
 * -
 */
export class AgentEventModel extends Graph implements EventModel<AgentExplicitEpistemicModel> {

    constructor() {
        super();
    }

    /**
     * We assume the agent has done proper belief/knowledge revision, so we always try to apply the knowledge valuation to the model
     */
    async isApplicableIn(): Promise<boolean> {
        return Promise.resolve(true);
    }

    /**
     * @memberof ActionModel
     * @param e event identifier
     * @param pre a precondition (a formula).
     * @param post a postcondition (an object that represents the postcondition).
     If post is undefined/unspecified, then the postcondition is trivial
     If post is an associate array then post is implicitely replaced by
     new PropositionalAssignmentsPostcondition(post)
     * @example E.addAction("e1", createFormula("(K a p)"))
     * @example E.addAction("e1", "(K a p)")
     * @example E.addAction("e1", "(K a p)", {"p": "(K a q)", "q": "(not p)"})
     * */
    addAction(e: string, pre: Formula, post: Postcondition = new TrivialPostcondition()) {
        this.addNode(e, {
            pre: pre,
            post: post,
            getShortDescription: function() {
                if (post.toString() == 'idle') {
                    return 'pre: ' + this.pre.prettyPrint();
                } else {
                    return 'pre: ' + this.pre.prettyPrint() + '; post: ' + post.toString();
                }
            }
        });
    }


    /**
     @descrption Same specification as addAction.
     */
    addEvent(e, pre, post) {
        this.addAction(e, pre, post);
    }

    /**
     * @param e event identifier
     * @returns (the internal representation of) a formula that is the
     precondition of e
     * */
    getPrecondition(e): Formula {
        if (this.nodes[e] == undefined) {
            console.log(e);
        }
        return (<Event> this.nodes[e]).pre;
    }

    /**
     * @param e event identifier
     * @returns the postcondition of e. The postcondition is an object that
     should implement
     * */
    getPostcondition(e): Postcondition {
        return (<Event> this.nodes[e]).post;
    }

    /**
     * Apply the event to model M, and place the result in R
     * @param M
     * @param R The output (resultant) model
     */
    applyResult(M: AgentExplicitEpistemicModel): AgentExplicitEpistemicModel {

        function createWorldActionName(w: string, e: string): string {
            //return "(" + w + ", " + e + ")";
            return w + '_' + e;
        }

        function getActionFromWorldAction(we: string) {
            let i = we.lastIndexOf('_');
            return we.substring(i);
        }

        function getWorldFromWorldAction(we: string) {
            let i = we.lastIndexOf('_');
            return we.substring(0, i);
        }


        let ME = new AgentExplicitEpistemicModel();

        /**
         * Add all worlds/nodes that match the preconditions of all event nodes.
         */
        for (let w of M.getWorldNames()) {
            for (let e in this.nodes) {
                if (M.modelCheck(w, this.getPrecondition(e))) {
                    const we = createWorldActionName(w, e);
                    const newWorld: World = this.getPostcondition(e).perform(M, w);

                    ME.addWorld(we, newWorld);
                }
            }
        }

        // Edges are implicit, so no need to add them here
        // Same with pointed world


        // Knowledge valuation has contradictions if there are no worlds (i.e. no pointed world was chosen).
        if (ME.getNumberWorlds() === 0) {
            console.warn('No resulting worlds.');
        }

        return ME;
    }

    /**
     * Applies the set propositions to the initial model. Does not update the current model.
     * @param M (unused) the current model.
     */
    apply(M: AgentExplicitEpistemicModel): AgentExplicitEpistemicModel {
        return this.applyResult(M);
    }

}


