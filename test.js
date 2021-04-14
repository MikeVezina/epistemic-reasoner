var fetch = require('node-fetch');


function makeFakeVal(size, fakeVal = {}) {
    let newFake = {};
    Object.assign(newFake, fakeVal)

    let curSz = Object.keys(newFake).length;

    while (curSz < size) {
        let nextKey = "fake-" + curSz;
        newFake[nextKey] = false;
        curSz++;
    }

    return newFake;
}

async function testMetrics(init, target) {

    let start = Date.now();
    let faker = makeFakeVal(init)
    await sendReq(faker)
    console.log("Update Time: " + (Date.now() - start) + " for " + init)

    if (target === undefined)
        return;

    start = Date.now();

    let extended = makeFakeVal(target, faker)
    let t = await sendReq(extended)
    console.log("Update Time: " + (Date.now() - start) + " for " + target + " from " + init)

}


async function sendReq(props) {
    var myHeaders = {};
    myHeaders["Content-Type"] ="application/json";

    let body = JSON.stringify({"props": props});

    var requestOptions = {
        method: 'PUT',
        headers: myHeaders,
        body,
        redirect: 'follow'
    };

    return await fetch("http://localhost:9090/api/props", requestOptions)
}
let main = async () => {
    await testMetrics(4)
    await testMetrics(40)
    await testMetrics(400)
    await testMetrics(4000)
};

main();

//
// testMetrics(100, 1000)
// testMetrics(1000, 1005)
