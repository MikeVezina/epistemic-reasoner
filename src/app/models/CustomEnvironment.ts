import {Environment} from '../modules/core/models/environment/environment';
import {CustomDescription} from './CustomDescription';
import {Formula} from '../modules/core/models/epistemicmodel/formula';
import {FormulaFactory} from '../modules/core/models/formula/formula';
import {ExplicitFilterEventModel} from '../modules/core/models/eventmodel/explicit-filter-event-model';
import {createSocket} from 'dgram';
import {Valuation} from '../modules/core/models/epistemicmodel/valuation';
import {ExplicitEpistemicModel} from '../modules/core/models/epistemicmodel/explicit-epistemic-model';

export class CustomEnvironment extends Environment {

    private readonly customDesc: CustomDescription;
    private readonly agents: string[] = ['a', 'b', 'c', 'd'];

    constructor(desc: CustomDescription) {
        super(desc);
        this.customDesc = desc;
    }

    public getExampleDescription(): CustomDescription {
        return this.customDesc;
    }

    public getAgents(): string[] {
        return this.agents;
    }

    /**
     * Returns a Promise to determine whether or not a given formula is true or false in the current epistemic model.
     * @param formula
     */
    public async modelCheckFormula(formula: Formula | string): Promise<boolean> {
        if (formula instanceof String || typeof formula === 'string') {
            formula = FormulaFactory.createFormula(<string> formula);
        }

        return await this.getEpistemicModel().check(<Formula> formula);
    }

    async updateModel(props: Valuation, agent: string=CustomDescription.DEFAULT_AGENT): Promise<{success: Boolean, result: ExplicitEpistemicModel}> {
        let initModel = this.customDesc.getInitialEpistemicModel();

        let event = ExplicitFilterEventModel.getActionModelNewInformation(initModel, props, agent);

        let result = await CustomEnvironment.apply(event);
        let resultSuccess = result !== undefined;

        if (resultSuccess)
            this.setEpistemicModel(result);

        return {
            success: resultSuccess,
            result: this.getEpistemicModel()
        };

    }

    /**
     * Applies the filter model to the initial model (set in event constructor).
     * Returns the resulting model if the event is applicable, undefined otherwise.
     * @param event
     */
    static async apply(event: ExplicitFilterEventModel) : Promise<ExplicitEpistemicModel>
    {
        if (!event || !await event.isApplicableIn())
            return;

        return event.apply();
    }

    toJSON(): object {
        return this.valueOf();
    }

    valueOf(): Object {
        return {
            model: super.getEpistemicModel(),
            description: super.getExampleDescription()
        };
    }
}
