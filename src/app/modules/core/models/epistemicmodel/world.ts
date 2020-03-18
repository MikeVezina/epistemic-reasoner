
export abstract class World {

  constructor() {

  }

  /**
   * @param phi 
   * @returns true if the proposition phi is true in the world
   */
  abstract modelCheck(phi: string);
  abstract toString();
}
