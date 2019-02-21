import { environment } from 'src/environments/environment';
import { ExplicitEpistemicModel } from './../epistemicmodel/explicit-epistemic-model';
import { Postcondition } from './postcondition';
import { PropositionalAssignmentsPostcondition } from './propositional-assignments-postcondition';
import { TrivialPostcondition } from './trivial-postcondition';
import { Formula } from './../formula/formula';
import { EventModel } from './event-model';
import { Graph } from './../graph';
import { Event } from './event';

export class ExplicitEventModel extends Graph implements EventModel {

    setPointedAction(e: string) {
        if (this.nodes[e] == undefined)
            throw ("the action model does not contain any world of ID " + e);


        this.setPointedNode(e);
    }

    getPointedAction() {
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



    apply(M: ExplicitEpistemicModel): ExplicitEpistemicModel {

        /**
         * @param a world identifier w
         * @param an event identifier e
         * @returns the identifier of (w, e)
         */
        function createWorldActionName(w: string, e: string): string {
            //return "(" + w + ", " + e + ")";
            return w + "_" + e;
        }


        function getActionFromWorldAction(we: string) {
            let i = we.lastIndexOf("_");
            return we.substring(i);
        }


        function getWorldFromWorldAction(we: string) {
            let i = we.lastIndexOf("_");
            return we.substring(0, i);
        }
        /**
         * @param M epistemic model
         * @param E action model
         * @returns the epistemic model that is the product of M and E
         */
        function product(M: ExplicitEpistemicModel, E: ExplicitEventModel): ExplicitEpistemicModel {
            let ME = new ExplicitEpistemicModel();
            let agents = environment.agents;

            for (let w in M.getNodes())
                for (let e in E.nodes) {
                    if (M.modelCheck(w, E.getPrecondition(e))) {
                        let we = createWorldActionName(w, e);

                        let newcontent = E.getPostcondition(e).perform(M, w);
                        newcontent.lastWorldID = w;
                        ME.addWorld(we, newcontent);
                    }
                }



            for (let w1 in M.getNodes())
                for (let e1 in E.nodes) {
                    let we1 = createWorldActionName(w1, e1);
                    if (ME.hasNode(we1)) {
                        for (let a of agents) {
                            let succw1 = M.getSuccessorsID(w1, a);
                            let succe1 = E.getSuccessorsID(e1, a);
                            for (let w2 of succw1)
                                for (let e2 of succe1) {
                                    let we2 = createWorldActionName(w2, e2);
                                    if (ME.hasNode(we2)) {
                                        ME.addEdge(a, we1, we2);
                                    }
                                }

                        }
                    }
                }


            if (M.getPointedWorldID() != undefined && E.getPointedAction() != undefined) {
                let we = createWorldActionName(M.getPointedWorldID(), E.getPointedAction());
                if (ME.hasNode(we))
                    ME.setPointedWorld(we);
                    else
                    throw "cannot be applied!"
            }
            

            console.log(ME)
            return ME;

        }



        return product(M, this);
    }









    static getEventModelPublicAnnouncement(formula: Formula): ExplicitEventModel {

        let E = new ExplicitEventModel();
        E.addAction("e", formula, new TrivialPostcondition());

        for (let a of environment.agents)
            E.addEdge(a, "e", "e");

        E.setPointedAction("e");

        return E;

    }
}

