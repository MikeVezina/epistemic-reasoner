import {EpistemicModel} from '../epistemicmodel/epistemic-model';
import {World} from '../epistemicmodel/world';


class Point {
    x: number;
    y: number;
}

export abstract class ExampleDescription {
    abstract getAtomicPropositions(): string[]
    abstract getName();
    abstract getInitialEpistemicModel(): EpistemicModel;
    abstract getDescription(): string[]
    abstract getActions();
    abstract getAgents(): string[];

    getWorldExample(): World {
        let M = this.getInitialEpistemicModel(); 
        return M.getPointedWorld();
    }
}
