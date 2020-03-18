import { SuccessorSet } from './successor-set';
import {ExplicitSuccessorSet} from './explicit-successor-set';

describe('SuccessorSet', () => {
  it('should create an instance', () => {
    expect(new ExplicitSuccessorSet([])).toBeTruthy();
  });
});
