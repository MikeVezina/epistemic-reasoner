import { Environment } from './environment';
import {AcesAndEights} from '../examples/aces-and-eights';

describe('Environment', () => {
  it('should create an instance', () => {
    expect(new Environment(new AcesAndEights())).toBeTruthy();
  });
});
