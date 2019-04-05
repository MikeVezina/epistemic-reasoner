import { Simple } from './../core/models/examples/simple';
import { LinesBirthday } from './../core/models/examples/lines-birthday';
import { Cherylsbirthday } from './../core/models/examples/cherylsbirthday';
import { MineSweeper } from './../core/models/examples/mine-sweeper';
import { Belote } from './../core/models/examples/belote';
import {Router} from '@angular/router';
import { ConsecutiveNumbers } from './../core/models/examples/consecutive-numbers';
import { MuddyChildren } from './../core/models/examples/muddy-children';
import { ExampleDescription } from './../core/models/environment/exampledescription';
import { Component, OnInit, Input } from '@angular/core';
import { ExampleService } from 'src/app/services/example.service';



@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {

  examples = [new Simple(), new MuddyChildren(), new MineSweeper(), new ConsecutiveNumbers(), new Belote(),
    new Cherylsbirthday(), new LinesBirthday()];

  openExampleDescription(exampleDescription: ExampleDescription ) {
    this.exampleService.setExampleDescription(exampleDescription);
    this.router.navigate(['core']);
  }
  constructor(private exampleService: ExampleService, private router: Router) { }

  ngOnInit() {
  }

}
