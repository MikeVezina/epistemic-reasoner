import {SuccessorSet} from './successor-set';
import {Formula} from '../formula/formula';
import {World} from './world';
import {EpistemicModel} from './epistemic-model';

/**
 * An EpistemicModel is an interface used by the GUI. The implementation may be an explicit graph or
 * a symbolic representation, or... something else.
 */
export interface TemporalEpistemicModel extends EpistemicModel {
    /**
     * 
     * @param w 
     * @param a 
     * @returns a list of 'yesterday' worlds for agent a in world w.
     */
    getYesterday(): TemporalEpistemicModel;
    
    /**
     * 
     * @param formula 
     * @returns true if the formula is true in the pointed world
     */
    check(formula: Formula): Promise<boolean>;

}
