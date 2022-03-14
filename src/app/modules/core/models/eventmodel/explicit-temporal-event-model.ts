import {Formula, FormulaFactory, NotFormula} from '../formula/formula';
import {EventModel} from './event-model';
import {ExplicitTemporalEpistemicModel} from '../epistemicmodel/explicit-temporal-epistemic-model';
import {environment} from '../environment';
import {JasonAgentPublicAnnouncement} from './jason-agent-public-announcement';
import {ExplicitEpistemicModel} from '../epistemicmodel/explicit-epistemic-model';
import {ExplicitEventModel} from './explicit-event-model';
import {Graph} from '../graph';
import {Postcondition} from './postcondition';
import {TrivialPostcondition} from './trivial-postcondition';
import {Event} from './event';
import {World} from '../epistemicmodel/world';

/**
 * A class that updates a Jason Agent Epistemic model.
 *
 * This update event relies on the assumptions of the JasonAgentEpistemicModel. I.e.:
 * -
 */
export class ExplicitTemporalEventModel extends Graph implements EventModel<ExplicitEpistemicModel> {

    setPointedAction(e: string) {
        if (this.nodes[e] == undefined)
            throw ("the action model does not contain any world of ID " + e);


        this.setPointedNode(e);
    }

    getPointedAction(): string {
        return this.getPointedNode();
    }


    /*	this.nodes = new Array();
      this.successors = new Array();
      this.dotstyle = "[shape=box, fillcolor=lightblue2, style=filled]";*/

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
            getShortDescription: function () {
                if (post.toString() == "idle")
                    return "pre: " + this.pre.prettyPrint();
                else
                    return "pre: " + this.pre.prettyPrint() + "; post: " + post.toString()
            }
            // toHTML: function() {return ' <table><tr><td>pre: </td><td>' + formulaPrettyPrint(this.pre) + '</td></tr><tr><td>post: </td><td>' + post.toString() + '</td></tr></table>'}
        });
    }



    /**
     @descrption Same specification as addAction.
     */
    addEvent(e, pre, post) {
        this.addAction(e, pre, post)
    }

    /**
     * @param e event identifier
     * @returns (the internal representation of) a formula that is the
     precondition of e
     * */
    getPrecondition(e): Formula {
        if (this.nodes[e] == undefined)
            console.log(e);
        return (<Event>this.nodes[e]).pre;
    }

    /**
     * @param e event identifier
     * @returns the postcondition of e. The postcondition is an object that
     should implement
     * */
    getPostcondition(e): Postcondition {
        return (<Event>this.nodes[e]).post;
    }


    async isApplicableIn(M: ExplicitEpistemicModel): Promise<boolean> {
        return M.check(this.getPrecondition(this.getPointedAction()));
    }
    /**
     * @param M epistemic model
     * @param E action model
     * @returns the epistemic model that is the product of M and E
     */

    /**
     * @param a world identifier w
     * @param an event identifier e
     * @returns the identifier of (w, e)
     */
    private createWorldActionName(w: string, e: string): string {
        //return "(" + w + ", " + e + ")";
        return w + "_" + e;
    }


    private getActionFromWorldAction(we: string) {
        let i = we.lastIndexOf("_");
        return we.substring(i);
    }


    private getWorldFromWorldAction(we: string) {
        let i = we.lastIndexOf("_");
        return we.substring(0, i);
    }


    private product(M: ExplicitEpistemicModel, E: ExplicitTemporalEventModel): ExplicitEpistemicModel {
        let ME = new ExplicitEpistemicModel();
        let agents = environment.agents;

        /**
         * Add all worlds/nodes that match the preconditions of all event nodes.
         */
        for (let w in M.getNodes())
            for (let e in E.nodes) {
                if (M.modelCheck(w, E.getPrecondition(e))) {
                    const we = this.createWorldActionName(w, e);
                    const newcontent: World = E.getPostcondition(e).perform(M, w);
                    ME.addWorld(we, newcontent);
                }
            }


        for (let w1 in M.getNodes())
            for (let e1 in E.nodes) {
                let we1 = this.createWorldActionName(w1, e1);

                if (ME.hasNode(we1)) {
                    // For all agents: get successors from current world and event
                    for (let a of agents) {
                        let succw1 = M.getSuccessorsID(w1, a);
                        let succe1 = E.getSuccessorsID(e1, a);

                        // Go through all successors
                        for (let w2 of succw1)
                            for (let e2 of succe1) {

                                let we2 = this.createWorldActionName(w2, e2);
                                if (ME.hasNode(we2)) {
                                    ME.addEdge(a, we1, we2);
                                }
                            }

                    }
                }
            }


        if (M.getPointedWorldID() != undefined && E.getPointedAction() != undefined) {
            let we = this.createWorldActionName(M.getPointedWorldID(), E.getPointedAction());
            if (ME.hasNode(we)) {
                ME.setPointedWorld(we);
            }
            else
                throw "cannot be applied!"
        }


        console.log("New Pointed World: " + ME.getPointedWorldID());
        console.log("Total Nodes: " + ME.getNodesNumber());
        console.log("Total Edges: " + ME.getNumberEdges());
        //console.log(ME)
        return ME;

    }

    apply(M: ExplicitEpistemicModel): ExplicitEpistemicModel {
        return this.product(M, this);
    }


    /**
     * The pre-condition acts as a filter for which worlds this announcement gets applied to.
     *
     * @param formula
     * @param agents
     */
    static getEventModelPublicAnnouncement(formula: Formula, agents=environment.agents): ExplicitEventModel {
        let E = new ExplicitEventModel();
        E.addAction("e", formula, new TrivialPostcondition());

        for (let a of agents)
            E.addEdge(a, "e", "e");

        E.setPointedAction("e");

        return E;

    }




    static getActionModelPrivateAnnouncement(formula: Formula, agent: string) {
        var E = new ExplicitEventModel();

        E.addAction("e", formula, new TrivialPostcondition());
        E.addAction("t", FormulaFactory.createFormula("top"), new TrivialPostcondition());


        E.addEdge(agent, "e", "e");
        E.addEdge(agent, "t", "t");
        E.setPointedAction("e");

        for (let a of environment.agents)
            if (a != agent) {
                E.addEdge(a, "e", "t");
                E.addEdge(a, "t", "t");

            }

        return E;
    }



    static getActionModelSemiPrivateAnnouncement(formula: Formula, agent: string) {

        var E = new ExplicitEventModel();
        E.addAction("e", formula, new TrivialPostcondition());
        E.addAction("t", FormulaFactory.createNegationOf(formula), new TrivialPostcondition());


        E.addEdge(agent, "e", "e");
        E.addEdge(agent, "t", "t");
        E.setPointedAction("e");

        for (let a of environment.agents)
            if (a != agent) {
                E.addEdge(a, "e", "t");
                E.addEdge(a, "t", "e");
                E.addEdge(a, "t", "t");
                E.addEdge(a, "e", "e");
            }

        return E;
    }


    // /**
    //  * The pre-condition acts as a filter for which worlds this announcement gets applied to.
    //  *
    //  * @param formula
    //  * @param agents
    //  */
    // static getTemporalPublicAnnouncement(formula: Formula, agents=environment.agents): ExplicitTemporalEventModel {
    //     return new ExplicitTemporalEventModel(formula);
    //
    // }

}


