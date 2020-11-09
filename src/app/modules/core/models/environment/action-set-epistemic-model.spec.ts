import {ActionSetEpistemicModel} from './action-set-epistemic-model';

describe('ActionSetEpistemicModel', () => {
  it('should create an instance', () => {
    expect(new ActionSetEpistemicModel({name: undefined, epistemicModel: undefined})).toBeTruthy();
  });
});
