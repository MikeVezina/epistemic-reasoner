import {JasonAgentEnvironment} from './app/models/JasonAgentEnvironment';
import {ExplicitEpistemicModel} from './app/modules/core/models/epistemicmodel/explicit-epistemic-model';
import {WorldValuation} from './app/modules/core/models/epistemicmodel/world-valuation';
import {Valuation} from './app/modules/core/models/epistemicmodel/valuation';
import {CustomDescription} from './app/models/CustomDescription';
import {AgentExplicitEpistemicModel} from './app/modules/core/models/epistemicmodel/agent-explicit-epistemic-model';
import process from 'process';


function testMonotonic(cur, prev) {
    let startTime = Date.now();

    let res = JasonAgentEnvironment.isMonotonicUpdate(cur, prev);

    console.log('Update Time: ' + (Date.now() - startTime));
    console.log('Res: ' + res);
    console.log('Prev Size: ' + Object.keys(prev).length);
    console.log('Cur Size: ' + Object.keys(cur).length);
}

function makeFakeVal(size, fakeVal = {}) {
    let newFake = {};
    Object.assign(newFake, fakeVal);

    let curSz = Object.keys(newFake).length;

    while (curSz < size) {
        let nextKey = curSz + '';
        newFake[nextKey] = true;
        curSz++;
    }

    return newFake;
}

function testMetrics(init, target) {
    let faker = makeFakeVal(init);
    let extended = makeFakeVal(target, faker);
    testMonotonic(extended, faker);
}

// testMetrics(10000, 20000)


function generateMapData(w, h, obs) {
    function createMarker(x, y) {
        return {
            'location': {
                'x': x,
                'y': y
            },
            'type': 4
        };
    }


    let mapData = {
        width: w,
        height: h,
        agentStart: {
            x: 3,
            y: 0
        },
        markers: [
            {
                "location": {
                    "x": 2,
                    "y": 3
                },
                "type": 8
            },
        ]
    };

    let markers = new Set();

    markers.add("3,0");
    markers.add("2,3");

    let start = markers.size;

    while(markers.size - start < obs)
    {
        let x = Math.trunc(Math.random() * w);
        let y = Math.trunc(Math.random() * h);

        // Can not be start position
        if (markers.has(x + "," + y))
            continue;

        markers.add(x + "," + y);

        mapData.markers.push(createMarker(x,  y));
    }

    console.log(JSON.stringify(mapData));

}

// generateMapData(5, 5, 2);
// generateMapData(15, 15, 18);
// generateMapData(25, 25, 50);
// generateMapData(50, 50, 200);
// generateMapData(100, 100, 800);
//



function measure(initM, size)
{
    let startHeap = process.memoryUsage().heapUsed;
    let M = initM();

    let orig = M instanceof ExplicitEpistemicModel;

    let startTime = Date.now();
    for (let i = 0; i < size; i++) {
        M.addWorld(String(i), new WorldValuation(new Valuation([])));
    }
    if(orig)
        M.bulkAddEdges(CustomDescription.DEFAULT_AGENT);

    let end = Date.now();
    let endHeap = process.memoryUsage().heapUsed;

    if(orig)
        console.log('Original: ' + (end - startTime) + " ms, " + ((endHeap - startHeap) / 1000 / 1000) + " MB");
    else
        console.log('Optimized: ' + (end - startTime) + " ms, " + ((endHeap - startHeap) / 1000 / 1000) + " MB");
}

for (let i of [100, 200, 500, 1000, 2000, 5000, 10000]) {
    console.log("Worlds: " + i);
    measure(() => new ExplicitEpistemicModel(), i)
    measure(() => new AgentExplicitEpistemicModel(), i)

}