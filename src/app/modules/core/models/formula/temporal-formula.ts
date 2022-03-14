import {ModalOperatorFormula} from './formula';


export class YFormula extends ModalOperatorFormula {
    isBoolean() {
        return false;
    }

    readonly type = "Y";
    clone(): ModalOperatorFormula {
        return new YFormula(this.agent, this.formula);
    }

    opString(): string {
        return "Y";
    }
}
