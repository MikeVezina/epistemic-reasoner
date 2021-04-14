import {JasonAgentEnvironment} from './app/models/JasonAgentEnvironment';


function testMonotonic(cur, prev) {
    let startTime = Date.now();

    let res = JasonAgentEnvironment.isMonotonicUpdate(cur, prev);

    console.log("Update Time: " + (Date.now() - startTime));
    console.log("Res: " + res);
    console.log("Prev Size: " + Object.keys(prev).length);
    console.log("Cur Size: " + Object.keys(cur).length);
}

function makeFakeVal(size, fakeVal={}) {
    let newFake = {};
    Object.assign(newFake, fakeVal)

    let curSz = Object.keys(newFake).length;

    while (curSz < size)
    {
        let nextKey = curSz + "";
        newFake[nextKey] = true;
        curSz++;
    }

    return newFake;
}

function testMetrics(init, target) {
    let faker = makeFakeVal(init)
    let extended = makeFakeVal(target, faker)
    testMonotonic(extended, faker)
}

testMetrics(10000, 20000)


