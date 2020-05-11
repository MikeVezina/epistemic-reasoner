import {ApiRouter} from './ApiRouter';
import {createSocket} from 'dgram';

const POST = 'post';

const GET = 'get';

class MockApp {
    mappings = {'post': {}, 'get': {}};

    post(endpoint, handler) {
        let mapping = this.mappings[POST] || {};
        mapping[endpoint] = handler;
        this.mappings[POST] = mapping;
    }

    get(endpoint, handler) {
        let mapping = this.mappings[GET] || {};
        mapping[endpoint] = handler;
        this.mappings[GET] = mapping;
    }

    private createReq(data = {}) {
        return {body: data};
    }

    private createRes() {
        let curData;

        return {
            send: (d) => {
                curData = d;
            },
            end: () => {

            },
            getData: () => curData,
        };
    }

    async callPost(endpoint, data) {
        return await this.call(POST, endpoint, data);
    }

    async callGet(endpoint, data) {
        return await this.call(GET, endpoint, data);
    }

    async call(method, endpoint, data = {}) {
        let methodEntry = this.mappings[method];

        if (!methodEntry) {
            throw 'Invalid Method: ' + method;
        }

        let endpointHandler = methodEntry[endpoint];

        if (!endpointHandler) {
            throw 'Invalid Endpoint: ' + method + ':' + endpoint;
        }

        let req = this.createReq(data);
        let res = this.createRes();

        await endpointHandler(req, res);

        return Promise.resolve(res);
    }

    hasPost(endpoint) {
        return (this.mappings[POST].hasOwnProperty(endpoint));
    }

    hasGet(endpoint) {
        return (this.mappings[GET].hasOwnProperty(endpoint));
    }
}


describe('ApiRouter endpoints', () => {
    let mockApp = new MockApp();
    let mockRouter = new ApiRouter();
    // @ts-ignore
    mockRouter.createApp(mockApp);

    it('should expose createWorld api', () => {

        expect(mockApp.hasPost('/api/model')).toBeTruthy();
    });


});

describe('endpoint spec', () => {
    let mockApp = new MockApp();
    let mockRouter = new ApiRouter();
    // @ts-ignore
    mockRouter.createApp(mockApp);


    function createModel({worlds}) {
        return {
            epistemicModel: {
                worlds
            }
        };
    }


    it('should create world with raw data', async () => {

        // Custom Description raw data input
        let customDescData = createModel({
            worlds: [
                {
                    name: 'Hello',
                    props: ['test']
                }
            ]
        });


        let res = await mockApp.callPost('/api/model', customDescData);

        // No Output
        expect(res.getData()).toBeUndefined();

    });


});
