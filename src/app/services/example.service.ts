import { MineSweeper } from './../modules/core/models/examples/mine-sweeper';
import { MuddyChildren } from './../modules/core/models/examples/muddy-children';
import { Injectable } from '@angular/core';
import { ExampleDescription } from '../modules/core/models/environment/exampledescription';
import { SimpleSymbolicHanabi } from '../modules/core/models/examples/symbolic-hanabi';
import { Simple } from '../modules/core/models/examples/simple';
import {NanoHanabi} from '../modules/core/models/examples/nanohanabi';
import {Identification} from '../modules/core/models/examples/identification';

@Injectable({
  providedIn: 'root'
})

/** this service is to give the correct exampledescription from menu to core. */
export class ExampleService {

  private exampleDescription: ExampleDescription = new Identification();
  //by default, the loaded example is .... :)

  setExampleDescription(exampleDescription: ExampleDescription) {
    this.exampleDescription = exampleDescription;
  }

  getExampleDescription() {
    return this.exampleDescription;
  }

  constructor() { }
}
