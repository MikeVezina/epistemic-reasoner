var fetch = require('node-fetch');


function makeFakeVal(size, fakeVal = {}) {
    let newFake = {};
    Object.assign(newFake, fakeVal)

    let curSz = Object.keys(newFake).length;

    while (curSz < size) {
        let rand = Math.floor(Math.random() * 100) + 1;
        let nextKey = "fake-" + rand;
        newFake[nextKey] = false;
        curSz++;
    }

    return newFake;
}
function makeFakes(init, size) {
    let newFake = {};

    let curSz = 0;

    while (curSz < size) {
        let next = init + curSz
        let nextKey = "fake-" + next;
        newFake[nextKey] = false;
        curSz++;
    }

    return newFake;
}

async function testMetrics(init, size) {

    let faker = makeFakes(init, size)
    let start = Date.now();
    await sendReq(faker)
    console.log("Update Time: " + (Date.now() - start) + " for " + size)
    return init + size;
}


async function sendReq(props) {
    var myHeaders = {};
    myHeaders["Content-Type"] ="application/json";

    let body = JSON.stringify({"props": props});

    var requestOptions = {
        method: 'PUT',
        headers: myHeaders,
        body,
        redirect: 'manual',
        cache: 'no-cache'
    };

    return await fetch("http://localhost:9090/api/props", requestOptions).then(async res => {
        return await res.json();
    })
}
let main = async () => {
    let next = await testMetrics(0, 1)
    console.log("====")
    next = await testMetrics(next, 4)
    next = await testMetrics(next, 40)
    next = await testMetrics(next, 400)
    next = await testMetrics(next, 4000)
    // await testMetrics(4000, 4000)
};

main();

//
// testMetrics(100, 1000)
// testMetrics(1000, 1005)
