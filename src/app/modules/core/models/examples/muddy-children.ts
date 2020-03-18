import { ExplicitEventModel } from './../eventmodel/explicit-event-model';
import { EventModelAction } from './../environment/event-model-action';
import { EventModel } from './../eventmodel/event-model';
import { WorldValuation } from '../epistemicmodel/world-valuation';
import { ExampleDescription } from '../environment/exampledescription';
import { ExplicitEpistemicModel } from '../epistemicmodel/explicit-epistemic-model';
import { Formula, FormulaFactory } from '../formula/formula';
import { Valuation } from '../epistemicmodel/valuation';


/**
 * @param truePropositions an array of true propositions. Proposition "ma" stands for "a is muddy" and "mb" stands for "b is muddy".
 * @returns a state corresponding to the muddy children puzzle
 * @example new MuddyChildrenWorld(["ma", "mb"])
 * */
class MuddyChildrenWorld extends WorldValuation {
    readonly nbChildren: number;
    readonly size;
    readonly agents;

    // The constructor should work for any number of agents, but now is supported only for 4 agents.
    constructor(valuation: Valuation, nbChildren: number) {
        super(valuation);
        this.nbChildren = nbChildren;

        this.agents = [];
        for (let i = 0; i <= this.nbChildren-1; i++) {
            this.agents.push("m" + MuddyChildren.getAgentName(i));
        }
    }
}


export class MuddyChildren extends ExampleDescription {

    readonly nbChildren: number;

    constructor(nbChildren: number) {
        super();
        this.nbChildren = nbChildren;
    }

    getAgents(): string[] {
        let A = [];
        for (let i = 0; i <= this.nbChildren-1; i++) {
            A.push(MuddyChildren.getAgentName(i));
        }
        return A;
    }

    getDescription(): string[] {
        return [this.nbChildren + " children play in the garden and some of them become muddy. Their father comes and say 'At least one of you has mud on her forehead'. He then asks several times 'Does any one of you know whether she has mud on her forehead?'"]
    }

    getAtomicPropositions(): string[] {
        let A = [];
        for (let i = 0; i <= this.nbChildren-1; i++) {
            A.push("m" + MuddyChildren.getAgentName(i));
        }
        return A;
    }

    getName() { return (this.nbChildren.toString()) + " Muddy Children" };

    /**
     * 
     * @param i 
     * @returns the agent's name of number i (agent's name of number 0 is a, of number 1 is b etc.)
     */
    static getAgentName(i: number) {
        return String.fromCharCode(97 + i);
    }

    generateAllBinaryStrings(n: number): string[] {
        if (n <= 0) {
            return [];
        }
        else if (n == 1) {
            return ["0", "1"]
        }
        else {
            let A = this.generateAllBinaryStrings(n - 1);
            let B = [];
            for (let i = 0; i < A.length; i++) {
                B.push(A[i] + "0");
                B.push(A[i] + "1");
            }
            return B;
        }
    }


    getInitialEpistemicModel() {
        let M = new ExplicitEpistemicModel();

        let A = this.generateAllBinaryStrings(this.nbChildren);
        for (let i = 0; i < A.length; i++) {
            let v: Map<string, boolean> = new Map();
            for (let k = 0; k <= A[i].length; k++) {
                v.set("m" + MuddyChildren.getAgentName(k), (A[i].charAt(k) == '1'))
            }
            M.addWorld("w" + A[i], new MuddyChildrenWorld(Valuation.buildFromMap(v), this.nbChildren));
        }
        

        for (let i = 0; i < this.nbChildren; i++) {
            let Av = this.generateAllBinaryStrings(i);
            let Ap = this.generateAllBinaryStrings(this.nbChildren - (i + 1))
            if (Av.length == 0) {
                Av.push("")
            }
            if (Ap.length == 0) {
                Ap.push("")
            }
           
            for (let iav = 0; iav < Av.length; iav++) {
                for (let iap = 0; iap < Ap.length; iap++) {
                    M.addEdgesCluster(MuddyChildren.getAgentName(i), ["w" + Av[iav] + "0" + Ap[iap], "w" + Av[iav] + "1" + Ap[iap]])
                }
            }
        }
        let winitial = "w"
        for (let i = 0; i < this.nbChildren; i++) {
            winitial += "1"
        }
        M.setPointedWorld(winitial);
        return M;
    }

    getActions() {
        let fatherann = "ma"
        let donotknowann = "(not (K a ma))"
        for (let i = 1; i < this.nbChildren; i++) {
            fatherann += " or m" + MuddyChildren.getAgentName(i)
            donotknowann += " and (not (K " + MuddyChildren.getAgentName(i) + " m" + MuddyChildren.getAgentName(i) + "))"
        }
        fatherann = "(" + fatherann + ")"
        donotknowann = "(" + donotknowann + ")"

        return [new EventModelAction({
            name: "Father says at least one child is muddy.",
            eventModel: ExplicitEventModel.getEventModelPublicAnnouncement(FormulaFactory.createFormula(fatherann), this.getAgents())
        }),

        new EventModelAction({
            name: "Publicly a is muddy!",
            eventModel: ExplicitEventModel.getEventModelPublicAnnouncement(FormulaFactory.createFormula("ma"), this.getAgents())
        }),

        new EventModelAction({
            name: "Children say they do not know.",
            eventModel: ExplicitEventModel.getEventModelPublicAnnouncement(FormulaFactory.createFormula(donotknowann), this.getAgents())
        })



        ];
    }

  
}
