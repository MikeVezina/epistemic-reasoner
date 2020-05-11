import {WorldValuation} from '../modules/core/models/epistemicmodel/world-valuation';
import {Valuation} from '../modules/core/models/epistemicmodel/valuation';

export class CustomWorld extends WorldValuation {
    constructor(valuation: Valuation) {
        super(valuation);
    }

}
