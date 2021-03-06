export class Valuation {
    public readonly propositions: { [id: string]: boolean } = {};

    constructor(truePropositions: { [id: string]: boolean } | string[]) {
        if (truePropositions instanceof Array) {
            const props = {};
            for (const proposition of truePropositions) {
                props[proposition] = true;
            }
            this.propositions = props;
        } else {
            this.propositions = truePropositions;
        }
    }

    static buildFromMap(A: Map<string, boolean>): Valuation {
        const trueProp = Array.from(A.keys()).filter(p => A.get(p));
        return new Valuation(trueProp);
    }

    isPropositionTrue(p: string) {
        return !!this.propositions[p];
    }

    /* the use of Maps is overkilling. Please use getPropositionMap */
    toAssignment(props: string[]): Map<string, boolean> {
        /* check support */
        for (const p of Object.keys(this.propositions)) {
            if (!props.includes(p)) {
                throw new Error('Valuation contains proposition ' + p + ' that is not in the support given');
            }
        }
        const assignment = new Map();
        for (const p of props) {
            if (this.isPropositionTrue(p)) {
                assignment.set(p, true);
            } else {
                assignment.set(p, false);
            }
        }
        return assignment;
    }

    toString() {
        const truePropositions = new Array();
        for (const proposition in this.propositions) {
            if (this.propositions[proposition] == true) {
                truePropositions.push(proposition);
            }
        }
        truePropositions.sort();
        return truePropositions.join();
    }

    getPropositionMap(): { [p: string]: boolean } {
        return this.propositions;
    }

    getClonedPropositionMap(): { [p: string]: boolean } {
        let clone: { [p: string]: boolean } = {};

        for (let key of Object.keys(this.propositions)) {
            clone[key] = this.propositions[key];
        }

        return clone;
    }
}
