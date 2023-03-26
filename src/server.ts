// Map exception source locations to typescript
import {install} from 'source-map-support';

install();

import {ApiRouter} from './app/ApiRouter';
import cors from 'cors';
import {ExplicitDoxasticModel} from './app/modules/core/models/epistemicmodel/explicit-doxastic-model';
import {WorldValuation} from './app/modules/core/models/epistemicmodel/world-valuation';
import {Valuation} from './app/modules/core/models/epistemicmodel/valuation';
import {CustomDescription} from './app/models/CustomDescription';
import {ExplicitDoxasticEventModel} from './app/modules/core/models/eventmodel/explicit-doxastic-event-model';
import {FalseFormula, FormulaFactory} from './app/modules/core/models/formula/formula';
import {ExplicitEpistemicModel} from './app/modules/core/models/epistemicmodel/explicit-epistemic-model';
import {ExplicitEventModel} from './app/modules/core/models/eventmodel/explicit-event-model';
import {Postcondition} from './app/modules/core/models/eventmodel/postcondition';
import {PropositionalAssignmentsPostcondition} from './app/modules/core/models/eventmodel/propositional-assignments-postcondition';
import {TrivialPostcondition} from './app/modules/core/models/eventmodel/trivial-postcondition';

//Install express server
const express = require('express');
const bodyParser = require('body-parser');

const app = express();


app.use((req, res, next) => {
    console.log('Received request ' + req.url + ", with size: " + req.headers['content-length']);
    next();
});
// Express 4.0
app.use(bodyParser.json({limit: '500mb'}));
app.use(bodyParser.urlencoded({limit: '500mb', extended: true}));



app.use(cors());


// testDoxastic();

// testBeliefUpdate();
// testTransitionMultiple();

let a = new ApiRouter();
a.createApp(app, true);
// a.createApp(app);

// Start the app on the provided port
let port = process.env.PORT || 9090;

app.listen(port, () => {
    console.log('Application server started on port ' + port);
});


function testTransitionMultiple() {
    let model = new ExplicitEpistemicModel();
    model.addWorld('1', new WorldValuation(new Valuation(['p'])));

    let event = new ExplicitEventModel();
    event.addAction('e',
        FormulaFactory.createFormula('p'),
        new PropositionalAssignmentsPostcondition(
            {
                'p': FormulaFactory.createFalse(),
                'q': FormulaFactory.createTrue()
            }));

    event.addEdge(CustomDescription.DEFAULT_AGENT, 'e', 'e');

    event.setPointedAction('e');

    let result = event.apply(model);

    console.log('done', result);


    // model.addWorld('2', new WorldValuation(new Valuation(['w2', 'q'])))
    // model.addWorld('3', new WorldValuation(new Valuation(['w3', 'p', 'q'])))
    // model.addWorld('4', new WorldValuation(new Valuation(['w4', 'p', 'r'])))
    // model.addWorld('5', new WorldValuation(new Valuation(['w5', 'r'])))
    // model.makeReflexiveRelation(CustomDescription.DEFAULT_AGENT)
    //
    //
    // let event = new ExplicitEventModel();
    // event.addAction('e', FormulaFactory.createFormula('w1'), createTransitionPostcondition(model, '1', '2'))
    // event.addAction('f', FormulaFactory.createFormula('w1'), createTransitionPostcondition(model, '1', '3'))
    // event.addEdge(CustomDescription.DEFAULT_AGENT, 'e', 'e');
    // event.addEdge(CustomDescription.DEFAULT_AGENT, 'e', 'f');
    // event.addEdge(CustomDescription.DEFAULT_AGENT, 'f', 'e');
    // event.addEdge(CustomDescription.DEFAULT_AGENT, 'f', 'f');
    // event.setPointedAction('e');
    //
    // let result = event.apply(model);
    //
    // console.log('done', result)
}


function testBeliefUpdate() {
    let model = new ExplicitEpistemicModel();
    model.addWorld('1', new WorldValuation(new Valuation(['1', 'p'])));
    model.addWorld('2', new WorldValuation(new Valuation(['2', 'q'])));
    model.addWorld('3', new WorldValuation(new Valuation(['3', 'p', 'q'])));
    model.addWorld('4', new WorldValuation(new Valuation(['4', 'p', 'r'])));
    model.addWorld('5', new WorldValuation(new Valuation(['5', 'r'])));
    model.makeReflexiveRelation(CustomDescription.DEFAULT_AGENT);


    let event = new ExplicitEventModel();
    event.addAction('e', FormulaFactory.createFormula('1'), createTransitionPostcondition(model, '1', '2'));
    event.addEdge(CustomDescription.DEFAULT_AGENT, 'e', 'e');
    event.setPointedAction('e');

    let result = event.apply(model);

    console.log('done', result);
}

function createTransitionPostcondition(M: ExplicitEpistemicModel, w1: string, w2: string) {
    if (!M.hasNode(w1) || !M.hasNode(w2)) {
        console.log(w1 + ' or ' + w2 + ' does not exist in the model');
        return new TrivialPostcondition();
    }

    let preUpdateVal = (<WorldValuation> M.getNode(w1)).valuation.propositions;
    let postUpdateVal = (<WorldValuation> M.getNode(w2)).valuation.propositions;

    let postConditionAssignment = {};

    for (let pre of Object.keys(preUpdateVal)) {
        postConditionAssignment[pre] = new FalseFormula();
    }

    for (let post of Object.keys(postUpdateVal)) {
        postConditionAssignment[post] = postUpdateVal[post] + '';
    }


    return new PropositionalAssignmentsPostcondition(postConditionAssignment);
}


function testDoxastic() {
    let doxModel = new ExplicitDoxasticModel();
    doxModel.addWorld('1', new WorldValuation(new Valuation(['p'])));
    doxModel.addWorld('2', new WorldValuation(new Valuation(['q'])));
    doxModel.addWorld('3', new WorldValuation(new Valuation(['p', 'q'])));
    doxModel.addWorld('4', new WorldValuation(new Valuation(['p', 'r'])));
    doxModel.addWorld('5', new WorldValuation(new Valuation(['r'])));

    // All worlds are initially equi-plausible (equivalence)
    doxModel.bulkAddEdges(CustomDescription.DEFAULT_AGENT);

    let formula = FormulaFactory.createFormula('p');

    let pEvent = ExplicitDoxasticEventModel.getEventModelPublicAnnouncement(formula);

    // {1, 3, 4} <= {2, 5}
    let pPlausModel = pEvent.apply(doxModel);

    let notPEvent = ExplicitDoxasticEventModel.getEventModelPublicAnnouncement(FormulaFactory.createNegationOf(formula));
    let notPPlausModel = notPEvent.apply(doxModel);
    let notPPlausSecondModel = notPEvent.apply(pPlausModel);

    console.log('Done');
}
