import {Formula} from '../models/formula/formula';
import WebSocketClient from './websocket-client';
import FormData from 'form-data';
import fetch from 'node-fetch';
const SERVER_LOCATION = 'localhost:7015';

export class LazyModelFetcher {
    private ws: WebSocketClient;
    private readonly connected: Promise<void>;
    private locked: boolean;
    public is_finished: boolean;

    constructor(ws: WebSocketClient, connected: Promise<void>) {
        this.ws = ws;
        this.connected = connected;
        this.locked = false;
        this.is_finished = false;
    }

    async fetchModels(n: number): Promise<string[][]> {
        if (this.locked) {
            return [];
        }
        this.locked = true;
        await this.connected;

        this.is_finished = !this.ws.connected;

        for (let i = 0; i < n; i++) {
            try {
                this.ws.send('{"stdin":"\\r\\n"}');
            } catch (e) {
                return [];
            }
        }
        // this.ws.send('{"stdin":"\\r\\n"}');

        let line = '';
        let true_props: string[] = undefined;
        let res: string[][] = [];

        while (true) {
            try {
                let v = await this.ws.receive();
                console.log(v);
                v = JSON.parse(v);
                if (v.type != 'stdout') {
                    console.log(v);
                    break;
                }
                line = v.msg;
            } catch (e) {
                break;
            }

            if (line.startsWith('unsat')) {
                break;
            }

            let isEnd = line.startsWith('==');

            if (isEnd) {
                if (true_props !== undefined) {
                    res.push(true_props);
                }
                true_props = undefined;

                // Hack for line breaks? Not sure what causes this
                // But continue line has proposition on it
                let lineSplit = line.split('(y/n) ');

                if (lineSplit.length === 2) {
                    line = lineSplit[1];
                } else {
                    if (res.length == n) {
                        break;
                    }

                    // this.ws.send('{"stdin":"\\r\\n"}');
                    continue;
                }
            }

            let s = line.split(' ');
            if (s.length != 2) {
                continue;
            }
            if (s[0] == '1') {
                if (true_props === undefined) {
                    true_props = [];
                }
                true_props.push(s[1]);
            }

            if (isEnd) {
                if (res.length == n) {
                    break;
                }
            }

        }
        if (true_props !== undefined) {
            res.push(true_props);
        }
        this.locked = false;
        return res;
    }
}

export class TouistService {
    static lazyModelFetcher(req: Formula, formString: String): LazyModelFetcher {

        if (formString === undefined) {
            formString = req.prettyPrint();
        }

        let ws = new WebSocketClient();
        let connected = ws.connect(`ws://${SERVER_LOCATION}/touist_ws`).then(() =>
            ws.send(
                JSON.stringify({
                    args: '--solve --interactive',
                    stdin: formString
                })
            )
        );

        return new LazyModelFetcher(ws, connected);
    }

    static async fetchModel(req: Formula): Promise<string[]> {
        let data = new FormData();
        data.append('args', '--solve');
        data.append('stdin', req.prettyPrint());

        let methodInit = {
            method: 'POST',
            body: data
        };

        let response = await fetch(`http://${SERVER_LOCATION}/touist_cmd`, methodInit);
        let text = await response.text();
        if (text.startsWith('unsat')) {
            return [];
        }
        let true_props = [];
        for (let line of text.split('\n')) {
            let s = line.split(' ');
            if (s[0] == '1') {
                true_props.push(s[1]);
            }
        }
        return true_props;
    }

    static async fetchModels(reqStr: string, limit: number = 10000000): Promise<string[][]> {
        let data = new FormData();

        let args = '--solve';
        args += ' --limit=' + limit;

        data.append('args', args);
        data.append('stdin', reqStr);

        // console.log(reqStr);

        let methodInit = {
            method: 'POST',
            body: data
        };

        let response = await fetch(`http://${SERVER_LOCATION}/touist_cmd`, methodInit);
        let text = await response.text();
        if (text.startsWith('unsat')) {
            return [];
        }

        let res = [];
        let true_props = undefined;
        for (let line of text.split('\n')) {
            if (line.startsWith('unsat')) {
                break;
            }
            if (line.startsWith('==== model')) {
                if (true_props !== undefined) {
                    res.push(true_props);
                }
                true_props = [];
                continue;
            }
            let s = line.split(' ');
            if (s.length != 2) {
                continue;
            }
            if (s[0] == '1') {
                if (s[1].indexOf('\r') >= 0) {
                    s[1] = s[1].replace('\r', '');
                }

                true_props.push(s[1]);
            }
        }
        if (true_props !== undefined) {
            res.push(true_props);
        }
        return res;
    }

    static async parse(text)
    {
        if (text.startsWith('unsat')) {
            return [];
        }

        let res = [];
        let true_props = undefined;
        for (let line of text.split('\n')) {
            if (line.indexOf('\r') > 0)
                line = line.replace('\r', '');

            if (line.startsWith('unsat')) {
                break;
            }
            if (line.startsWith('==== model')) {
                if (true_props !== undefined) {
                    res.push(true_props);
                }
                true_props = [];
                continue;
            }
            let s = line.split(' ');
            if (s.length != 2) {
                continue;
            }
            if (s[0] == '1') {
                if (s[1].indexOf('\r') >= 0) {
                    s[1] = s[1].replace('\r', '');
                }

                true_props.push(s[1]);
            }
        }
        if (true_props !== undefined) {
            res.push(true_props);
        }
        return res;
    }
}
