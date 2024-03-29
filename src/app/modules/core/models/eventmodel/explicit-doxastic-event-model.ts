import {environment} from '../environment';
import {Postcondition} from './postcondition';
import {TrivialPostcondition} from './trivial-postcondition';
import {Formula, FormulaFactory} from './../formula/formula';
import {EventModel} from './event-model';
import {Graph} from './../graph';
import {Event} from './event';
import {World} from '../epistemicmodel/world';
import {ExplicitDoxasticModel} from '../epistemicmodel/explicit-doxastic-model';
import {CustomDescription} from '../../../../models/CustomDescription';

export class ExplicitDoxasticEventModel extends Graph implements EventModel<ExplicitDoxasticModel> {

    protected temporalSuccessors: { [key: string]: any; } = new Map();

    setPointedAction(e: string) {
        if (this.nodes[e] == undefined) {
            throw ('the action model does not contain any world of ID ' + e);
        }


        this.setPointedNode(e);
    }

    getPointedAction(): string {
        return this.getPointedNode();
    }

    addTemporalSuccessor(w, w2) {
        let tempSucc = this.temporalSuccessors.get(w) || [];
        if (tempSucc === undefined) {
            tempSucc = [];
        }

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
            getShortDescription: function() {
                if (post.toString() == 'idle') {
                    return 'pre: ' + this.pre.prettyPrint();
                } else {
                    return 'pre: ' + this.pre.prettyPrint() + '; post: ' + post.toString();
                }
            }
            // toHTML: function() {return ' <table><tr><td>pre: </td><td>' + formulaPrettyPrint(this.pre) + '</td></tr><tr><td>post: </td><td>' + post.toString() + '</td></tr></table>'}
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


    async isApplicableIn(M: ExplicitDoxasticModel): Promise<boolean> {
        return M.check(this.getPrecondition(this.getPointedAction()));
    }

    apply(M: ExplicitDoxasticModel): ExplicitDoxasticModel {

        /**
         * @param a world identifier w
         * @param an event identifier e
         * @returns the identifier of (w, e)
         */
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

        function filter(M: ExplicitDoxasticModel, E: ExplicitDoxasticEventModel): ExplicitDoxasticModel {
            let ME = new ExplicitDoxasticModel();
            let agents = environment.agents;

            /**
             * Add all worlds/nodes that match the preconditions of all event nodes.
             */
            for (let w in M.getNodes()) {
                for (let e in E.nodes) {
                    if (M.modelCheck(w, E.getPrecondition(e))) {
                        const we = createWorldActionName(w, e);
                        const newcontent: World = E.getPostcondition(e).perform(M, w);
                        ME.addWorld(we, newcontent);
                    }
                }
            }


            for (let w1 in M.getNodes()) {
                for (let e1 in E.nodes) {
                    let we1 = createWorldActionName(w1, e1);
                    if (ME.hasNode(we1)) {

                        // For all agents: get successors from current world and event
                        for (let a of agents) {
                            let succw1 = M.getSuccessorsID(w1, a);
                            let succe1 = E.getSuccessorsID(e1, a);

                            // Go through all successors
                            for (let w2 of succw1) {
                                for (let e2 of succe1) {

                                    let we2 = createWorldActionName(w2, e2);
                                    if (ME.hasNode(we2)) {
                                        ME.addEdge(a, we1, we2);
                                    }
                                }
                            }

                        }
                    }
                }
            }


            if (M.getPointedWorldID() != undefined && E.getPointedAction() != undefined) {
                let we = createWorldActionName(M.getPointedWorldID(), E.getPointedAction());
                if (ME.hasNode(we)) {
                    ME.setPointedWorld(we);
                    // ME.removeUnvisitedNodes()
                    // ME.removeUnReachablePartFrom(we);
                } else {
                    throw 'cannot be applied!';
                }
            }


            console.log('New Pointed World: ' + ME.getPointedWorldID());
            console.log(ME);
            return ME;
        }

        /**
         * @param M epistemic model
         * @param E action model
         * @returns the epistemic model that is the product of M and E
         */
        function product(M: ExplicitDoxasticModel, E: ExplicitDoxasticEventModel): ExplicitDoxasticModel {
            let ME = new ExplicitDoxasticModel();
            // let agents = environment.agents;
            let agentName = CustomDescription.DEFAULT_AGENT;

            // Store the worlds that match each event pre-condition, mapped by event ID.
            // event ID -> { new world name -> old world name }
            let matchingWorlds: { [key: string]:  { [newName: string]: string } } = {};

            for (let e in E.nodes) {
                matchingWorlds[e] = {};
            }

            /**
             * Add all worlds/nodes that match the preconditions of all event nodes.
             */
            for (let w in M.getNodes()) {
                for (let e in E.nodes) {
                    if (M.modelCheck(w, E.getPrecondition(e))) {
                        const we = createWorldActionName(w, e);
                        const newcontent: World = E.getPostcondition(e).perform(M, w);
                        ME.addWorld(we, newcontent);

                        matchingWorlds[e][we] = w;
                    }
                }
            }


            // Recall that the plausibility relation is denoted: '>='...
            // When (f, e) in >=, e is at least (or more) plausible than f: f >= e
            // Therefore most-plausible worlds are any world x where (x, _) does not exist
            for (let e in E.nodes) {
                let eventSucc = E.getSuccessorsIDSet(e, agentName);

                // Go through all event successors, where e >= f
                for (let f of Array.from(eventSucc)) {
                    let fSucc = E.getSuccessorsIDSet(f, agentName);

                    // If strictly e > f, add worlds matching (e, f) to relation
                    if (!fSucc.has(e)) {
                        for (let eW of Object.keys(matchingWorlds[e])) {
                            for (let fW of Object.keys(matchingWorlds[f])) {
                                ME.addEdge(agentName, eW, fW);
                            }
                        }
                        continue;
                    }

                    // Else e == f, only add to relation if worlds pairs were previously
                    for (let wE of Object.keys(matchingWorlds[e])) {
                        let oldWe = matchingWorlds[e][wE];
                        let worldSucc = M.getSuccessorsIDSet(oldWe, agentName);

                        for (let wF of Object.keys(matchingWorlds[f])) {
                            let oldWf = matchingWorlds[e][wF];
                            if (worldSucc.has(oldWf)) {
                                ME.addEdge(agentName, wE, wF);
                            }
                        }
                    }
                }
            }


            if (M.getPointedWorldID() != undefined && E.getPointedAction() != undefined) {
                let we = createWorldActionName(M.getPointedWorldID(), E.getPointedAction());
                if (ME.hasNode(we)) {
                    ME.setPointedWorld(we);
                } else {
                    throw 'cannot be applied!';
                }
            }


            console.log('New Pointed World: ' + ME.getPointedWorldID());
            console.log('Total Nodes: ' + ME.getNodesNumber());
            console.log('Total Edges: ' + ME.getNumberEdges());
            //console.log(ME)
            return ME;

        }


        return product(M, this);
    }


    /**
     * The pre-condition acts as a filter for which worlds this announcement gets applied to.
     *
     * @param formula
     * @param agents
     */
    static getEventModelPublicAnnouncement(formula: Formula, agents = [CustomDescription.DEFAULT_AGENT]): ExplicitDoxasticEventModel {
        let E = new ExplicitDoxasticEventModel();
        E.addAction('e', formula, new TrivialPostcondition());
        E.addAction('f', FormulaFactory.createNegationOf(formula), new TrivialPostcondition());

        for (let a of agents) {
            E.addEdge(a, 'f', 'e');
            E.makeReflexiveRelation(a)
        }

        E.setPointedAction('e');

        return E;

    }


    static getActionModelPrivateAnnouncement(formula: Formula, agent: string) {
        var E = new ExplicitDoxasticEventModel();

        E.addAction('e', formula, new TrivialPostcondition());
        E.addAction('t', FormulaFactory.createFormula('top'), new TrivialPostcondition());


        E.addEdge(agent, 'e', 'e');
        E.addEdge(agent, 't', 't');
        E.setPointedAction('e');

        for (let a of environment.agents) {
            if (a != agent) {
                E.addEdge(a, 'e', 't');
                E.addEdge(a, 't', 't');

            }
        }

        return E;
    }


    static getActionModelSemiPrivateAnnouncement(formula: Formula, agent: string) {

        var E = new ExplicitDoxasticEventModel();
        E.addAction('e', formula, new TrivialPostcondition());
        E.addAction('t', FormulaFactory.createNegationOf(formula), new TrivialPostcondition());


        E.addEdge(agent, 'e', 'e');
        E.addEdge(agent, 't', 't');
        E.setPointedAction('e');

        for (let a of environment.agents) {
            if (a != agent) {
                E.addEdge(a, 'e', 't');
                E.addEdge(a, 't', 'e');
                E.addEdge(a, 't', 't');
                E.addEdge(a, 'e', 'e');
            }
        }

        return E;
    }


}


